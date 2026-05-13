import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ newPassword: "", confirm: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.newPassword || !form.confirm) {
      setError("Veuillez remplir tous les champs.")
      return
    }
    if (form.newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    if (form.newPassword !== form.confirm) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    const token = searchParams.get("token")
    if (!token) {
      setError("Lien invalide.")
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        newPassword: form.newPassword,
      })
      setSuccess(true)
      setTimeout(() => navigate("/"), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Lien invalide ou expiré.")
    } finally {
      setLoading(false)
    }
  }

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
          <p style={styles.logoSub}>Nouveau mot de passe</p>
        </div>

        <div style={styles.card}>
          {!success ? (
            <>
              <div style={styles.cardHeader}>
                <span style={styles.cardTag}>RÉINITIALISATION</span>
              </div>

              {error && (
                <div style={styles.errorBox}>
                  <span style={styles.errorIcon}>!</span>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>NOUVEAU MOT DE PASSE</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={styles.input}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e) => (e.target.style.borderColor = "#1f2937")}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>CONFIRMER LE MOT DE PASSE</label>
                  <input
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={styles.input}
                    onFocus={(e) => (e.target.style.borderColor = "#2563eb")}
                    onBlur={(e) => (e.target.style.borderColor = "#1f2937")}
                  />
                </div>

                {/* Indicateur de force */}
                {form.newPassword && (
                  <div style={styles.strengthBar}>
                    <div
                      style={{
                        ...styles.strengthFill,
                        width:
                          form.newPassword.length < 6
                            ? "30%"
                            : form.newPassword.length < 10
                            ? "65%"
                            : "100%",
                        background:
                          form.newPassword.length < 6
                            ? "#ef4444"
                            : form.newPassword.length < 10
                            ? "#f59e0b"
                            : "#22c55e",
                      }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.btn,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => { if (!loading) e.target.style.background = "#1d4ed8" }}
                  onMouseLeave={(e) => { e.target.style.background = "#2563eb" }}
                >
                  {loading ? "Mise à jour..." : "METTRE À JOUR"}
                </button>
              </form>
            </>
          ) : (
            <div style={styles.centerBlock}>
              <div style={styles.iconSuccess}>✓</div>
              <span style={styles.cardTag}>MOT DE PASSE MIS À JOUR</span>
              <p style={styles.bodyText}>
                Ton mot de passe a été réinitialisé avec succès.<br />
                Tu vas être redirigé vers la connexion...
              </p>
              <div style={styles.progressBar}>
                <div style={styles.progressFill} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes progress { from { width: 0% } to { width: 100% } }
      `}</style>
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
    padding: "32px",
  },
  cardHeader: { marginBottom: "28px" },
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
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
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
  strengthBar: {
    height: "3px",
    background: "#1f2937",
    borderRadius: "2px",
    overflow: "hidden",
    marginTop: "-8px",
  },
  strengthFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.3s, background 0.3s",
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
  centerBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    textAlign: "center",
  },
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
  bodyText: { color: "#9ca3af", fontSize: "14px", lineHeight: "1.8", margin: 0 },
  progressBar: {
    width: "100%",
    height: "2px",
    background: "#1f2937",
    borderRadius: "2px",
    overflow: "hidden",
    marginTop: "8px",
  },
  progressFill: {
    height: "100%",
    background: "#2563eb",
    animation: "progress 3s linear forwards",
  },
}

export default ResetPassword