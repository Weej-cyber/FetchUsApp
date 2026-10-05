import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'

// Keeps the open tab/screen in the web address (e.g. /admin?tab=people), so the
// browser's Back button returns to the previous screen instead of leaving the portal.
export function useScreenParams() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Move to a new screen. Each key set to null/'' is removed from the address.
  function go(updates, { replace = false } = {}) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(updates)) {
      if (value == null || value === '') next.delete(key)
      else next.set(key, value)
    }
    if (next.toString() === params.toString()) return
    setParams(next, { replace, state: { inApp: true } })
  }

  // In-app "Back" buttons: behave exactly like the browser's Back when the
  // previous screen was inside this portal; otherwise go to the fallback screen.
  function back(fallback) {
    if (location.state?.inApp) navigate(-1)
    else go(fallback, { replace: true })
  }

  return { params, go, back }
}
