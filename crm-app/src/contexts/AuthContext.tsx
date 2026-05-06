import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, type AppUser, type UserRole, type UserProfile } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: AppUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(session: Session): Promise<AppUser> {
    const metaRole = session.user.user_metadata?.role as UserRole
    const fallback: AppUser = {
      id: session.user.id,
      email: session.user.email || '',
      role: metaRole || 'sa',
      full_name: '',
      pic_name: '',
      profile: null,
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      const p = profile as UserProfile
      return {
        id: p.id,
        email: p.email || session.user.email || '',
        role: p.role || metaRole || 'sa',
        full_name: p.full_name || '',
        pic_name: p.pic_name || '',
        profile: p,
      }
    }
    return fallback
  }

  async function initSession(session: Session | null) {
    setSession(session)
    if (session) {
      const appUser = await fetchProfile(session)
      setUser(appUser)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      initSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      initSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setSession(null)
  }

  async function refreshProfile() {
    if (session) {
      const appUser = await fetchProfile(session)
      setUser(appUser)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
