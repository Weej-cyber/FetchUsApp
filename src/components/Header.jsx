import { useNavigate } from 'react-router-dom'
import FetchUsLogo from './FetchUsLogo'

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
        <FetchUsLogo className="h-[50px] w-auto" />
        <span className="text-xs text-charcoal-light font-semibold">
          {roleNames[role] || 'Home'}
        </span>
      </div>
      <button 
        onClick={() => navigate('/')}
        className="text-xs bg-indigo text-white px-4 py-2 rounded-md hover:bg-indigo-dark transition-all font-medium">
        Switch Role
      </button>
    </header>
  )
}
