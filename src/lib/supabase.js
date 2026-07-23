import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  )
}

// Single shared Supabase client instance.
// Never import createClient directly in other files —
// always import this supabase instance instead.
// Never use the service_role key here — anon key only.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage so users stay logged in
    // across page refreshes
    persistSession: true,
    // Automatically refresh the JWT token before it expires
    autoRefreshToken: true,
    // Detect session from URL hash after OAuth redirects
    detectSessionInUrl: true,
  },
})
