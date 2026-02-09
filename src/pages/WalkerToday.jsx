import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const logoSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 80'%3E%3Cg%3E%3Cellipse cx='25' cy='25' rx='8' ry='10' fill='%235B4B8A' transform='rotate(-20 25 25)'/%3E%3Cellipse cx='45' cy='25' rx='8' ry='10' fill='%235B4B8A' transform='rotate(20 45 25)'/%3E%3Cellipse cx='25' cy='50' rx='8' ry='10' fill='%235B4B8A' transform='rotate(20 25 50)'/%3E%3Cellipse cx='45' cy='50' rx='8' ry='10' fill='%235B4B8A' transform='rotate(-20 45 50)'/%3E%3Ccircle cx='35' cy='38' r='16' fill='%235B4B8A'/%3E%3Cellipse cx='75' cy='25' rx='8' ry='10' fill='%234A9F9F' transform='rotate(-20 75 25)'/%3E%3Cellipse cx='95' cy='25' rx='8' ry='10' fill='%234A9F9F' transform='rotate(20 95 25)'/%3E%3Cellipse cx='75' cy='50' rx='8' ry='10' fill='%234A9F9F' transform='rotate(20 75 50)'/%3E%3Cellipse cx='95' cy='50' rx='8' ry='10' fill='%234A9F9F' transform='rotate(-20 95 50)'/%3E%3Ccircle cx='85' cy='38' r='16' fill='%234A9F9F'/%3E%3C/g%3E%3Ctext x='115' y='55' font-family='Caveat' font-size='48' font-weight='600' fill='%235B4B8A'%3EFetchUs%3C/text%3E%3C/svg%3E`

export default function WalkerToday({ onLogout }) {
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWalks()
  }, [])

  async function loadWalks() {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data } = await supabase
        .from('walks')
        .select(`
          *,
          dog:dogs(name, breed, behavioral_notes),
          client:users!walks_client_id_fkey(name, phone, address, home_access_instructions)
        `)
        .eq('scheduled_date', today)
        .order('scheduled_time_start')

      setWalks(data || [])
    } catch (error) {
      console.error('Error loading walks:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="screen">
        <div className="header">
          <div className="header-branding">
            <img src={logoSvg} alt="FetchUs" className="header-logo" />
          </div>
        </div>
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--charcoal-light)' }}>
          Loading...
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="header">
        <div className="header-branding">
          <img src={logoSvg} alt="FetchUs" className="header-logo" />
          <span className="header-role">Walker</span>
        </div>
        <div className="header-icon" onClick={onLogout}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
      </div>

      <div className="screen">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number">{walks.length}</span>
            <span className="stat-label">Today's Walks</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{walks.filter(w => w.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="section-header">
          <h2>Today's Schedule</h2>
        </div>

        {walks.length === 0 ? (
          <div className="empty-state">
            <h3>No walks scheduled</h3>
            <p>Enjoy your day off!</p>
          </div>
        ) : (
          walks.map(walk => (
            <div key={walk.id} className="card">
              <div className="booking-card">
                <div className="booking-time">
                  <div className="time">{walk.scheduled_time_start || '--:--'}</div>
                  <div className="period">
                    {walk.scheduled_time_start ? 
                      (parseInt(walk.scheduled_time_start.split(':')[0]) >= 12 ? 'PM' : 'AM') 
                      : ''}
                  </div>
                </div>
                <div className="booking-details">
                  <h4>{walk.dog?.name || 'Unknown dog'}</h4>
                  <p><strong>Client:</strong> {walk.client?.name || 'Unknown'}</p>
                  <p><strong>Service:</strong> {walk.service_type}</p>
                  {walk.dog?.behavioral_notes && (
                    <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
                      Note: {walk.dog.behavioral_notes}
                    </p>
                  )}
                  {walk.client?.home_access_instructions && (
                    <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--charcoal-light)' }}>
                      Access: {walk.client.home_access_instructions}
                    </p>
                  )}
                  <div style={{ marginTop: '12px' }}>
                    <span className={`badge badge-${walk.status}`}>
                      {walk.status}
                    </span>
                  </div>
                </div>
              </div>
              {walk.status === 'confirmed' && (
                <button className="btn btn-success" style={{ width: '100%', marginTop: '12px' }}>
                  Start Walk
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-item active">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          <span>Today</span>
        </button>
        <button className="nav-item">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>History</span>
        </button>
      </div>
    </>
  )
}
