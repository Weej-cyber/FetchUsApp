import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../shared/Card'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalWalks: 0,
    totalDogs: 0,
    pendingRequests: 0,
    todayWalks: 0
  })
  const [recentWalks, setRecentWalks] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  async function fetchDashboardData() {
    try {
      // Get total walks
      const { count: walksCount } = await supabase
        .from('walks')
        .select('*', { count: 'exact', head: true })
      
      // Get total dogs
      const { count: dogsCount } = await supabase
        .from('dogs')
        .select('*', { count: 'exact', head: true })
      
      // Get recent walks
      const { data: walks } = await supabase
        .from('walks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      setStats({
        totalWalks: walksCount || 0,
        totalDogs: dogsCount || 0,
        pendingRequests: 0,
        todayWalks: 0
      })
      
      setRecentWalks(walks || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <div className="p-5 animate-fade-in">
        <div className="text-center py-12 text-charcoal-light">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="p-5 pb-24 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="stat-box">
          <h3>{stats.totalWalks}</h3>
          <p>Total Walks</p>
        </div>
        <div className="stat-box">
          <h3>{stats.pendingRequests}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-box">
          <h3>{stats.totalDogs}</h3>
          <p>Dogs</p>
        </div>
        <div className="stat-box">
          <h3>{stats.todayWalks}</h3>
          <p>Today</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <h3 className="text-lg font-bold mb-3">Recent Walks</h3>
      {recentWalks.length === 0 ? (
        <Card>
          <p className="text-center text-charcoal-light py-4">No recent walks</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {recentWalks.map(walk => (
            <Card key={walk.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold">Walk #{walk.id.slice(0, 8)}</h4>
                  <p className="text-sm text-charcoal-light">
                    {new Date(walk.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`status-badge ${
                  walk.completed_at ? 'status-completed' : 
                  walk.started_at ? 'status-in-progress' : 
                  'status-confirmed'
                }`}>
                  {walk.completed_at ? 'Completed' : walk.started_at ? 'In Progress' : 'Scheduled'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
