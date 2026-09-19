// Nudges people to add FetchUs to their home screen so it looks and feels
// like a real app icon, without a store. Android/Chrome gets a one-tap
// native install prompt; iOS Safari has no such API (Apple doesn't allow
// it), so we show the manual Share -> Add to Home Screen steps instead.
// Hides itself permanently once installed, or if the person dismisses it.
import { useState, useEffect } from 'react'

const DISMISSED_KEY = 'fetchus_install_dismissed'

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.MSStream
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISSED_KEY)) return

    if (isIOS()) {
      setVisible(true)
      return
    }

    function handlePrompt(e) {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    function handleInstalled() {
      setVisible(false)
      localStorage.setItem(DISMISSED_KEY, '1')
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  function handleDismiss() {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  async function handleInstallClick() {
    if (isIOS()) {
      setShowSteps(true)
      return
    }
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{ margin: '0 0 16px', background: '#E3EAF2', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/paw-192.png" alt="" style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#182B4A' }}>Get the FetchUs icon</div>
          <div style={{ fontSize: '0.75rem', color: '#636e72', marginTop: 1 }}>One tap, no store needed</div>
        </div>
        <button onClick={handleInstallClick} style={{ background: '#182B4A', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Install</button>
        <button onClick={handleDismiss} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: '#b2bec3', fontSize: '1.1rem', cursor: 'pointer', padding: '0 2px', flexShrink: 0, lineHeight: 1 }}>×</button>
      </div>
      {showSteps && (
        <div style={{ fontSize: '0.78rem', color: '#2D3436', background: 'white', borderRadius: 8, padding: '10px 12px' }}>
          1. Tap the <strong>Share</strong> button in Safari (square with an arrow, at the bottom of the screen)<br />
          2. Scroll down and tap <strong>Add to Home Screen</strong><br />
          3. Tap <strong>Add</strong> in the top right
        </div>
      )}
    </div>
  )
}
