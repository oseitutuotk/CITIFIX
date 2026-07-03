import { useState, useRef } from 'react'

// useLocationSearch — searches for places by name using Nominatim.
// Restricted to Ghana (countrycodes=gh) to keep results relevant.

export function useLocationSearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  function search(query) {
    clearTimeout(debounceRef.current)

    if (!query || query.trim().length < 3) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&countrycodes=gh&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        setResults(data || [])
      } catch (err) {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  function clearResults() {
    setResults([])
  }

  return { results, loading, search, clearResults }
}
