import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  async function handleSession(session) {
    if (!session) {
      setUser(null)
      setRole(null)
      setLoading(false)
      return
    }

    setUser(session.user)

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    if (error) {
      console.error('Role lookup failed:', error.message)
      setRole('client')
      setLoading(false)
      return
    }

    if (!data) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email,
          name: '',
          phone: '',
          role: 'client',
        })
      if (insertError) {
        console.error('Failed to create user row:', insertError.message)
      }
      setRole('client')
    } else {
      setRole(data.role)
    }

    setLoading(false)
  }

  useEffect(() => {
    const hasAuthInUrl = window.location.hash.includes('access_token') ||
                         window.location.search.includes('code=')

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleSession(session)
      } else if (!hasAuthInUrl) {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  function signOut() {
    supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, role, setRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
