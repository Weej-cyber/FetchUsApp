// Shared top header for the three role portals (Admin, Walker, Client).
// Each portal has its own look (plain/banner/card), so `variant` controls
// layout while the content and sign-out behavior stay consistent.
export default function PortalHeader({
  variant,       // 'plain' | 'banner' | 'card'
  background,    // css background (color or gradient), used by 'banner' and 'card'
  eyebrow,       // optional small label above the title, used by 'card'
  title,
  subtitle,
  onSignOut,
}) {
  if (variant === 'plain') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/fetchus-mark.png" alt="FetchUs" style={{ height: 64, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <h1 style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#182B4A', margin: 0 }}>{title}</h1>
            <p style={{ color: '#636e72', fontSize: '0.85rem', margin: '4px 0 0' }}>{subtitle}</p>
          </div>
        </div>
        <button onClick={onSignOut} style={{ background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#636e72', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div style={{ background, padding: '50px 24px 24px', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/fetchus-mark.png" alt="FetchUs" style={{ height: 64, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Baloo 2, sans-serif' }}>{title}</h1>
              <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.88rem' }}>{subtitle}</p>
            </div>
          </div>
          <button onClick={onSignOut} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // variant === 'card'
  return (
    <div style={{ background, borderRadius: 16, padding: '22px 24px', marginBottom: 8, color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/fetchus-mark.png" alt="FetchUs" style={{ height: 64, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
          <div>
            {eyebrow && (
              <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{eyebrow}</div>
            )}
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Baloo 2, sans-serif', marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: '0.88rem', opacity: 0.9 }}>{subtitle}</div>
          </div>
        </div>
        <button onClick={onSignOut} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            Sign Out
          </button>
      </div>
    </div>
  )
}
