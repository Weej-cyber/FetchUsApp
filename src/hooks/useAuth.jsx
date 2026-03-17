import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRoleState] = useState(null)
  const [dbRole, setDbRole] = useState(false)
  const [loading, setLoading] = useState(true)
  const manualRole = useRef(false)

  function setRole(r) {
    manualRole.current = true
    setRoleState(r)
  }

  async function handleSession(session) {
    if (!session) {
      setUser(null)
      setRoleState(null)
      setDbRole(false)
      manualRole.current = false
      setLoading(false)
      return
    }

    setUser(session.user)

    if (manualRole.current) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()

    if (error) {
      console.error('Role lookup failed:', error.message)
      setRoleState('client')
      setDbRole(false)
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
      setRoleState('client')
      setDbRole(false)
    } else {
      setRoleState(data.role)
      setDbRole(data.role === 'admin')
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
    manualRole.current = false
    supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, role, setRole, dbRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
