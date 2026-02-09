import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const logoSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 80'%3E%3Cg%3E%3Cellipse cx='25' cy='25' rx='8' ry='10' fill='%235B4B8A' transform='rotate(-20 25 25)'/%3E%3Cellipse cx='45' cy='25' rx='8' ry='10' fill='%235B4B8A' transform='rotate(20 45 25)'/%3E%3Cellipse cx='25' cy='50' rx='8' ry='10' fill='%235B4B8A' transform='rotate(20 25 50)'/%3E%3Cellipse cx='45' cy='50' rx='8' ry='10' fill='%235B4B8A' transform='rotate(-20 45 50)'/%3E%3Ccircle cx='35' cy='38' r='16' fill='%235B4B8A'/%3E%3Cellipse cx='75' cy='25' rx='8' ry='10' fill='%234A9F9F' transform='rotate(-20 75 25)'/%3E%3Cellipse cx='95' cy='25' rx='8' ry='10' fill='%234A9F9F' transform='rotate(20 95 25)'/%3E%3Cellipse cx='75' cy='50' rx='8' ry='10' fill='%234A9F9F' transform='rotate(20 75 50)'/%3E%3Cellipse cx='95' cy='50' rx='8' ry='10' fill='%234A9F9F' transform='rotate(-20 95 50)'/%3E%3Ccircle cx='85' cy='38' r='16' fill='%234A9F9F'/%3E%3C/g%3E%3Ctext x='115' y='55' font-family='Caveat' font-size='48' font-weight='600' fill='%235B4B8A'%3EFetchUs%3C/text%3E%3C/svg%3E`

export default function ClientHome({ onLogout }) {
  const [dogs, setDogs] = useState([])
  const [walks, setWalks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Load dogs for the test client (Sarah)
      const { data: dogsData } = await supabase
        .from('dogs')
        .select(`
          *,
          owner:users(name, email)
        `)
        .order('name')

      // Load walks
      const { data: walksData } = await supabase
        .from('walks')
        .select(`
          *,
          dog:dogs(name),
          walker:users!walks_walker_id_fkey(name)
        `)
        .order('scheduled_date', { ascending: false })
        .limit(5)

      setDogs(dogsData || [])
      setWalks(walksData || [])
    } catch (error) {
      console.error('Error loading data:', error)
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
          <span className="header-role">Client</span>
        </div>
        <div className="header-icon" onClick={onLogout}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </div>
      </div>

      <div className="screen">
        <div className="section-header">
          <h2>My Dogs</h2>
        </div>

        {dogs.length === 0 ? (
          <div className="empty-state">
            <h3>No dogs yet</h3>
            <p>Add your first dog to get started</p>
          </div>
        ) : (
          dogs.map(dog => (
            <div key={dog.id} className="card">
              <div className="dog-profile">
                <div className="dog-avatar">🐕</div>
                <div className="dog-info">
                  <h4>{dog.name}</h4>
                  <p>{dog.breed || 'Mixed breed'} • {dog.age || '?'} years old</p>
                  {dog.behavioral_notes && (
                    <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                      {dog.behavioral_notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        <div className="section-header" style={{ marginTop: '32px' }}>
          <h2>Upcoming Walks</h2>
        </div>

        {walks.length === 0 ? (
          <div className="empty-state">
            <h3>No walks scheduled</h3>
            <p>Book a walk to get started</p>
          </div>
        ) : (
          walks.map(walk => (
            <div key={walk.id} className="card">
              <div className="card-header">
                <h4>{walk.dog?.name || 'Unknown dog'}</h4>
                <span className={`badge badge-${walk.status}`}>
                  {walk.status}
                </span>
              </div>
              <p>
                <strong>Service:</strong> {walk.service_type}
              </p>
              <p>
                <strong>Date:</strong> {new Date(walk.scheduled_date).toLocaleDateString()}
              </p>
              {walk.scheduled_time_start && (
                <p>
                  <strong>Time:</strong> {walk.scheduled_time_start}
                </p>
              )}
              {walk.walker && (
                <p>
                  <strong>Walker:</strong> {walk.walker.name}
                </p>
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
          <span>Home</span>
        </button>
        <button className="nav-item">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Walks</span>
        </button>
        <button className="nav-item nav-item-primary">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Book</span>
        </button>
      </div>
    </>
  )
}
