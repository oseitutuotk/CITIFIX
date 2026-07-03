import { useState, useEffect } from 'react'

// useGeolocation — wraps the browser Geolocation API.
// Requests permission immediately on mount.
// Returns { coords, loading, error, refetch }

export function useGeolocation() {
  const [coords, setCoords] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function fetchLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Request location automatically when the hook mounts
  useEffect(() => {
    fetchLocation()
  }, [])

  return { coords, loading, error, refetch: fetchLocation }
}