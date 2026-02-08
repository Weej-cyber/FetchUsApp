import { useState } from 'react'
import { setupDatabase } from '../lib/database-setup'
import './SetupPage.css'

export default function SetupPage({ onComplete }) {
  const [status, setStatus] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function runSetup() {
    setIsRunning(true)
    setStatus(['Starting database setup...'])
    
    const results = await setupDatabase()
    
    setStatus(results.steps)
    setIsComplete(results.success)
    setHasError(results.errors.length > 0)
    setIsRunning(false)

    if (results.errors.length > 0) {
      setStatus(prev => [...prev, '\nErrors:', ...results.errors])
    }
  }

  return (
    <div className="setup-page">
      <div className="setup-container">
        <h1>FetchUs Database Setup</h1>
        
        <div className="setup-info">
          <p>This will create the complete database for FetchUs:</p>
          <ul>
            <li><strong>7 Tables:</strong> users, dogs, walks, walk_locations (GPS), walk_reports, broadcast_messages, notifications</li>
            <li><strong>2 Storage Buckets:</strong> dog-photos, walk-photos</li>
            <li><strong>Security Policies:</strong> Row-level security for all tables</li>
            <li><strong>Test Data:</strong> Sample users and dog for testing</li>
          </ul>
          <p className="setup-note">⚠️ Only run this once during initial deployment</p>
        </div>

        {!isRunning && !isComplete && (
          <button className="setup-button" onClick={runSetup}>
            Create Database Tables
          </button>
        )}

        {status.length > 0 && (
          <div className={`setup-status ${hasError ? 'error' : ''}`}>
            {status.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}

        {isComplete && (
          <button className="setup-button complete" onClick={onComplete}>
            Continue to App →
          </button>
        )}
      </div>
    </div>
  )
}
