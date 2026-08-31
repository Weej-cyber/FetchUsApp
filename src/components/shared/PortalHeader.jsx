// Shared top header for the three role portals (Admin, Walker, Client).
// The FetchUs mark is the focal point — large and centered, like a website
// header — with the page title/subtitle underneath. Sign Out sits in its
// own corner so it doesn't compete with the logo for attention.
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
      <div style={{ position: 'relative', marginBottom: 20, paddingTop: 8 }}>
        <button onClick={onSignOut} style={{ position: 'absolute', top: 0, right: 0, background: 'white', border: '1.5px solid #E0E0E0', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#636e72', cursor: 'pointer' }}>
          Sign Out
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <img src="/fetchus-mark.png" alt="FetchUs" style={{ height: 108, width: 'auto', objectFit: 'contain' }} />
          <h1 style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#182B4A', margin: '8px 0 0' }}>{title}</h1>
          <p style={{ color: '#636e72', fontSize: '0.85rem', margin: '2px 0 0' }}>{subtitle}</p>
        </div>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div style={{ background, padding: '46px 24px 28px', color: 'white', position: 'relative' }}>
        <button onClick={onSignOut} style={{ position: 'absolute', top: 16, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
          Sign Out
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <img src="/fetchus-mark.png" alt="FetchUs" style={{ height: 108, width: 'auto', objectFit: 'contain' }} />
          <h1 style={{ margin: '8px 0 0', fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Baloo 2, sans-serif' }}>{title}</h1>
          <p style={{ margin: '2px 0 0', opacity: 0.85, fontSize: '0.88rem' }}>{subtitle}</p>
        </div>
      </div>
    )
  }

  // variant === 'card'
  return (
    <div style={{ background, borderRadius: 16, padding: '24px 24px 20px', marginBottom: 8, color: 'white', position: 'relative' }}>
      <button onClick={onSignOut} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
        Sign Out
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <img src="/fetchus-mark.png" alt="FetchUs" style={{ height: 108, width: 'auto', objectFit: 'contain' }} />
        {eyebrow && (
          <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '8px 0 0' }}>{eyebrow}</div>
        )}
        <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Baloo 2, sans-serif', margin: '2px 0 0' }}>{title}</div>
        <div style={{ fontSize: '0.88rem', opacity: 0.9, marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  )
}
