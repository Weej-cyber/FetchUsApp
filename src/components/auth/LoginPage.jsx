import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function FetchUsLogo({ className = "h-12 w-auto" }) {
  return (
    <svg className={className} viewBox="0 0 260 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="260" height="70" rx="12" fill="#6366F1"/>
      <g transform="translate(18, 20)">
        <ellipse cx="9" cy="18" rx="6" ry="7" fill="#FBBF24"/>
        <ellipse cx="4" cy="9" rx="3.5" ry="4" fill="#FBBF24"/>
        <ellipse cx="10" cy="7" rx="3.5" ry="4" fill="#FBBF24"/>
        <ellipse cx="16" cy="9" rx="3.5" ry="4" fill="#FBBF24"/>
      </g>
      <text
        x="50"
        y="50"
        fontFamily="'Poppins', 'Trebuchet MS', 'Arial Black', sans-serif"
        fontSize="38"
        fontWeight="800"
        fill="#FFFFFF">
        FetchUs
      </text>
      <g transform="translate(223, 20)">
        <ellipse cx="9" cy="18" rx="6" ry="7" fill="#FBBF24"/>
        <ellipse cx="4" cy="9" rx="3.5" ry="4" fill="#FBBF24"/>
        <ellipse cx="10" cy="7" rx="3.5" ry="4" fill="#FBBF24"/>
        <ellipse cx="16" cy="9" rx="3.5" ry="4" fill="#FBBF24"/>
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDemoLogin = (role) => {
    navigate(`/${role}?demo=true`);
  };

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
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#FAF8F3",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Nunito', sans-serif",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}>

        {/* Logo */}
        <FetchUsLogo className="h-16 w-auto" />

        {/* Tagline */}
        <p style={{ color: "#6B7280", fontSize: "15px", textAlign: "center", marginTop: "-16px" }}>
          Professional pet care, at your fingertips
        </p>

        {/* Card */}
        <div style={{
          width: "100%",
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          padding: "32px 24px",
          boxShadow: "0 2px 12px rgba(45, 52, 54, 0.12)",
        }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📬</div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1F2937", marginBottom: "8px" }}>
                Check your email
              </h2>
              <p style={{ color: "#6B7280", fontSize: "14px", lineHeight: "1.6" }}>
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                style={{
                  marginTop: "24px",
                  background: "none",
                  border: "none",
                  color: "#6366F1",
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1F2937", marginBottom: "4px" }}>
                Sign in
              </h2>
              <p style={{ color: "#6B7280", fontSize: "13px", marginBottom: "24px" }}>
                Enter your email and we'll send you a link to sign in.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: "1.5px solid #E5E7EB",
                    fontSize: "15px",
                    fontFamily: "'Nunito', sans-serif",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#F9FAFB",
                  }}
                />

                {error && (
                  <p style={{ color: "#EF4444", fontSize: "13px", marginTop: "-8px" }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !email.trim()}
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: "10px",
                    border: "none",
                    background: loading || !email.trim() ? "#A5B4FC" : "linear-gradient(135deg, #6366F1, #4F46E5)",
                    color: "#FFFFFF",
                    fontSize: "15px",
                    fontWeight: "700",
                    fontFamily: "'Nunito', sans-serif",
                    cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Demo mode */}
        <div style={{ width: "100%", textAlign: "center" }}>
          <p style={{ color: "#9CA3AF", fontSize: "12px", marginBottom: "12px" }}>
            — Demo Mode —
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            {["client", "walker", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(role)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1.5px solid #E5E7EB",
                  backgroundColor: "#FFFFFF",
                  color: "#6B7280",
                  fontSize: "12px",
                  fontWeight: "600",
                  fontFamily: "'Nunito', sans-serif",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
