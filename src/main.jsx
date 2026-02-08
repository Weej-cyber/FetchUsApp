import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import SetupPage from './pages/SetupPage'
import { checkDatabaseSetup } from './lib/database-setup'
import './styles/global.css'

function Root() {
  const [isSetup, setIsSetup] = useState(null)

  useEffect(() => {
    checkDatabaseSetup().then(setIsSetup)
  }, [])

  if (isSetup === null) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'Nunito, sans-serif',
        color: '#5B4B8A'
      }}>
        Loading...
      </div>
    )
  }

  if (!isSetup) {
    return <SetupPage onComplete={() => setIsSetup(true)} />
  }

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
