import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        syncAndFetchRole(session.user)
      } else {
        setLoading(false)
      }
    }).catch(() => {
      if (mounted) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        syncAndFetchRole(session.user)
      } else {
        setRole(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function syncAndFetchRole(authUser) {
    try {
      // Check if a row exists by email (may have been pre-created by admin)
      const { data: existing } = await supabase
        .from('users')
        .select('id, role, email')
        .eq('email', authUser.email)
        .maybeSingle()

      if (existing && existing.id !== authUser.id) {
        // Row exists but id doesn't match auth -- update it
        await supabase
          .from('users')
          .update({ id: authUser.id })
          .eq('email', authUser.email)
      }

      if (!existing) {
        // No row at all -- insert with default client role
        await supabase.from('users').insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name ?? null,
          phone: authUser.user_metadata?.phone ?? null,
          role: authUser.user_metadata?.role ?? 'client',
        })
      }

      // Now fetch role by auth id
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .maybeSingle()

      setRole(data?.role ?? null)
    } catch (err) {
      console.error('syncAndFetchRole error:', err)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  async function signInWithMagicLink(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
