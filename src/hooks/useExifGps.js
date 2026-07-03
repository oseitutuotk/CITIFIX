import { useState } from 'react'
import exifr from 'exifr'

// useExifGps — extracts GPS coordinates from a photo File's EXIF metadata.
// Returns { extractGps, coords, hasExif, loading }
//
// extractGps(file) — call this when a photo is added in Step 1.
// If the file has GPS EXIF data, coords is set to { lat, lng }.
// hasExif is true only when GPS was successfully found.
// If no GPS data exists (e.g. screenshot, GPS disabled), hasExif stays false
// and coords stays null — no side effects.

export function useExifGps() {
  const [coords, setCoords] = useState(null)
  const [hasExif, setHasExif] = useState(false)
  const [loading, setLoading] = useState(false)

  async function extractGps(file) {
    if (!file) return

    setLoading(true)
    try {
      // exifr.gps() returns { latitude, longitude } or undefined
      const gps = await exifr.gps(file)

      if (gps?.latitude && gps?.longitude) {
        const extracted = { lat: gps.latitude, lng: gps.longitude }
        setCoords(extracted)
        setHasExif(true)
        return extracted
      } else {
        // No GPS in this photo — reset so a previous photo's coords
        // don't carry over incorrectly
        setHasExif(false)
        return null
      }
    } catch (err) {
      // EXIF parsing failed silently — not a critical error
      setHasExif(false)
      return null
    } finally {
      setLoading(false)
    }
  }

  function clearExif() {
    setCoords(null)
    setHasExif(false)
  }

  return { extractGps, coords, hasExif, loading, clearExif }
}
