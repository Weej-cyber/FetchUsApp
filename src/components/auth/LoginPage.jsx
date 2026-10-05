import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { COLORS as C } from '../../theme'

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = {
    width: "52px",
    height: "52px",
    margin: "0 auto 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
  };

  const features = [
    {
      title: "Walk Check-In",
      desc: "Know exactly when your walker arrives and departs",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2D9B8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    },
    {
      title: "SMS Alerts",
      desc: "Text notifications at every walk milestone",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2D9B8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      title: "Walk Reports",
      desc: "Post-walk summaries after every visit",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2D9B8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
    {
      title: "Trusted Network",
      desc: "Verified pet parents only, by invitation",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2D9B8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #AEE0F5 0%, #C9EAF6 12%, #E4F3E6 32%, #F3EFDD 48%, #F0EEDC 62%, #E3EFDC 78%, #CFE7CE 92%, #B9DDBB 100%)", fontFamily: "'Nunito', sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* Logo bar */}
      <div style={{ padding: "36px 24px 20px", textAlign: "center" }}>
        <img
          src="/fetchus-logo.png"
          alt="FetchUs — Pet Services: Walking, Sitting, Boarding, Drop-In Visits"
          style={{ height: "150px", width: "auto", margin: "0 auto", display: "block" }}
        />
      </div>

      {/* Login Form — first thing on the page */}
      <div style={{ padding: "8px 24px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "400px", background: "#ffffff", border: "1px solid #E0E0E0", borderRadius: "16px", padding: "32px 26px", boxShadow: "0 12px 32px rgba(24,43,74,0.08)" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "52px", height: "52px", margin: "0 auto 16px", borderRadius: "50%", background: "#EEF3F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D9B8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#12203A", marginBottom: "8px" }}>Check your email</h2>
              <p style={{ color: "#4B5563", fontSize: '1rem', lineHeight: 1.6, fontWeight: 600 }}>
                We sent a magic link to <strong style={{ color: "#12203A" }}>{email}</strong>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                style={{ marginTop: "24px", background: "none", border: "none", color: C.tealDark, fontSize: '1rem', cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#12203A", marginBottom: "6px" }}>Sign in to FetchUs</h2>
              <p style={{ color: "#4B5563", fontSize: '1rem', marginBottom: "22px", lineHeight: 1.6, fontWeight: 600 }}>FetchUs is invite-only. Enter your email and we'll send you a secure link to sign in.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1.5px solid #C9D6E5", fontSize: '1rem', fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box", background: "#fff", color: "#12203A", fontWeight: 600 }}
                />
                {error && <p style={{ color: "#B91C1C", fontSize: '1rem', marginTop: "-4px", fontWeight: 700 }}>{error}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !email.trim()}
                  style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: loading || !email.trim() ? C.muted : `linear-gradient(135deg, ${C.tealDark}, ${C.indigo})`, color: "#fff", fontSize: '1rem', fontWeight: 800, fontFamily: "'Nunito', sans-serif", cursor: loading || !email.trim() ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #EEF3F8 0%, #E3EAF2 100%)", padding: "52px 24px 48px", textAlign: "center", borderTop: "1px solid #E0E0E0", borderBottom: "1px solid #E0E0E0" }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 800, color: C.tealDark, textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 14px" }}>
          FetchUs's private dog walking service
        </p>
        <h1 style={{ fontFamily: "Baloo 2, sans-serif", fontWeight: 800, fontSize: "clamp(28px, 6vw, 44px)", color: "#12203A", lineHeight: 1.25, margin: "0 auto 28px", maxWidth: "560px" }}>
          Real relationships. Real trust. Real walks.
        </h1>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {["Real-Time Updates", "SMS Notifications", "Invite-Only"].map((b, i) => (
            <span key={b} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {i > 0 && <span style={{ color: C.muted, fontSize: '1rem' }}>•</span>}
              <span style={{ color: "#1F3A5F", fontSize: '1rem', fontWeight: 700, letterSpacing: "0.3px" }}>{b}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", background: "#ffffff", borderBottom: "1px solid #E0E0E0" }}>
        {features.map(f => (
          <div key={f.title} style={{ padding: "28px 16px", textAlign: "center", borderRight: "1px solid #F0F0F0" }}>
            <div style={iconStyle}>{f.icon}</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: "#12203A", marginBottom: "6px" }}>{f.title}</div>
            <div style={{ fontSize: '1rem', color: C.muted, lineHeight: 1.5, fontWeight: 600 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* About */}
      <div style={{ background: "#AEE0F5", borderBottom: "1px solid #E0E0E0" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 800, color: C.tealDark, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "10px" }}>About FetchUs</p>
          <p style={{ fontSize: '1rem', color: "#4B5563", lineHeight: 1.8, margin: 0, fontWeight: 600 }}>
            FetchUs is the professional dog walking service operated by FetchUs LLC. Pet parents and walkers access their accounts through a secure, invitation-based system. SMS notifications about your dog walk status are a required part of using FetchUs.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#ffffff", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <span style={{ fontFamily: "Baloo 2, sans-serif", fontWeight: 700, fontSize: '1rem', color: "#182B4A" }}>FetchUs LLC</span>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <a href="mailto:fetchus2022@gmail.com" style={{ fontSize: '1rem', color: C.muted, textDecoration: "none", fontWeight: 600 }}>fetchus2022@gmail.com</a>
          <a href="https://fetch-us.com" target="_blank" rel="noreferrer" style={{ fontSize: '1rem', color: C.muted, textDecoration: "none", fontWeight: 600 }}>fetch-us.com</a>
          <a href="/privacy" style={{ fontSize: '1rem', color: C.muted, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
          <a href="/terms" style={{ fontSize: '1rem', color: C.muted, textDecoration: "none", fontWeight: 600 }}>Terms of Service</a>
        </div>
      </div>

    </div>
  );
}
