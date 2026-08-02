import { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { getDeviceId } from '../lib/deviceId.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      const { data: userData } = await supabase.auth.getUser()
      if (userData?.user) {
        return {
          id: userData.user.id,
          full_name: userData.user.user_metadata?.full_name || '',
          email: userData.user.email,
          ward: null,
          assembly: 'Okaikwei North Municipal Assembly',
        }
      }
      return null
    }
    return data
  }

  // Links any guest reports (by device_id) to the newly authenticated user
  async function linkGuestReports(userId) {
    const deviceId = getDeviceId()
    if (!deviceId) return
    const { error } = await supabase
      .from('reports')
      .update({ user_id: userId, device_id: null })
      .eq('device_id', deviceId)
      .is('user_id', null)
    if (error) console.error('Guest report linking error:', error.message)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const p = await fetchProfile(session.user.id)
        setProfile(p)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const p = await fetchProfile(session.user.id)
          setProfile(p)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (!error && data?.user) await linkGuestReports(data.user.id)
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error && data?.user) await linkGuestReports(data.user.id)
    return { data, error }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (!error) { setUser(null); setProfile(null) }
    return { error }
  }

  async function updateProfile(fields) {
    if (!user) return { error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('profiles')
      .update(fields)
      .eq('id', user.id)
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuest: !user,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
