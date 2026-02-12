import { useNavigate } from 'react-router-dom'

export default function Header({ role }) {
  const navigate = useNavigate()
  
  const roleNames = {
    client: 'Pet Care',
    walker: 'Walker',
    admin: 'Admin'
  }
  
  return (
    <header className="bg-white px-5 py-3 flex items-center justify-between sticky top-0 z-50" style={{boxShadow: '0 2px 12px rgba(45,52,54,0.12), 0 2px 6px rgba(91,75,138,0.08)'}}>
      <div className="flex items-center gap-3">
        <div className="font-handwritten text-3xl font-semibold text-indigo">
          FetchUs
        </div>
        <span className="text-xs text-charcoal-light font-semibold">
          {roleNames[role]}
        </span>
      </div>
      <button 
        onClick={() => navigate('/')}
        className="w-10 h-10 rounded-full bg-cream flex items-center justify-center hover:bg-cream-dark transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
    </header>
  )
}
