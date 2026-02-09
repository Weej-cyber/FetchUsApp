import { useState } from 'react'
import './styles/global.css'
import ClientHome from './pages/ClientHome'
import WalkerToday from './pages/WalkerToday'
import AdminBroadcasts from './pages/AdminBroadcasts'

// Logo SVG as data URL
const logoSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 80'%3E%3Cg%3E%3Cellipse cx='25' cy='25' rx='8' ry='10' fill='%235B4B8A' transform='rotate(-20 25 25)'/%3E%3Cellipse cx='45' cy='25' rx='8' ry='10' fill='%235B4B8A' transform='rotate(20 45 25)'/%3E%3Cellipse cx='25' cy='50' rx='8' ry='10' fill='%235B4B8A' transform='rotate(20 25 50)'/%3E%3Cellipse cx='45' cy='50' rx='8' ry='10' fill='%235B4B8A' transform='rotate(-20 45 50)'/%3E%3Ccircle cx='35' cy='38' r='16' fill='%235B4B8A'/%3E%3Cellipse cx='75' cy='25' rx='8' ry='10' fill='%234A9F9F' transform='rotate(-20 75 25)'/%3E%3Cellipse cx='95' cy='25' rx='8' ry='10' fill='%234A9F9F' transform='rotate(20 95 25)'/%3E%3Cellipse cx='75' cy='50' rx='8' ry='10' fill='%234A9F9F' transform='rotate(20 75 50)'/%3E%3Cellipse cx='95' cy='50' rx='8' ry='10' fill='%234A9F9F' transform='rotate(-20 95 50)'/%3E%3Ccircle cx='85' cy='38' r='16' fill='%234A9F9F'/%3E%3C/g%3E%3Ctext x='115' y='55' font-family='Caveat' font-size='48' font-weight='600' fill='%235B4B8A'%3EFetchUs%3C/text%3E%3C/svg%3E`

export default function App() {
  const [role, setRole] = useState(null)

  if (!role) {
    return (
      <div className="role-screen">
        <div className="role-branding">
          <img src={logoSvg} alt="FetchUs" className="role-logo" />
          <p className="role-tagline">Professional Dog Walking Service</p>
        </div>
        <div className="role-buttons">
          <button className="role-btn client-btn" onClick={() => setRole('client')}>
            I'm a Client
          </button>
          <button className="role-btn walker-btn" onClick={() => setRole('walker')}>
            I'm a Walker
          </button>
          <button className="role-btn admin-btn" onClick={() => setRole('admin')}>
            I'm an Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {role === 'client' && <ClientHome onLogout={() => setRole(null)} />}
      {role === 'walker' && <WalkerToday onLogout={() => setRole(null)} />}
      {role === 'admin' && <AdminBroadcasts onLogout={() => setRole(null)} />}
    </div>
  )
}
