import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// ─── Supabase check ───────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const isSupabaseConfigured = SUPABASE_URL.startsWith('https://') && SUPABASE_KEY.length > 20

// ─── Mock fallback ────────────────────────────────────────────────────────────
const mockUsers: User[] = [
  { id: '1', email: 'hirvraj.gohil@gmail.com', name: 'Hirvraj Gohil', role: 'admin', createdAt: new Date() },
  { id: '2', email: 'raunak.bhandari@company.com', name: 'Raunak Bhandari', role: 'sales_manager', createdAt: new Date() },
  { id: '3', email: 'jayesh.garg@company.com', name: 'Jayesh Garg', role: 'sales_executive', createdAt: new Date() },
]
const mockPasswords: Record<string, string> = {
  'hirvraj.gohil@gmail.com': bcrypt.hashSync('Harsh@leadiq789', 10),
  'raunak.bhandari@company.com': bcrypt.hashSync('demo123', 10),
  'jayesh.garg@company.com': bcrypt.hashSync('demo123', 10),
}

// ─── JWT helpers ──────────────────────────────────────────────────────────────
export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  if (isSupabaseConfigured) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) throw error

      // Fetch profile from users table
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      return profile
        ? { id: profile.id, email: profile.email, name: profile.name, role: profile.role, createdAt: new Date(profile.created_at) }
        : { id: data.user.id, email: data.user.email!, name: data.user.email!, role: 'sales_executive', createdAt: new Date() }
    } catch (e) {
      console.warn('[auth] Supabase auth failed, trying mock:', e)
    }
  }

  // Mock fallback
  const user = mockUsers.find(u => u.email === email)
  if (!user) return null
  const isValid = await bcrypt.compare(password, mockPasswords[email] || '')
  return isValid ? user : null
}

export async function createUser(userData: {
  name: string
  email: string
  password: string
  role: User['role']
}): Promise<User> {
  if (isSupabaseConfigured) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })
      if (error || !data.user) throw error

      // Insert profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({ id: data.user.id, email: userData.email, name: userData.name, role: userData.role })
        .select()
        .single()
      if (profileError) throw profileError

      return { id: profile.id, email: profile.email, name: profile.name, role: profile.role, createdAt: new Date(profile.created_at) }
    } catch (e) {
      console.warn('[auth] Supabase createUser failed, using mock:', e)
    }
  }

  // Mock fallback
  if (mockUsers.find(u => u.email === userData.email)) throw new Error('User already exists')
  const hashed = await bcrypt.hash(userData.password, 10)
  const newUser: User = {
    id: (mockUsers.length + 1).toString(),
    email: userData.email,
    name: userData.name,
    role: userData.role,
    createdAt: new Date(),
  }
  mockUsers.push(newUser)
  mockPasswords[userData.email] = hashed
  return newUser
}

export function getUserById(id: string): User | null {
  return mockUsers.find(u => u.id === id) || null
}
