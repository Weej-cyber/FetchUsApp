import { useState } from "react";
import { supabase } from "../../lib/supabase";

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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FAF8F3", fontFamily: "'Nunito', sans-serif" }}>

      {/* Hero */}
      <div style={{ background: "#5B4B8A", padding: "36px 24px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "16px", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="32" height="28" viewBox="0 0 48 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="10" cy="12" rx="5" ry="7" fill="white"/>
              <ellipse cx="24" cy="7" rx="6" ry="8" fill="white"/>
              <ellipse cx="38" cy="12" rx="5" ry="7" fill="white"/>
              <path d="M24 18 C13 18 8 27 10 34 C12 40 18 42 24 42 C30 42 36 40 38 34 C40 27 35 18 24 18Z" fill="white"/>
            </svg>
          </div>
          <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "28px", color: "#fff" }}>FetchUs</span>
        </div>
        <p style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive", color: "rgba(255,255,255,0.75)", fontSize: "15px", fontStyle: "italic", margin: "0 0 18px" }}>We ❤️ them like you do!</p>
        <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "22px", color: "#fff", lineHeight: 1.25, margin: "0 0 10px" }}>Professional Dog Walking,{" "}<br />Managed Simply</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: 1.6, maxWidth: "380px", margin: "0 auto 20px" }}>
          FetchUs is a private platform connecting pet owners with trusted professional dog walkers. Real-time walk updates, booking management, and direct communication — all in one place.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
          {["Real-Time Walk Updates", "Professional Walkers", "Invite-Only Platform"].map(b => (
            <span key={b} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.25)" }}>{b}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "#e8e4da", borderBottom: "1px solid #e8e4da" }}>
        {[
          { emoji: "📍", title: "Live Tracking", desc: "Know exactly when your walker arrives and departs" },
          { emoji: "💬", title: "SMS Alerts", desc: "Instant text notifications at every walk milestone" },
          { emoji: "📋", title: "Walk Reports", desc: "Post-walk summaries after every visit" },
          { emoji: "🔒", title: "Trusted Network", desc: "Invite-only access for verified clients only" },
        ].map(f => (
          <div key={f.title} style={{ background: "#fff", padding: "16px 10px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{f.emoji}</div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#1F2937", marginBottom: "3px" }}>{f.title}</div>
            <div style={{ fontSize: "11px", color: "#6B7280", lineHeight: 1.4 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Login Form */}
      <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#5B4B8A", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Client &amp; Walker Access</p>
        <div style={{ width: "100%", maxWidth: "380px", backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "28px 24px", boxShadow: "0 2px 12px rgba(45,52,54,0.12)" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📬</div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1F2937", marginBottom: "8px" }}>Check your email</h2>
              <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.6" }}>
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                style={{ marginTop: "24px", background: "none", border: "none", color: "#6366F1", fontSize: "14px", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1F2937", marginBottom: "4px" }}>Sign in to FetchUs</h2>
              <p style={{ color: "#6B7280", fontSize: "13px", marginBottom: "24px" }}>FetchUs is invite-only. Enter your email and we'll send you a secure link to sign in.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #E5E7EB", fontSize: "15px", fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box", backgroundColor: "#F9FAFB" }}
                />
                {error && <p style={{ color: "#EF4444", fontSize: "13px", marginTop: "-8px" }}>{error}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !email.trim()}
                  style={{ width: "100%", padding: "13px", borderRadius: "10px", border: "none", background: loading || !email.trim() ? "#A5B4FC" : "linear-gradient(135deg, #6366F1, #4F46E5)", color: "#FFFFFF", fontSize: "15px", fontWeight: "700", fontFamily: "'Nunito', sans-serif", cursor: loading || !email.trim() ? "not-allowed" : "pointer", transition: "all 0.2s" }}
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* About */}
      <div style={{ background: "#F3F0F9", padding: "20px 24px", borderTop: "1px solid #e8e4da", borderBottom: "1px solid #e8e4da" }}>
        <p style={{ fontSize: "12px", fontWeight: 800, color: "#5B4B8A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>About FetchUs</p>
        <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.6, margin: 0 }}>
          FetchUs is a professional dog walking management platform operated by FetchUs LLC. The platform serves pet owners and professional dog walkers through a secure, invitation-based system. Clients receive real-time SMS notifications about their dog walk status after consenting to communications through their account profile.
        </p>
      </div>

      {/* Footer */}
      <div style={{ background: "#5B4B8A", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "14px", color: "#fff" }}>FetchUs LLC</span>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <a href="mailto:fetchus2022@gmail.com" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>fetchus2022@gmail.com</a>
          <a href="https://fetch-us.com" target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>fetch-us.com</a>
          <a href="/privacy" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Privacy Policy</a>
          <a href="/terms" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>Terms of Service</a>
        </div>
      </div>

    </div>
  );
}
