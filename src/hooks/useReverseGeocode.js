import { useState, useEffect, useRef } from 'react'

// useReverseGeocode — turns { lat, lng } into a human-readable address
// using OpenStreetMap's free Nominatim API. No API key required.
// Debounced so it doesn't fire on every single pixel of map drag.

export function useReverseGeocode(coords, delayMs = 600) {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!coords) return

    setLoading(true)
    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              // Nominatim usage policy asks for an identifying header
              'Accept-Language': 'en',
            },
          }
        )
        const data = await res.json()

        if (data?.display_name) {
          // Trim to a shorter, more readable form — first 2-3 segments
          const parts = data.display_name.split(',').map(p => p.trim())
          const short = parts.slice(0, 3).join(', ')
          setAddress(short)
        } else {
          setAddress('Unknown location')
        }
      } catch (err) {
        setAddress('Unable to determine address')
      } finally {
        setLoading(false)
      }
    }, delayMs)

    return () => clearTimeout(debounceRef.current)
  }, [coords?.lat, coords?.lng, delayMs])

  return { address, loading }
}
