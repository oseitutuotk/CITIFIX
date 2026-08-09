import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchAndCompressPhoto(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Photo fetch failed with status ${response.status}`)
  }

  const mimeType = response.headers.get('content-type') || 'image/jpeg'
  const sourceBuffer = await response.arrayBuffer()
  let finalBuffer = sourceBuffer
  let finalMimeType = mimeType

  if (typeof createImageBitmap === 'function' && typeof OffscreenCanvas === 'function') {
    try {
      const bitmap = await createImageBitmap(new Blob([sourceBuffer], { type: mimeType }))
      const maxDimension = 1200
      let width = bitmap.width
      let height = bitmap.height

      if (Math.max(width, height) > maxDimension) {
        const scale = maxDimension / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }

      const canvas = new OffscreenCanvas(width, height)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, width, height)
        const compressedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 })
        finalBuffer = await compressedBlob.arrayBuffer()
        finalMimeType = compressedBlob.type || 'image/jpeg'
      }
    } catch (err) {
      console.error('Image compression failed, using original image:', err)
    }
  }

  const base64 = btoa(String.fromCharCode(...new Uint8Array(finalBuffer)))
  return {
    inline_data: { mime_type: finalMimeType, data: base64 }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const report_id = body.report_id

    if (!report_id) {
      return new Response(
        JSON.stringify({ error: 'report_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    )

    // Fetch the report
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', report_id)
      .single()

    if (fetchError || !report) {
      console.error('Fetch error:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing report:', report_id, 'category:', report.category)

    // Fetch photos for this report, limit to 2 for Gemini vision
    const { data: photos } = await supabase
      .from('report_photos')
      .select('storage_url')
      .eq('report_id', report_id)
      .limit(2)

    // Download, optionally compress, and convert photos to base64 for Gemini vision
    const imageParts = []
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        try {
          const photoPart = await fetchAndCompressPhoto(photo.storage_url)
          imageParts.push(photoPart)
        } catch (err) {
          console.error('Photo fetch error:', err)
        }
      }
    }

    const hasPhotos = imageParts.length > 0

    // Build Gemini prompt
    const prompt = `You are an AI assistant for CitiFix, a municipal issue reporting system in Ghana.
${hasPhotos ? 'Analyse the provided photo(s) alongside the report details below.' : ''}
Analyse this citizen report text and any attached images to evaluate the issue accurately and return a JSON object with these exact fields:
- title: A short clear title (max 10 words)
- ai_summary: A single concise sentence summary for assembly staff (max 20 words)
- ai_category: Specific infrastructure category (e.g. "Road Damage", "Street Lighting", "Drainage Blockage")
- ai_severity: Exactly one of: Low, Medium, or High
- ai_priority: Urgent rating from 1 (lowest priority) to 5 (critical/life-threatening safety hazard) (integer)
- ai_tags: Array of 3-5 short descriptive tags
- ai_department: Most relevant department (e.g. "Roads & Transport Department", "Water & Sanitation Department", "Electrical Department", "Waste Management Department")
- moderation_flag: true if the report contains spam, offensive language, abusive text, or non-civic content; false otherwise (boolean)

Evaluation Rules:
1. Cross-reference visual details from any attached image(s) with the text description to confirm severity and details.
2. If description details are vague, rely on visual evidence if available.

Report:
Category: ${report.category}
${report.custom_category ? 'Custom category: ' + report.custom_category : ''}
Description: ${report.description}
Location: ${report.location_name || 'Not specified'}

Return ONLY a valid JSON object. No markdown, no backticks, no explanation.`

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    console.log('Calling Gemini API...')

    // Retry Gemini up to 3 times with increasing delays
    let geminiData = null
    let lastError = ''

    for (let attempt = 1; attempt <= 3; attempt++) {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [...imageParts, { text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
          }),
        }
      )

      if (geminiResponse.ok) {
        geminiData = await geminiResponse.json()
        break
      }

      const errText = await geminiResponse.text()
      lastError = `${geminiResponse.status}: ${errText}`
      console.error(`Gemini attempt ${attempt} failed:`, lastError)

      if (attempt < 3) {
        // Wait before retrying: 2s, then 4s
        await new Promise((r) => setTimeout(r, attempt * 2000))
      }
    }

    if (!geminiData) {
      throw new Error(`Gemini failed after 3 attempts: ${lastError}`)
    }

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    console.log('Gemini raw response:', rawText)

    if (!rawText) {
      throw new Error('No response text from Gemini')
    }

    // Clean the response in case Gemini adds backticks despite instructions
    const cleaned = rawText.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    const aiResult = JSON.parse(cleaned)

    // Normalise severity
    const severityRaw = (aiResult.ai_severity || 'medium').toLowerCase()
    const severity = severityRaw === 'high' ? 'High' : severityRaw === 'low' ? 'Low' : 'Medium'

    // Clamp priority to 1-5
    const priority = Math.min(5, Math.max(1, parseInt(aiResult.ai_priority) || 3))

    console.log('AI result - title:', aiResult.title, 'severity:', severity, 'priority:', priority)

    // Update report with AI fields
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        title: aiResult.title || null,
        ai_summary: aiResult.ai_summary || null,
        ai_category: aiResult.ai_category || null,
        ai_severity: severity,
        ai_priority: priority,
        ai_tags: aiResult.ai_tags || [],
        ai_department: aiResult.ai_department || null,
        status: aiResult.moderation_flag === true ? 'Rejected' : 'Pending',
      })
      .eq('id', report_id)

    if (updateError) {
      console.error('Update error:', updateError)
      throw new Error('Failed to update report: ' + updateError.message)
    }

    console.log('Report updated successfully')

    return new Response(
      JSON.stringify({ success: true, report_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Edge Function error:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
