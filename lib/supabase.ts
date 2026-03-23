import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Service role client — bypasses RLS, server-side only
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : supabase

// Client-side Supabase client
export const createClientComponentClient = () => 
  createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client
export const createServerComponentClient = () => 
  createClient<Database>(supabaseUrl, supabaseAnonKey)