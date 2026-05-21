'use client'

// Client-side auth helpers (no Supabase dependency)

export async function signUp(email: string, password: string, name: string) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  })
  return res.json()
}

export async function signIn(email: string, password: string) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

export async function signOut() {
  await fetch('/api/auth/logout', { method: 'POST' })
}

export async function getMe() {
  const res = await fetch('/api/auth/me')
  return res.json()
}
