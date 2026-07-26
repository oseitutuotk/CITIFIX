import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Build Gemini prompt
    const prompt = `You are an AI assistant for CitiFix, a municipal issue reporting system in Ghana.
Analyse this citizen report and return a JSON object with these exact fields:
- title: A short clear title (max 10 words)
- ai_summary: A single concise sentence summary for assembly staff (max 20 words)
- ai_category: Specific infrastructure category (e.g. "Road Damage", "Street Lighting", "Drainage Blockage")
- ai_severity: Exactly one of: Low, Medium, or High
- ai_priority: Integer from 1 to 5 (5 most urgent)
- ai_tags: Array of 3-5 short descriptive tags
- ai_department: Most relevant department (e.g. "Roads & Transport Department", "Water & Sanitation Department", "Electrical Department", "Waste Management Department")
- moderation_flag: true if inappropriate content, false otherwise

Report:
Category: ${report.category}
${report.custom_category ? 'Custom category: ' + report.custom_category : ''}
Description: ${report.description}
Location: ${report.location_name || 'Not specified'}

Return ONLY a valid JSON object. No markdown, no backticks, no explanation.`

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    console.log('Calling Gemini API...')

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text()
      console.error('Gemini API error:', geminiResponse.status, errText)
      throw new Error('Gemini API error: ' + geminiResponse.status)
    }

    const geminiData = await geminiResponse.json()
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
