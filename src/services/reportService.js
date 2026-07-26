import { supabase } from '../lib/supabase.js'

// ── Upload photos to Supabase Storage ─────────────────────────────────────────
// Takes an array of local object URLs (from URL.createObjectURL),
// converts them back to Blobs, and uploads to the report-photos bucket.
// Returns an array of public storage URLs.

async function uploadPhotos(photoUrls, userId, reportId) {
  if (!photoUrls || photoUrls.length === 0) return []

  const uploadedUrls = []

  for (const url of photoUrls) {
    try {
      // Convert object URL back to a Blob for upload
      const response = await fetch(url)
      const blob = await response.blob()

      // Folder structure: {userId}/{reportId}/{timestamp}.jpg
      // Guest uploads go under 'guest' folder
      const folder = userId || 'guest'
      const filename = `${folder}/${reportId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

      const { data, error } = await supabase.storage
        .from('report-photos')
        .upload(filename, blob, {
          contentType: blob.type || 'image/jpeg',
          upsert: false,
        })

      if (error) {
        console.error('Photo upload error:', error.message)
        continue // Skip failed uploads, don't block the whole submission
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('report-photos')
        .getPublicUrl(data.path)

      uploadedUrls.push(publicUrl)
    } catch (err) {
      console.error('Photo processing error:', err)
      continue
    }
  }

  return uploadedUrls
}

// ── Submit a new report ────────────────────────────────────────────────────────
// reportData — from ReportContext
// userId     — from AuthContext (null if guest)
// deviceId   — from localStorage (for guest report linking)

export async function submitReport(reportData, userId, deviceId) {
  // Step 1 — Generate a report ID upfront so we can use it for photo paths
  const reportId = crypto.randomUUID()

  // Step 2 — Upload photos first (if any)
  const photoUrls = await uploadPhotos(reportData.photos, userId, reportId)

  // Step 3 — Insert the report row
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .insert({
      id: reportId,
      user_id: userId || null,
      device_id: userId ? null : deviceId,
      category: reportData.category,
      custom_category: reportData.customCategory || null,
      title: null,              // AI will generate this via Edge Function
      description: reportData.description,
      location_name: reportData.locationName || null,
      coords_lat: reportData.coords?.lat || null,
      coords_lng: reportData.coords?.lng || null,
      status: 'Processing',
      is_public: true,
    })
    .select()
    .single()

  if (reportError) {
    console.error('Report insert error:', reportError.message)
    return { data: null, error: reportError }
  }

  // Step 4 — Insert photo records (if any uploaded successfully)
  if (photoUrls.length > 0) {
    const photoRecords = photoUrls.map((url) => ({
      report_id: reportId,
      storage_url: url,
    }))

    const { error: photoError } = await supabase
      .from('report_photos')
      .insert(photoRecords)

    if (photoError) {
      // Non-fatal — report is created, photos just didn't save
      console.error('Photo records insert error:', photoError.message)
    }
  }

  // Step 5 — Call the Edge Function to process with Gemini AI
  const { data: fnData, error: fnError } = await supabase.functions.invoke('process-report', {
    body: { report_id: reportId },
  })

  if (fnError) {
    console.error('Edge Function error:', fnError)
  } else {
    console.log('Edge Function response:', fnData)
  }

  return { data: report, error: null }
}

// ── Fetch all reports for the current user ────────────────────────────────────
export async function fetchUserReports(userId) {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      report_photos (storage_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch reports error:', error.message)
    return { data: null, error }
  }

  return { data, error: null }
}

// ── Fetch a single report by ID ───────────────────────────────────────────────
export async function fetchReportById(reportId) {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      report_photos (storage_url),
      admin_updates (*),
      comments (*)
    `)
    .eq('id', reportId)
    .single()

  if (error) {
    console.error('Fetch report error:', error.message)
    return { data: null, error }
  }

  return { data, error: null }
}

// ── Toggle public/private on a report ────────────────────────────────────────
export async function toggleReportVisibility(reportId, isPublic) {
  const { data, error } = await supabase
    .from('reports')
    .update({ is_public: isPublic })
    .eq('id', reportId)
    .select()
    .single()

  return { data, error }
}

// ── Submit a comment on a report ──────────────────────────────────────────────
export async function submitComment(reportId, userId, body) {
  const { data, error } = await supabase
    .from('comments')
    .insert({ report_id: reportId, user_id: userId, body })
    .select()
    .single()

  return { data, error }
}
