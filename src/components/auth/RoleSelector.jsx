import { useNavigate } from 'react-router-dom'
import FetchUsLogo from '../FetchUsLogo'

export default function RoleSelector() {
  const navigate = useNavigate()
  
  const roles = [
    { id: 'client', label: 'Pet Parent', path: '/client', icon: 'dog' },
    { id: 'walker', label: 'Walker', path: '/walker', icon: 'walk' },
    { id: 'admin', label: 'Admin', path: '/admin', icon: 'shield' }
  ]
  
  const icons = {
    dog: <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>,
    walk: <><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 text-center">
      <div className="mb-12 flex flex-col items-center">
        <FetchUsLogo className="h-20 w-auto mb-4" />
        <p className="text-charcoal-light text-lg">
          Professional Dog Walking & Pet Care
        </p>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => navigate(role.path)}
            className="w-full bg-white p-6 rounded-2xl flex items-center gap-4 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
            style={{boxShadow: '0 2px 12px rgba(45,52,54,0.12)'}}
          >
            <div className="w-12 h-12 rounded-full bg-indigo/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {icons[role.icon]}
              </svg>
            </div>
            <span className="text-xl font-bold text-charcoal">{role.label}</span>
          </button>
        ))}
      </div>
      
      <p className="mt-12 text-sm text-charcoal-light">
        Select your role to continue
      </p>
    </div>
  )
}
