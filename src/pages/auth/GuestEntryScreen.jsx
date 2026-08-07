import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

export default function GuestEntryScreen() {
  const { enterGuestMode } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    enterGuestMode()
    navigate('/', { replace: true })
  }, [enterGuestMode, navigate])

  return null
}
