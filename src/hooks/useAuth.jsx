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
      .select('role, is_active')
      .eq('id', session.user.id)
      .maybeSingle()

    if (error) {
      console.error('Role lookup failed:', error.message)
      // Fall back to metadata role if DB lookup fails
      const metaRole = session.user.user_metadata?.role || 'client'
      setRoleState(metaRole)
      setDbRole(metaRole === 'admin')
      setLoading(false)
      return
    }

    if (data && data.is_active === false) {
      await supabase.auth.signOut()
      setUser(null)
      setRoleState(null)
      setDbRole(false)
      setLoading(false)
      return
    }

    if (!data) {
      const invitedRole = session.user.user_metadata?.role || 'client'
      const invitedName = session.user.user_metadata?.name || ''
      const invitedPhone = session.user.user_metadata?.phone || ''

      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email,
          name: invitedName,
          phone: invitedPhone,
          role: invitedRole,
        })
      if (insertError) {
        console.error('Failed to create user row:', insertError.message)
      }

      if (invitedRole === 'client') {
        const invitedSecondaryName = session.user.user_metadata?.secondary_name || ''
        const invitedSecondaryPhone = session.user.user_metadata?.secondary_phone || ''
        const invitedSecondaryEmail = session.user.user_metadata?.secondary_email || ''
        const invitedSecondaryConsent = session.user.user_metadata?.secondary_sms_consent || false

        // The handle_new_client trigger already created a bare clients row
        // (user_id only) the instant the users insert above ran, so this
        // must be an update, not an insert -- an insert here always hit
        // the unique constraint on user_id and silently failed, meaning
        // address/secondary-contact info from the invite was never saved.
        const { error: clientInsertError } = await supabase
          .from('clients')
          .update({
            secondary_name: invitedSecondaryName || null,
            secondary_phone: invitedSecondaryPhone || null,
            secondary_email: invitedSecondaryEmail || null,
            secondary_sms_consent: invitedSecondaryConsent,
            secondary_sms_consent_at: invitedSecondaryConsent ? new Date().toISOString() : null,
          })
          .eq('user_id', session.user.id)
        if (clientInsertError) {
          console.error('Failed to create client row:', clientInsertError.message)
        }
      }

      setRoleState(invitedRole)
      setDbRole(invitedRole === 'admin')
    } else {
      setRoleState(data.role)
      setDbRole(data.role === 'admin')
    }

    setLoading(false)
  }

  useEffect(() => {
    const hasAuthInUrl = window.location.hash.includes('access_token') ||
                         window.location.search.includes('code=')

    // Safety net: if loading hasn't cleared in 5 seconds, force it off
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

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

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
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
