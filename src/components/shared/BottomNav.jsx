import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav({ role }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  
  const clientNav = [
    { path: '/client', icon: 'home', label: 'Home' },
    { path: '/client/book', icon: 'calendar', label: 'Book', primary: true },
    { path: '/client/dogs', icon: 'dog', label: 'Dogs' },
    { path: '/client/profile', icon: 'user', label: 'Profile' }
  ]
  
  const walkerNav = [
    { path: '/walker', icon: 'home', label: 'Today' },
    { path: '/walker/history', icon: 'calendar', label: 'History' }
  ]
  
  const adminNav = [
    { path: '/admin', icon: 'dashboard', label: 'Dashboard' },
    { path: '/admin/requests', icon: 'file', label: 'Requests' },
    { path: '/admin/schedule', icon: 'calendar', label: 'Schedule' },
    { path: '/admin/clients', icon: 'users', label: 'Clients' }
  ]
  
  const navItems = role === 'client' ? clientNav : role === 'walker' ? walkerNav : adminNav
  
  const icons = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    dog: <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    dashboard: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>
  }
  
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/85 backdrop-blur-lg flex justify-around py-3 z-50"
         style={{boxShadow: '0 -4px 16px rgba(45,52,54,0.15), 0 -2px 8px rgba(91,75,138,0.1)'}}>
      {navItems.map(item => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
            item.primary 
              ? 'bg-indigo text-white shadow-lg' 
              : isActive(item.path)
                ? 'bg-indigo/10 text-indigo'
                : 'text-charcoal-light hover:bg-cream'
          }`}
        >
          <svg className={`${item.primary ? 'w-6 h-6' : 'w-6 h-6'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={item.primary ? "2.5" : "2"}>
            {icons[item.icon]}
          </svg>
          <span className={`text-xs ${item.primary ? 'font-bold' : 'font-semibold'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
