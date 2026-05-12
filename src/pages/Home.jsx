import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import EventDetail from "../components/EventDetail"

const CATEGORIES = [
  { id: "all", label: "Tout" },
  { id: "bar", label: "Bars" },
  { id: "restaurant", label: "Restos" },
  { id: "cinema", label: "Cinéma" },
  { id: "parc", label: "Parcs" },
]

const CATEGORIE_COLORS = {
  bar: { bg: "rgba(37,99,235,0.12)", color: "#60a5fa", border: "rgba(37,99,235,0.25)" },
  restaurant: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.2)" },
  cinema: { bg: "rgba(139,92,246,0.1)", color: "#a78bfa", border: "rgba(139,92,246,0.2)" },
  parc: { bg: "rgba(34,197,94,0.1)", color: "#4ade80", border: "rgba(34,197,94,0.2)" },
}

const API_URL = import.meta.env.VITE_API_URL

function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const [events, setEvents] = useState([])
  const [filtre, setFiltre] = useState("all")
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titre: "", description: "", categorie: "bar", adresse: "" })
  const [hoveredCard, setHoveredCard] = useState(null)

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events`)
      setEvents(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      await axios.post(`${API_URL}/api/events`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowForm(false)
      setForm({ titre: "", description: "", categorie: "bar", adresse: "" })
      fetchEvents()
    } catch (err) {
      console.log(err)
    }
  }

  const eventsFiltres = filtre === "all" ? events : events.filter(e => e.categorie === filtre)

  const getCatStyle = (cat) => CATEGORIE_COLORS[cat] || { bg: "rgba(107,114,128,0.1)", color: "#9ca3af", border: "rgba(107,114,128,0.2)" }

  const initials = (name) => name?.charAt(0).toUpperCase() || "?"

  const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now - d) / 60000)
    if (diff < 60) return `Il y a ${diff}min`
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
  }

  return (
    <div style={s.root}>
      {/* Background */}
      <div style={s.grid} />
      <div style={s.orbTop} />
      <div style={s.orbBottom} />

      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          BAND<span style={s.navLogoZ}>Z</span>AYE
        </div>
        <div style={s.navRight}>
          <div style={s.navUser}>
            <div style={s.navAvatar}>{initials(user.nom)}</div>
            <span style={s.navUserName}>{user.nom}</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={s.publishBtn}
            onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
            onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
          >
            + Publier
          </button>
          <button
            onClick={handleLogout}
            style={s.logoutBtn}
            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
            onMouseLeave={e => e.currentTarget.style.color = "#4b5563"}
          >
            Quitter
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroTag}>
          <span style={s.liveDoc} />
          EN DIRECT PRÈS DE TOI
        </div>
        <h2 style={s.heroTitle}>
          Ce qui se passe<br />
          <span style={s.heroTitleBlue}>autour de toi</span> maintenant
        </h2>
        <p style={s.heroSub}>Sorties, événements, bons plans — tout ce que tu rates si tu restes chez toi.</p>
      </div>

      {/* Filters */}
      <div style={s.filters}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFiltre(cat.id)}
            style={{
              ...s.filterBtn,
              ...(filtre === cat.id ? s.filterBtnActive : {}),
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={s.content}>
        {/* Feed */}
        <div style={s.feed}>
          {eventsFiltres.length === 0 && (
            <div style={s.empty}>
              <div style={s.emptyIcon}>◎</div>
              <p style={s.emptyTitle}>Rien pour l'instant</p>
              <p style={s.emptySub}>Sois le premier à partager un bon plan !</p>
            </div>
          )}

          <div style={s.grid2}>
            {eventsFiltres.map(event => {
              const catStyle = getCatStyle(event.categorie)
              const isSelected = selected?.id === event.id
              const isHovered = hoveredCard === event.id
              return (
                <div
                  key={event.id}
                  onClick={() => setSelected(event)}
                  onMouseEnter={() => setHoveredCard(event.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    ...s.card,
                    ...(isSelected ? s.cardSelected : {}),
                    ...(isHovered && !isSelected ? s.cardHovered : {}),
                  }}
                >
                  {/* Card top */}
                  <div style={s.cardTop}>
                    <div style={s.cardAuthor}>
                      <div style={s.cardAvatar}>{initials(event.auteur)}</div>
                      <div>
                        <p style={s.cardAuthorName}>{event.auteur}</p>
                        <p style={s.cardAuthorDate}>{formatDate(event.created_at)}</p>
                      </div>
                    </div>
                    <span style={{
                      ...s.badge,
                      background: catStyle.bg,
                      color: catStyle.color,
                      border: `1px solid ${catStyle.border}`,
                    }}>
                      {(event.categorie || "").toUpperCase()}
                    </span>
                  </div>

                  {/* Card body */}
                  <h3 style={s.cardTitle}>{event.titre}</h3>
                  <p style={s.cardDesc}>{event.description}</p>

                  {/* Card footer */}
                  {event.adresse && (
                    <div style={s.cardAddr}>
                      <span style={s.addrDot}>◎</span>
                      {event.adresse}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Side panel */}
        {selected && (
          <EventDetail event={selected} onClose={() => setSelected(null)} />
        )}
      </div>

      {/* Publish Modal */}
      {showForm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div>
                <span style={s.modalTag}>NOUVEAU</span>
                <h2 style={s.modalTitle}>Partage un bon plan</h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                style={s.modalClose}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "#4b5563"}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={s.modalForm}>
              <div style={s.formField}>
                <label style={s.formLabel}>TITRE</label>
                <input
                  type="text"
                  placeholder="Titre de l'événement"
                  value={form.titre}
                  onChange={e => setForm({ ...form, titre: e.target.value })}
                  style={s.formInput}
                  onFocus={e => e.target.style.borderColor = "#2563eb"}
                  onBlur={e => e.target.style.borderColor = "#1f2937"}
                />
              </div>

              <div style={s.formField}>
                <label style={s.formLabel}>DESCRIPTION</label>
                <textarea
                  placeholder="Décris l'ambiance, les détails..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ ...s.formInput, height: "90px", resize: "none" }}
                  onFocus={e => e.target.style.borderColor = "#2563eb"}
                  onBlur={e => e.target.style.borderColor = "#1f2937"}
                />
              </div>

              <div style={s.formRow}>
                <div style={{ ...s.formField, flex: 1 }}>
                  <label style={s.formLabel}>CATÉGORIE</label>
                  <select
                    value={form.categorie}
                    onChange={e => setForm({ ...form, categorie: e.target.value })}
                    style={s.formInput}
                    onFocus={e => e.target.style.borderColor = "#2563eb"}
                    onBlur={e => e.target.style.borderColor = "#1f2937"}
                  >
                    <option value="bar">Bar</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="cinema">Cinéma</option>
                    <option value="parc">Parc</option>
                  </select>
                </div>
                <div style={{ ...s.formField, flex: 1 }}>
                  <label style={s.formLabel}>ADRESSE</label>
                  <input
                    type="text"
                    placeholder="Quartier ou adresse"
                    value={form.adresse}
                    onChange={e => setForm({ ...form, adresse: e.target.value })}
                    style={s.formInput}
                    onFocus={e => e.target.style.borderColor = "#2563eb"}
                    onBlur={e => e.target.style.borderColor = "#1f2937"}
                  />
                </div>
              </div>

              <div style={s.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={s.cancelBtn}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#374151"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#1f2937"}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={s.submitBtn}
                  onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
                  onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
                >
                  PUBLIER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  root: {
    minHeight: "100vh",
    background: "#000000",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    overflow: "hidden",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(37,99,235,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(37,99,235,0.035) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
    pointerEvents: "none",
    zIndex: 0,
  },
  orbTop: {
    position: "fixed",
    top: "-200px",
    right: "-100px",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  orbBottom: {
    position: "fixed",
    bottom: "-200px",
    left: "-100px",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 40,
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #111827",
    padding: "14px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navLogo: {
    fontSize: "20px",
    fontWeight: "900",
    letterSpacing: "5px",
    color: "#ffffff",
  },
  navLogoZ: {
    color: "#2563eb",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  navUser: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid #1f2937",
    borderRadius: "999px",
    padding: "6px 12px 6px 6px",
  },
  navAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#fff",
  },
  navUserName: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#d1d5db",
  },
  publishBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 18px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    letterSpacing: "0.5px",
    transition: "background 0.2s",
    boxShadow: "0 0 16px rgba(37,99,235,0.35)",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    color: "#4b5563",
    fontSize: "13px",
    cursor: "pointer",
    transition: "color 0.2s",
    padding: "4px",
  },
  hero: {
    padding: "40px 28px 32px",
    borderBottom: "1px solid #111827",
    position: "relative",
    zIndex: 1,
  },
  heroTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#0d0d14",
    border: "1px solid #1f2937",
    color: "#4b5563",
    fontSize: "10px",
    letterSpacing: "2px",
    padding: "6px 12px",
    borderRadius: "4px",
    marginBottom: "16px",
    fontWeight: "700",
  },
  liveDoc: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#ef4444",
    boxShadow: "0 0 6px #ef4444",
    display: "inline-block",
  },
  heroTitle: {
    fontSize: "32px",
    fontWeight: "800",
    lineHeight: 1.2,
    margin: "0 0 10px 0",
    color: "#ffffff",
  },
  heroTitleBlue: {
    color: "#2563eb",
  },
  heroSub: {
    fontSize: "14px",
    color: "#4b5563",
    margin: 0,
    lineHeight: 1.6,
  },
  filters: {
    display: "flex",
    gap: "8px",
    padding: "14px 28px",
    borderBottom: "1px solid #111827",
    overflowX: "auto",
    position: "relative",
    zIndex: 1,
  },
  filterBtn: {
    padding: "7px 18px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "1px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    border: "1px solid #1f2937",
    background: "transparent",
    color: "#6b7280",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  filterBtnActive: {
    background: "#2563eb",
    color: "#ffffff",
    borderColor: "#2563eb",
    boxShadow: "0 0 14px rgba(37,99,235,0.35)",
  },
  content: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  },
  feed: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 28px 40px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px",
  },
  empty: {
    textAlign: "center",
    paddingTop: "80px",
    paddingBottom: "40px",
  },
  emptyIcon: {
    fontSize: "40px",
    color: "#1f2937",
    marginBottom: "16px",
  },
  emptyTitle: {
    color: "#4b5563",
    fontSize: "16px",
    fontWeight: "700",
    margin: "0 0 6px 0",
  },
  emptySub: {
    color: "#374151",
    fontSize: "13px",
    margin: 0,
  },
  card: {
    background: "#080810",
    border: "1px solid #111827",
    borderRadius: "12px",
    padding: "16px",
    cursor: "pointer",
    transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
  },
  cardHovered: {
    borderColor: "#1f2937",
    background: "#0d0d18",
  },
  cardSelected: {
    borderColor: "#2563eb",
    background: "#0d0d18",
    boxShadow: "0 0 20px rgba(37,99,235,0.12)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  cardAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  cardAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: "#111827",
    border: "1px solid #1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#6b7280",
    flexShrink: 0,
  },
  cardAuthorName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#d1d5db",
    margin: 0,
  },
  cardAuthorDate: {
    fontSize: "11px",
    color: "#374151",
    margin: 0,
  },
  badge: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
    padding: "3px 8px",
    borderRadius: "4px",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 6px 0",
    lineHeight: 1.35,
  },
  cardDesc: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "0 0 10px 0",
    lineHeight: 1.55,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardAddr: {
    fontSize: "11px",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  addrDot: {
    color: "#2563eb",
    fontSize: "12px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: "24px",
  },
  modal: {
    background: "#0a0a0f",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "28px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(37,99,235,0.08)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  modalTag: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "3px",
    color: "#2563eb",
    display: "block",
    marginBottom: "4px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#ffffff",
    margin: 0,
  },
  modalClose: {
    background: "none",
    border: "none",
    color: "#4b5563",
    fontSize: "18px",
    cursor: "pointer",
    padding: "4px",
    transition: "color 0.2s",
    lineHeight: 1,
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  formRow: {
    display: "flex",
    gap: "12px",
  },
  formLabel: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#4b5563",
  },
  formInput: {
    background: "#111118",
    border: "1px solid #1f2937",
    borderRadius: "8px",
    padding: "11px 14px",
    color: "#ffffff",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
  },
  cancelBtn: {
    flex: 1,
    background: "transparent",
    border: "1px solid #1f2937",
    color: "#6b7280",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "13px",
    cursor: "pointer",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  submitBtn: {
    flex: 1,
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "2px",
    cursor: "pointer",
    transition: "background 0.2s",
    boxShadow: "0 0 20px rgba(37,99,235,0.3)",
    fontFamily: "inherit",
  },
}

export default Home