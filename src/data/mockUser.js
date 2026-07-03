// Mock logged-in user
// Field names mirror what Supabase auth.users + a profiles table will return.
// When we integrate Supabase, this gets replaced by a useUser() hook —
// the screens themselves won't need to change.

const mockUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  full_name: 'Kwabena Mensah',
  email: 'kwabena.mensah@email.com',
  avatar_url: null,
  ward: 'Ward 3',
  assembly: 'Okaikwei North Municipal Assembly',
  created_at: '2023-09-01T08:00:00.000Z',
  stats: {
    total: 12,
    resolved: 8,
    pending: 4,
  },
}

export default mockUser