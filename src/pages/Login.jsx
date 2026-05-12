import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

function Login() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError("Veuillez remplir tous les champs.")
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form)
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      navigate("/home")
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants incorrects.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.root}>
      {/* Background grid */}
      <div style={styles.grid} />
      {/* Blue glow orb */}
      <div style={styles.orb} />

      <div style={styles.wrapper}>
        {/* Logo */}
        <div style={styles.logoBlock}>
          <div style={styles.logoRow}>
            <span style={styles.logoDot} />
            <h1 style={styles.logo}>BANDZAYE</h1>
            <span style={styles.logoDot} />
          </div>
          <p style={styles.logoSub}>Connecte-toi à ce qui se passe</p>
        </div>

        {/* Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTag}>CONNEXION</span>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>EMAIL</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="toi@exemple.com"
                style={styles.input}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
                onBlur={e => e.target.style.borderColor = "#1f2937"}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>MOT DE PASSE</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={styles.input}
                onFocus={e => e.target.style.borderColor = "#2563eb"}
                onBlur={e => e.target.style.borderColor = "#1f2937"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.btn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = "#1d4ed8" }}
              onMouseLeave={e => { e.target.style.background = "#2563eb" }}
            >
              {loading ? "Connexion..." : "SE CONNECTER"}
            </button>
          </form>

          <p style={styles.footer}>
            Pas encore de compte ?{" "}
            <Link to="/register" style={styles.link}>Inscription</Link>
          </p>
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
  logoBlock: {
    textAlign: "center",
    marginBottom: "40px",
  },
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
    padding: "32px",
  },
  cardHeader: {
    marginBottom: "28px",
  },
  cardTag: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "3px",
    color: "#2563eb",
    display: "block",
  },
  errorBox: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#fca5a5",
    fontSize: "13px",
    borderRadius: "8px",
    padding: "12px 14px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  errorIcon: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "rgba(239,68,68,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "900",
    color: "#fca5a5",
    flexShrink: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#6b7280",
  },
  input: {
    background: "#111118",
    border: "1px solid #1f2937",
    borderRadius: "8px",
    padding: "13px 16px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  btn: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "2px",
    transition: "background 0.2s",
    marginTop: "4px",
    boxShadow: "0 0 24px rgba(37,99,235,0.3)",
  },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    color: "#4b5563",
    marginTop: "24px",
    marginBottom: 0,
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },
}

export default Login