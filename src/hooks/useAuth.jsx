import { useState, createContext, useContext } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null)

  function signOut() {
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user: null, role, setRole, loading: false, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
