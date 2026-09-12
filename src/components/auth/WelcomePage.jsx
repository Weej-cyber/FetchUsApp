import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";

// Public page, no login required to view it. Nancy sends this link to a
// client right after creating their account. The client's email is baked
// into the link itself (?email=...), so there's nothing for them to type --
// one tap sends their login link straight to their inbox.
export default function WelcomePage() {
  const [searchParams] = useSearchParams();
  const email = (searchParams.get("email") || "").trim();
  const name = (searchParams.get("name") || "").trim();

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function handleSend() {
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return (
      <div style={{ minHeight: "100vh", background: "#AEE0F5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif", padding: 24 }}>
        <div style={{ background: "white", borderRadius: 14, padding: 28, maxWidth: 420, textAlign: "center", boxShadow: "0 2px 10px rgba(45,52,54,0.08)" }}>
          <div style={{ fontWeight: 800, color: "#182B4A", fontSize: "1.1rem", marginBottom: 8 }}>This link is missing some information</div>
          <div style={{ color: "#2D3436", fontSize: "0.9rem" }}>Please ask for a new welcome link.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#AEE0F5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif", padding: 24 }}>
      <div style={{ background: "white", borderRadius: 16, padding: "32px 28px", maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 4px 16px rgba(45,52,54,0.10)" }}>
        <div style={{ background: "#B3E0FD", borderRadius: 12, padding: "10px 20px", display: "inline-block", marginBottom: 18 }}>
          <img src="/fetchus-logo.png" alt="FetchUs" style={{ height: 64, width: "auto", display: "block" }} />
        </div>

        {sent ? (
          <>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#182B4A", marginBottom: 8 }}>Check your email!</div>
            <div style={{ color: "#2D3436", fontSize: "0.92rem", lineHeight: 1.5 }}>
              We just sent a sign-in link to<br /><strong>{email}</strong><br />
              Tap the link in that email and you're in — no password needed.
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#182B4A", marginBottom: 6 }}>
              Welcome{name ? `, ${name}` : ""}!
            </div>
            <div style={{ color: "#2D3436", fontSize: "0.92rem", lineHeight: 1.5, marginBottom: 22 }}>
              Your FetchUs account is all set up. Tap below and we'll send a sign-in link straight to your inbox — no password, nothing to remember.
            </div>
            <button
              onClick={handleSend}
              disabled={loading}
              style={{ width: "100%", background: "#182B4A", color: "white", border: "none", borderRadius: 10, padding: "14px", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}
            >
              {loading ? "Sending..." : "Email Me My Login Link"}
            </button>
            <div style={{ color: "#636e72", fontSize: "0.78rem", marginTop: 12 }}>Link will be sent to {email}</div>
            {error && (
              <div style={{ marginTop: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 8, padding: "9px 12px", fontSize: "0.85rem", fontWeight: 600 }}>{error}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
