import { useState, useEffect, useRef } from 'react'

// useGeolocation — wraps the browser Geolocation API.
// Requests permission immediately on mount.
// Returns { coords, loading, error, refetch }

export function useGeolocation() {
  const [coords, setCoords] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const refetchPromiseRef = useRef(null)

  function fetchLocation() {
    setLoading(true)
    setError(null)

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser.')
        setLoading(false)
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setCoords(newCoords)
          setLoading(false)
          resolve(newCoords)
        },
        (err) => {
          setError(err.message)
          setLoading(false)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  // Request location automatically when the hook mounts
  useEffect(() => {
    fetchLocation()
  }, [])

  return { coords, loading, error, refetch: fetchLocation }
}