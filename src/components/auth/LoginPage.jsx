import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [smsConsent, setSmsConsent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
          data: { phone: phone.trim() },
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
    background: "rgba(255,255,255,0.12)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const features = [
    {
      title: "Walk Check-In",
      desc: "Know exactly when your walker arrives and departs",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
    },
    {
      title: "SMS Alerts",
      desc: "Text notifications at every walk milestone",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      title: "Walk Reports",
      desc: "Post-walk summaries after every visit",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      ),
    },
    {
      title: "Trusted Network",
      desc: "Verified clients only, by invitation",
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#4A3880", fontFamily: "'Nunito', sans-serif", WebkitFontSmoothing: "antialiased" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #5B4B8A 0%, #3D2E6E 100%)", padding: "52px 24px 48px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "10px" }}>
          <svg width="52" height="46" viewBox="0 0 48 42" fill="none">
            <ellipse cx="10" cy="12" rx="5" ry="7" fill="white"/>
            <ellipse cx="24" cy="7" rx="6" ry="8" fill="white"/>
            <ellipse cx="38" cy="12" rx="5" ry="7" fill="white"/>
            <path d="M24 18 C13 18 8 27 10 34 C12 40 18 42 24 42 C30 42 36 40 38 34 C40 27 35 18 24 18Z" fill="white"/>
          </svg>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "40px", color: "#fff", lineHeight: 1 }}>FetchUs</span>
        </div>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#D4BBFF", fontSize: "17px", margin: "0 0 22px" }}>We love them like you do ❤️</p>
        <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "clamp(26px, 5vw, 38px)", color: "#fff", lineHeight: 1.2, margin: "0 0 16px" }}>
          Professional Dog Walking,<br /><em style={{ fontStyle: "normal", color: "#C4B5FD" }}>Managed Simply</em>
        </h1>
        <p style={{ fontSize: "16px", color: "#E0D8FF", lineHeight: 1.75, maxWidth: "480px", margin: "0 auto 28px", fontWeight: 600 }}>
          A private platform connecting pet owners with trusted professional dog walkers. Real-time SMS updates, booking management, and direct communication.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          {["Real-Time Updates", "SMS Notifications", "Invite-Only"].map(b => (
            <span key={b} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: "13px", fontWeight: 700, padding: "7px 16px", borderRadius: "24px" }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        {features.map(f => (
          <div key={f.title} style={{ padding: "28px 16px", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={iconStyle}>{f.icon}</div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>{f.title}</div>
            <div style={{ fontSize: "12px", color: "#D4BBFF", lineHeight: 1.5, fontWeight: 600 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Login Form */}
      <div style={{ padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ fontSize: "12px", fontWeight: 800, color: "#C4B5FD", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "20px" }}>Client &amp; Walker Access</p>
        <div style={{ width: "100%", maxWidth: "400px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "16px", padding: "28px 24px" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📬</div>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>Check your email</h2>
              <p style={{ color: "#D4BBFF", fontSize: "15px", lineHeight: 1.6, fontWeight: 600 }}>
                We sent a magic link to <strong style={{ color: "#fff" }}>{email}</strong>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                style={{ marginTop: "24px", background: "none", border: "none", color: "#C4B5FD", fontSize: "14px", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>Sign in to FetchUs</h2>
              <p style={{ color: "#D4BBFF", fontSize: "14px", marginBottom: "24px", lineHeight: 1.6, fontWeight: 600 }}>FetchUs is invite-only. Enter your email and we'll send you a secure link to sign in.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", fontSize: "15px", fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 600 }}
                />
                <input
                  type="tel"
                  placeholder="Phone (optional, for SMS alerts)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{ width: "100%", padding: "13px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", fontSize: "15px", fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 600 }}
                />
                {error && <p style={{ color: "#FCA5A5", fontSize: "13px", marginTop: "-4px", fontWeight: 700 }}>{error}</p>}
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    style={{ marginTop: "3px", width: "16px", height: "16px", accentColor: "#C4B5FD", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: "13px", color: "#D4BBFF", lineHeight: 1.6, fontWeight: 600 }}>
                    I agree to receive SMS notifications from FetchUs LLC about my dog walk bookings. Msg &amp; data rates may apply. Reply STOP to opt out. <a href="/privacy" style={{ color: "#C4B5FD" }}>Privacy Policy</a> &amp; <a href="/terms" style={{ color: "#C4B5FD" }}>Terms</a>.
                  </span>
                </label>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !email.trim()}
                  style={{ width: "100%", padding: "14px", borderRadius: "10px", border: "none", background: loading || !email.trim() ? "rgba(255,255,255,0.15)" : "linear-gradient(135deg, #7C3AED, #5B4B8A)", color: "#fff", fontSize: "15px", fontWeight: 800, fontFamily: "'Nunito', sans-serif", cursor: loading || !email.trim() ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* About */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}>
          <p style={{ fontSize: "12px", fontWeight: 800, color: "#C4B5FD", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "10px" }}>About FetchUs</p>
          <p style={{ fontSize: "15px", color: "#E0D8FF", lineHeight: 1.8, margin: 0, fontWeight: 600 }}>
            FetchUs is a professional dog walking management platform operated by FetchUs LLC. The platform serves pet owners and professional dog walkers through a secure, invitation-based system. Clients may opt in to receive SMS notifications about their dog walk status.
          </p>
        </div>
      </div>

      {/* SMS Consent Disclosure */}
      <div style={{ background: "rgba(252,211,77,0.07)", borderTop: "1px solid rgba(252,211,77,0.2)", borderBottom: "1px solid rgba(252,211,77,0.2)" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}>
          <p style={{ fontSize: "12px", fontWeight: 800, color: "#FCD34D", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "10px" }}>SMS Notification Consent</p>
          <p style={{ fontSize: "15px", color: "#FFF8E0", lineHeight: 1.8, margin: 0, fontWeight: 600 }}>
            FetchUs offers SMS notifications to keep you informed about your dog walks. You may decline SMS messaging and still use FetchUs. To opt in, provide your phone number and check the consent box above. If you choose to opt in, you agree to receive automated text messages from FetchUs LLC regarding walk confirmations, walker arrival, walk start, and walk completion. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time, or HELP for help. No mobile data will be shared with third parties or affiliates for marketing or promotional purposes at any time. See our <a href="/privacy" style={{ color: "#FCD34D" }}>Privacy Policy</a> and <a href="/terms" style={{ color: "#FCD34D" }}>Terms of Service</a> for more information.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "rgba(0,0,0,0.25)", padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "14px", color: "#D4BBFF" }}>FetchUs LLC</span>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <a href="mailto:fetchus2022@gmail.com" style={{ fontSize: "13px", color: "#D4BBFF", textDecoration: "none", fontWeight: 600 }}>fetchus2022@gmail.com</a>
          <a href="https://fetch-us.com" target="_blank" rel="noreferrer" style={{ fontSize: "13px", color: "#D4BBFF", textDecoration: "none", fontWeight: 600 }}>fetch-us.com</a>
          <a href="/privacy" style={{ fontSize: "13px", color: "#D4BBFF", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
          <a href="/terms" style={{ fontSize: "13px", color: "#D4BBFF", textDecoration: "none", fontWeight: 600 }}>Terms of Service</a>
        </div>
      </div>

    </div>
  );
}
