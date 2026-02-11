import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import RoleSelector from './components/auth/RoleSelector'
import Header from './components/shared/Header'
import BottomNav from './components/shared/BottomNav'

// Client Components
import ClientHome from './components/client/Home'
import ClientBook from './components/client/Book'
import ClientDogs from './components/client/Dogs'
import ClientProfile from './components/client/Profile'

// Walker Components
import WalkerDashboard from './components/walker/Dashboard'
import WalkerHistory from './components/walker/History'

// Admin Components
import AdminDashboard from './components/admin/Dashboard'
import AdminRequests from './components/admin/Requests'
import AdminSchedule from './components/admin/Schedule'
import AdminClients from './components/admin/Clients'

function ClientLayout() {
  return (
    <div className="app-container">
      <Header role="client" />
      <Outlet />
      <BottomNav role="client" />
    </div>
  )
}

function WalkerLayout() {
  return (
    <div className="app-container">
      <Header role="walker" />
      <Outlet />
      <BottomNav role="walker" />
    </div>
  )
}

function AdminLayout() {
  return (
    <div className="app-container">
      <Header role="admin" />
      <Outlet />
      <BottomNav role="admin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelector />} />
        
        {/* Client Routes */}
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<ClientHome />} />
          <Route path="book" element={<ClientBook />} />
          <Route path="dogs" element={<ClientDogs />} />
          <Route path="profile" element={<ClientProfile />} />
        </Route>
        
        {/* Walker Routes */}
        <Route path="/walker" element={<WalkerLayout />}>
          <Route index element={<WalkerDashboard />} />
          <Route path="history" element={<WalkerHistory />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="clients" element={<AdminClients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
