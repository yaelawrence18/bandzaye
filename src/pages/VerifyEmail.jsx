import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState("loading") // loading | success | error
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setStatus("error")
      setMessage("Lien invalide.")
      return
    }

    axios
      .get(`${API_URL}/api/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus("success")
        setMessage(res.data.message)
      })
      .catch((err) => {
        setStatus("error")
        setMessage(err.response?.data?.message || "Lien invalide ou expiré.")
      })
  }, [searchParams])

  return (
    <div style={styles.root}>
      <div style={styles.grid} />
      <div style={styles.orb} />

      <div style={styles.wrapper}>
        <div style={styles.logoBlock}>
          <div style={styles.logoRow}>
            <span style={styles.logoDot} />
            <h1 style={styles.logo}>BANDZAYE</h1>
            <span style={styles.logoDot} />
          </div>
          <p style={styles.logoSub}>Vérification de ton email</p>
        </div>

        <div style={styles.card}>
          {status === "loading" && (
            <div style={styles.centerBlock}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>Vérification en cours...</p>
            </div>
          )}

          {status === "success" && (
            <div style={styles.centerBlock}>
              <div style={styles.iconSuccess}>✓</div>
              <span style={styles.cardTag}>EMAIL CONFIRMÉ</span>
              <p style={styles.bodyText}>{message}</p>
              <Link to="/" style={styles.btn}>
                SE CONNECTER
              </Link>
            </div>
          )}

          {status === "error" && (
            <div style={styles.centerBlock}>
              <div style={styles.iconError}>✕</div>
              <span style={{ ...styles.cardTag, color: "#ef4444" }}>LIEN INVALIDE</span>
              <p style={styles.bodyText}>{message}</p>
              <Link to="/register" style={{ ...styles.btn, background: "#1f2937" }}>
                RETOUR À L'INSCRIPTION
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  orb: {
    position: "absolute",
    top: "-20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  wrapper: {
    width: "100%",
    maxWidth: "420px",
    position: "relative",
    zIndex: 1,
  },
  logoBlock: { textAlign: "center", marginBottom: "40px" },
  logoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  logoDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#2563eb",
    boxShadow: "0 0 8px #2563eb",
    display: "inline-block",
  },
  logo: {
    fontSize: "36px",
    fontWeight: "900",
    letterSpacing: "8px",
    color: "#ffffff",
    margin: 0,
  },
  logoSub: {
    fontSize: "12px",
    color: "#4b5563",
    letterSpacing: "2px",
    textTransform: "uppercase",
    margin: 0,
  },
  card: {
    background: "#0a0a0f",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "40px 32px",
  },
  centerBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    textAlign: "center",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "2px solid #1f2937",
    borderTop: "2px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#6b7280", fontSize: "14px", margin: 0 },
  iconSuccess: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(37,99,235,0.15)",
    border: "1px solid rgba(37,99,235,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#2563eb",
    boxShadow: "0 0 24px rgba(37,99,235,0.2)",
  },
  iconError: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    color: "#ef4444",
  },
  cardTag: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "3px",
    color: "#2563eb",
  },
  bodyText: { color: "#9ca3af", fontSize: "14px", lineHeight: "1.6", margin: 0 },
  btn: {
    display: "inline-block",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "14px 28px",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "2px",
    textDecoration: "none",
    marginTop: "8px",
    boxShadow: "0 0 24px rgba(37,99,235,0.3)",
  },
}

export default VerifyEmail