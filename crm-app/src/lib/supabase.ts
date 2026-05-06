import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'sa' | 'ccc' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  employee_code: string | null
  phone: string | null
  department: string | null
  pic_name: string | null
  branch: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AppUser {
  id: string
  email: string
  role: UserRole
  full_name: string
  pic_name: string
  profile: UserProfile | null
}
