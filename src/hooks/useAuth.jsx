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
      const { data: existing } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', authUser.id)

      if (!existing || existing.length === 0) {
        await supabase.from('users').insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name ?? null,
          phone: authUser.user_metadata?.phone ?? null,
          role: authUser.user_metadata?.role ?? 'client',
        })

        const { data: newRow } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)

        setRole(newRow?.[0]?.role ?? null)
      } else {
        setRole(existing[0].role)
      }
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
