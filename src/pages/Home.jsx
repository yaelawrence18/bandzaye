import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import EventDetail from "../components/EventDetail"

const API_URL = import.meta.env.VITE_API_URL

const CATEGORIES = [
  { id: "all",        label: "Tout",           icon: "⊞" },
  { id: "bar",        label: "Bars",           icon: "🍻" },
  { id: "restaurant", label: "Resto & Maquis", icon: "🍖" },
  { id: "cinema",     label: "Cinéma",         icon: "🎬" },
  { id: "parc",       label: "Parcs",          icon: "🌿" },
]

const CAT_COLORS = {
  bar:        { bg: "#E6F1FB", color: "#0C447C", border: "#A8CBF0", dot: "#378ADD" },
  restaurant: { bg: "#E1F5EE", color: "#085041", border: "#5DCAA5", dot: "#1D9E75" },
  cinema:     { bg: "#EEEDFE", color: "#3C3489", border: "#B0ACEF", dot: "#7F77DD" },
  parc:       { bg: "#EAF3DE", color: "#27500A", border: "#90C060", dot: "#4E9020" },
}

const CAT_GRAD = {
  bar:        "linear-gradient(135deg,#042C53,#378ADD)",
  restaurant: "linear-gradient(135deg,#04342C,#1D9E75)",
  cinema:     "linear-gradient(135deg,#26215C,#7F77DD)",
  parc:       "linear-gradient(135deg,#173404,#639922)",
}

const CAT_EMOJI = { bar: "🍻", restaurant: "🍖", cinema: "🎬", parc: "🌿" }

// ── Mock business announcements ──────────────────────────────────────────────
const MOCK_ANNOUNCEMENTS = [
  {
    id: 1, biz: "Le Maquis du Port", emoji: "🍖",
    grad: "linear-gradient(135deg,#04342C,#1D9E75)",
    badge: "promo", badgeLabel: "Promo",
    badgeColors: { bg: "#E1F5EE", color: "#085041" },
    title: "Livraison offerte dès 5 000 FCFA",
    sub: "Ce soir seulement, commandez en ligne !",
    time: "12 min",
  },
  {
    id: 2, biz: "Plage des Sabliers", emoji: "🌊",
    grad: "linear-gradient(135deg,#042C53,#185FA5)",
    badge: "event", badgeLabel: "Événement",
    badgeColors: { bg: "#E6F1FB", color: "#0C447C" },
    title: "Tournoi beach-volley ouvert",
    sub: "Inscriptions jusqu'à 16h · 1 000 FCFA/équipe",
    time: "30 min",
  },
  {
    id: 3, biz: "Club Le Tropique", emoji: "🎶",
    grad: "linear-gradient(135deg,#4A1B0C,#D85A30)",
    badge: "event", badgeLabel: "Événement",
    badgeColors: { bg: "#FAECE7", color: "#712B13" },
    title: "Afrobeats Night — DJ Élan",
    sub: "Vendredi 22h · Entrée 3 000 FCFA",
    time: "2h",
  },
  {
    id: 4, biz: "Espace Raponda", emoji: "🎨",
    grad: "linear-gradient(135deg,#26215C,#534AB7)",
    badge: "live", badgeLabel: "En direct",
    badgeColors: { bg: "#EEEDFE", color: "#3C3489" },
    title: "Vernissage exposition ce soir",
    sub: "Entrée libre · Dès 18h30",
    time: "45 min",
  },
  {
    id: 5, biz: "Stade de l'Amitié", emoji: "⚽",
    grad: "linear-gradient(135deg,#173404,#3B6D11)",
    badge: "live", badgeLabel: "Live",
    badgeColors: { bg: "#EAF3DE", color: "#27500A" },
    title: "Match à 17h — places disponibles",
    sub: "Championnat National · Tribune Sud",
    time: "1h",
  },
  {
    id: 6, biz: "Restaurant Léon", emoji: "🥘",
    grad: "linear-gradient(135deg,#3D1A00,#A84C00)",
    badge: "promo", badgeLabel: "Promo",
    badgeColors: { bg: "#FAEEDA", color: "#633806" },
    title: "Menu du jour à 2 500 FCFA",
    sub: "Poulet DG + boisson + dessert inclus",
    time: "20 min",
  },
]

const GREEN       = "#1D9E75"
const GREEN_DARK  = "#0F6E56"
const GREEN_LIGHT = "#E1F5EE"
const GREEN_MID   = "#5DCAA5"

export default function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const [events,   setEvents]   = useState([])
  const [filtre,   setFiltre]   = useState("all")
  const [search,   setSearch]   = useState("")
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ titre: "", description: "", categorie: "restaurant", adresse: "" })
  const [slide,    setSlide]    = useState(0)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(null)
  const progRef  = useRef(null)
  const INTERVAL = 4000

  useEffect(() => { fetchEvents() }, [])

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events`)
      setEvents(res.data)
    } catch (err) { console.log(err) }
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
      await axios.post(`${API_URL}/api/events`, form, { headers: { Authorization: `Bearer ${token}` } })
      setShowForm(false)
      setForm({ titre: "", description: "", categorie: "restaurant", adresse: "" })
      fetchEvents()
    } catch (err) { console.log(err) }
  }

  const filtered = events.filter(e => {
    const matchCat = filtre === "all" || e.categorie === filtre
    const q = search.toLowerCase()
    const matchSearch = !q
      || e.titre?.toLowerCase().includes(q)
      || e.adresse?.toLowerCase().includes(q)
      || e.categorie?.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const startCarousel = (len) => {
    clearInterval(timerRef.current)
    clearInterval(progRef.current)
    setProgress(0)
    let p = 0
    progRef.current = setInterval(() => {
      p += 100 / (INTERVAL / 100)
      if (p >= 100) p = 100
      setProgress(p)
    }, 100)
    timerRef.current = setInterval(() => {
      setSlide(s => (s + 1) % len)
      setProgress(0); p = 0
    }, INTERVAL)
  }

  useEffect(() => {
    if (!filtered.length) return
    startCarousel(filtered.length)
    return () => { clearInterval(timerRef.current); clearInterval(progRef.current) }
  }, [filtered.length, filtre, search])

  useEffect(() => {
    if (slide >= filtered.length && filtered.length > 0) setSlide(0)
  }, [filtered.length])

  const goTo = (n) => {
    setSlide((n + filtered.length) % filtered.length)
    startCarousel(filtered.length)
  }

  const initials  = name => name?.charAt(0).toUpperCase() || "?"
  const initials2 = name => name?.slice(0, 2).toUpperCase() || "?"

  const formatDate = (date) => {
    if (!date) return ""
    const d    = new Date(date)
    const diff = Math.floor((Date.now() - d) / 60000)
    if (diff < 60)   return `Il y a ${diff}min`
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
  }

  const cs = (cat) => CAT_COLORS[cat] || { bg: "#F3F4F6", color: "#4B5563", border: "#D1D5DB", dot: "#9CA3AF" }

  return (
    <div style={s.root}>

      {/* ── Topbar ── */}
      <div style={s.topbar}>
        <div style={s.logo}>BAND<span style={s.logoGreen}>ZAYE</span></div>
        <nav style={s.nav}>
          <span style={{ ...s.navLink, ...s.navActive }}>Découvrir</span>
          <span style={s.navLink}>Événements</span>
          <span style={s.navLink}>Carte</span>
          <div style={s.navUser}>
            <div style={s.navAvatar}>{initials(user.nom)}</div>
            <span style={s.navUserName}>{user.nom}</span>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Quitter</button>
        </nav>
      </div>

      {/* ── Search ── */}
      <div style={s.searchBar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Chercher un lieu, activité…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <span style={s.clearBtn} onClick={() => setSearch("")}>✕</span>}
        </div>
        <div style={s.geoPill}>
          <span style={s.geoDot} />
          Libreville · 2 km
        </div>
      </div>

      {/* ── Chips ── */}
      <div style={s.chipsWrap}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFiltre(cat.id)}
            style={{ ...s.chip, ...(filtre === cat.id ? s.chipActive : {}) }}
          >
            <span>{cat.icon}</span> {cat.label}
          </button>
        ))}
      </div>

      <div style={s.divider} />

      {/* ── Carousel ── */}
      {filtered.length > 0 ? (
        <div style={s.carouselWrap}>
          <div style={{ ...s.progress, width: `${progress}%` }} />
          <div style={{ ...s.track, transform: `translateX(-${slide * 100}%)` }}>
            {filtered.map((event) => {
              const grad = CAT_GRAD[event.categorie] || "linear-gradient(135deg,#1f2937,#374151)"
              const c    = cs(event.categorie)
              return (
                <div key={event.id} style={s.slideItem}>
                  <div style={{ ...s.slideBg, background: grad }}>
                    <span style={s.slideEmoji}>{CAT_EMOJI[event.categorie] || "📍"}</span>
                  </div>
                  <div style={s.slideOverlay}>
                    <div style={s.slideTag}>
                      <span style={{ ...s.tagDot, background: c.dot }} />
                      {event.categorie?.toUpperCase()}
                    </div>
                    <div style={s.slideName}>{event.titre}</div>
                    <div style={s.slideEvt}>
                      {event.description?.slice(0, 70)}{event.description?.length > 70 ? "…" : ""}
                    </div>
                    <div style={s.slideMeta}>
                      {event.adresse && <span style={s.mpill}>📍 {event.adresse}</span>}
                      <span style={s.mpill}>🕐 {formatDate(event.created_at)}</span>
                      <button style={s.slideBtn} onClick={() => setSelected(event)}>Explorer →</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={s.dots}>
            {filtered.map((_, i) => (
              <div key={i} onClick={() => goTo(i)} style={{ ...s.dot, ...(i === slide ? s.dotActive : {}) }} />
            ))}
          </div>
          <div style={s.arrows}>
            <button style={s.arrow} onClick={() => goTo(slide - 1)}>‹</button>
            <button style={s.arrow} onClick={() => goTo(slide + 1)}>›</button>
          </div>
        </div>
      ) : (
        <div style={s.noResults}>
          <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>◎</span>
          Aucun résultat pour cette recherche
        </div>
      )}

      {/* ══════════════════════════════════════════
          SECTION — ÉVÉNEMENTS EN DIRECT
      ══════════════════════════════════════════ */}
      <div style={{ ...s.divider, margin: "20px 20px 0" }} />

      <div style={s.secHd}>
        <h2 style={s.secTitle}><span style={s.secIcon}>📣</span> Événements en direct</h2>
        <button style={s.secLink} onClick={() => setShowForm(true)}>+ Publier ↗</button>
      </div>

      {filtered.length === 0 ? (
        <div style={s.emptyFeed}>
          <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>🌍</span>
          Aucun événement — sois le premier à publier !
        </div>
      ) : (
        <div style={s.eventGrid}>
          {filtered.map(event => {
            const c    = cs(event.categorie)
            const grad = CAT_GRAD[event.categorie] || "linear-gradient(135deg,#1f2937,#374151)"
            return (
              <div key={event.id} style={s.eventCard} onClick={() => setSelected(event)}>
                {/* Visual banner */}
                <div style={{ ...s.eventBanner, background: grad }}>
                  <span style={s.eventBannerEmoji}>{CAT_EMOJI[event.categorie] || "📍"}</span>
                  <div style={{ ...s.eventBadge, background: c.bg, color: c.color }}>
                    {event.categorie?.toUpperCase()}
                  </div>
                </div>
                {/* Body */}
                <div style={s.eventBody}>
                  <div style={s.eventTitle}>{event.titre}</div>
                  <div style={s.eventDesc}>
                    {event.description?.slice(0, 72)}{event.description?.length > 72 ? "…" : ""}
                  </div>
                  <div style={s.eventMeta}>
                    {event.adresse && (
                      <span style={s.eventMetaPill}>
                        <span style={{ color: c.dot }}>📍</span> {event.adresse}
                      </span>
                    )}
                    <span style={s.eventMetaPill}>
                      <span style={{ color: c.dot }}>🕐</span> {formatDate(event.created_at)}
                    </span>
                  </div>
                </div>
                {/* Footer */}
                <div style={s.eventFooter}>
                  <div style={s.eventAuthor}>
                    <div style={{ ...s.eventAvatar, background: c.bg, color: c.color }}>
                      {initials2(event.auteur)}
                    </div>
                    <span style={s.eventAuthorName}>{event.auteur}</span>
                  </div>
                  <span style={s.eventExplore}>Voir →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════
          SECTION — ANNONCES DES BUSINESS
      ══════════════════════════════════════════ */}
      <div style={{ ...s.divider, margin: "20px 20px 0" }} />

      <div style={s.secHd}>
        <h2 style={s.secTitle}><span style={s.secIcon}>🏪</span> Annonces des business</h2>
        <span style={s.secLink}>Voir tout →</span>
      </div>

      <div style={s.annScroll}>
        {MOCK_ANNOUNCEMENTS.map(ann => (
          <div key={ann.id} style={s.annCard}>
            <div style={{ ...s.annImg, background: ann.grad }}>
              <span style={{ fontSize: 42, opacity: 0.92 }}>{ann.emoji}</span>
            </div>
            <div style={s.annBody}>
              <div style={{ ...s.annBadge, background: ann.badgeColors.bg, color: ann.badgeColors.color }}>
                {ann.badge === "live" && <span style={s.liveDot} />}
                {ann.badgeLabel}
              </div>
              <div style={s.annTitle}>{ann.title}</div>
              <div style={s.annSub}>{ann.sub}</div>
              <div style={s.annFoot}>
                <div style={s.annBizRow}>
                  <div style={{ ...s.annBizDot, background: ann.badgeColors.bg, color: ann.badgeColors.color }}>
                    {ann.emoji}
                  </div>
                  <span style={s.annBizName}>{ann.biz}</span>
                </div>
                <span style={s.annTime}>Il y a {ann.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 32 }} />

      {/* ── Event detail overlay ── */}
      {selected && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <EventDetail event={selected} onClose={() => setSelected(null)} />
        </div>
      )}

      {/* ── Publish modal ── */}
      {showForm && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <div>
                <span style={s.modalTag}>NOUVEAU</span>
                <h2 style={s.modalTitle}>Partage un bon plan</h2>
              </div>
              <button onClick={() => setShowForm(false)} style={s.modalClose}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={s.modalForm}>
              <div style={s.formField}>
                <label style={s.formLabel}>TITRE</label>
                <input
                  type="text" placeholder="Titre de l'événement"
                  value={form.titre}
                  onChange={e => setForm({ ...form, titre: e.target.value })}
                  style={s.formInput}
                />
              </div>
              <div style={s.formField}>
                <label style={s.formLabel}>DESCRIPTION</label>
                <textarea
                  placeholder="Décris l'ambiance, les détails..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  style={{ ...s.formInput, height: 80, resize: "none" }}
                />
              </div>
              <div style={s.formRow}>
                <div style={{ ...s.formField, flex: 1 }}>
                  <label style={s.formLabel}>CATÉGORIE</label>
                  <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} style={s.formInput}>
                    <option value="bar">Bar</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="cinema">Cinéma</option>
                    <option value="parc">Parc</option>
                  </select>
                </div>
                <div style={{ ...s.formField, flex: 1 }}>
                  <label style={s.formLabel}>ADRESSE</label>
                  <input
                    type="text" placeholder="Quartier ou adresse"
                    value={form.adresse}
                    onChange={e => setForm({ ...form, adresse: e.target.value })}
                    style={s.formInput}
                  />
                </div>
              </div>
              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowForm(false)} style={s.cancelBtn}>Annuler</button>
                <button type="submit" style={s.submitBtn}>PUBLIER</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── STYLES ─────────────────────────── */
const s = {
  root: {
    minHeight: "100vh",
    background: "var(--color-background-primary, #fff)",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "var(--color-text-primary, #111)",
  },

  // Topbar
  topbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px 10px",
    borderBottom: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
  },
  logo: { fontSize: 22, fontWeight: 500, letterSpacing: "-0.5px" },
  logoGreen: { color: GREEN },
  nav: { display: "flex", gap: 6, alignItems: "center" },
  navLink: {
    fontSize: 13, color: "var(--color-text-secondary, #6b7280)",
    padding: "5px 10px", borderRadius: 8, cursor: "pointer",
    border: "0.5px solid transparent",
  },
  navActive: { color: GREEN, fontWeight: 500 },
  navUser: {
    display: "flex", alignItems: "center", gap: 7,
    background: GREEN_LIGHT, borderRadius: 100,
    padding: "5px 11px 5px 6px", border: `0.5px solid ${GREEN_MID}`,
  },
  navAvatar: {
    width: 26, height: 26, borderRadius: "50%", background: GREEN,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, color: "#fff",
  },
  navUserName: { fontSize: 13, fontWeight: 500, color: GREEN_DARK },
  logoutBtn: {
    background: "none", border: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
    color: "var(--color-text-secondary, #6b7280)", borderRadius: 8,
    padding: "5px 10px", fontSize: 13, cursor: "pointer",
  },

  // Search
  searchBar: { display: "flex", alignItems: "center", gap: 8, padding: "8px 20px 14px" },
  searchWrap: {
    flex: 1, display: "flex", alignItems: "center", gap: 8,
    background: "var(--color-background-secondary, #f9fafb)",
    border: "0.5px solid var(--color-border-secondary, #e5e7eb)",
    borderRadius: 100, padding: "8px 14px",
  },
  searchIcon: { fontSize: 15, opacity: 0.5 },
  searchInput: {
    flex: 1, border: "none", background: "transparent",
    fontSize: 14, color: "var(--color-text-primary, #111)", outline: "none",
  },
  clearBtn: { fontSize: 12, color: "var(--color-text-tertiary, #9ca3af)", cursor: "pointer", padding: "2px 4px" },
  geoPill: {
    display: "flex", alignItems: "center", gap: 6, fontSize: 12,
    color: GREEN_DARK, background: GREEN_LIGHT,
    border: `0.5px solid ${GREEN_MID}`, borderRadius: 100,
    padding: "6px 12px", whiteSpace: "nowrap",
  },
  geoDot: {
    width: 7, height: 7, borderRadius: "50%", background: GREEN,
    display: "inline-block", boxShadow: `0 0 0 2px ${GREEN_MID}`,
  },

  // Chips
  chipsWrap: { display: "flex", gap: 8, padding: "0 20px 16px", flexWrap: "wrap" },
  chip: {
    fontSize: 12, padding: "5px 13px", borderRadius: 100,
    border: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
    color: "var(--color-text-secondary, #6b7280)",
    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
    whiteSpace: "nowrap", background: "transparent", fontFamily: "inherit",
  },
  chipActive: { background: GREEN_LIGHT, borderColor: GREEN_MID, color: "#085041" },
  divider: { height: "0.5px", background: "var(--color-border-tertiary, #e5e7eb)", margin: "4px 20px 0" },

  // Carousel
  carouselWrap: { position: "relative", width: "100%", overflow: "hidden", height: 300 },
  progress: {
    position: "absolute", top: 0, left: 0, height: 3,
    background: GREEN_MID, borderRadius: "0 2px 0 0",
    transition: "width 0.1s linear", zIndex: 10,
  },
  track: { display: "flex", height: "100%", transition: "transform 0.55s cubic-bezier(.4,0,.2,1)" },
  slideItem: { minWidth: "100%", height: "100%", position: "relative", overflow: "hidden" },
  slideBg: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" },
  slideEmoji: { fontSize: 72, opacity: 0.9 },
  slideOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 18px 14px",
    background: "linear-gradient(to top,rgba(0,0,0,.82) 0%,rgba(0,0,0,.28) 65%,transparent 100%)",
  },
  slideTag: {
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 11, fontWeight: 500, letterSpacing: ".7px", color: "#fff",
    background: "rgba(255,255,255,.18)", border: "0.5px solid rgba(255,255,255,.3)",
    padding: "3px 9px", borderRadius: 100, marginBottom: 6,
  },
  tagDot: { width: 6, height: 6, borderRadius: "50%" },
  slideName: { fontSize: 20, fontWeight: 500, color: "#fff", marginBottom: 3, lineHeight: 1.2 },
  slideEvt: { fontSize: 13, color: "rgba(255,255,255,.82)", marginBottom: 9 },
  slideMeta: { display: "flex", alignItems: "center", gap: 12 },
  mpill: { fontSize: 12, color: "rgba(255,255,255,.85)", display: "flex", alignItems: "center", gap: 4 },
  slideBtn: {
    marginLeft: "auto", background: GREEN, color: "#fff",
    border: "none", fontSize: 13, fontWeight: 500,
    padding: "6px 14px", borderRadius: 100, cursor: "pointer",
  },
  dots: {
    position: "absolute", bottom: 10, left: "50%",
    transform: "translateX(-50%)", display: "flex", gap: 5,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    background: "rgba(255,255,255,.4)", cursor: "pointer", transition: "all .3s",
  },
  dotActive: { width: 18, background: "#fff" },
  arrows: {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    width: "100%", display: "flex", justifyContent: "space-between",
    padding: "0 10px", pointerEvents: "none",
  },
  arrow: {
    width: 34, height: 34, borderRadius: "50%",
    background: "rgba(255,255,255,.15)", border: "0.5px solid rgba(255,255,255,.25)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", pointerEvents: "all", fontSize: 20, lineHeight: 1,
  },
  noResults: {
    textAlign: "center", padding: "40px 20px",
    color: "var(--color-text-secondary, #6b7280)", fontSize: 14,
  },

  // Section header
  secHd: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 20px 12px",
  },
  secTitle: {
    fontSize: 16, fontWeight: 500, color: "var(--color-text-primary, #111)",
    display: "flex", alignItems: "center", gap: 7, margin: 0,
  },
  secIcon: { fontSize: 18 },
  secLink: {
    fontSize: 12, color: GREEN, cursor: "pointer",
    background: "none", border: "none", fontFamily: "inherit",
  },

  // ── Event grid (large visual cards)
  emptyFeed: {
    textAlign: "center", padding: "32px 20px",
    color: "var(--color-text-secondary, #9ca3af)", fontSize: 14,
  },
  eventGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 14, padding: "0 20px 4px",
  },
  eventCard: {
    background: "var(--color-background-primary, #fff)",
    border: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
    borderRadius: 18, overflow: "hidden", cursor: "pointer",
    display: "flex", flexDirection: "column",
    transition: "box-shadow .2s",
  },
  eventBanner: {
    height: 130, display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative",
  },
  eventBannerEmoji: { fontSize: 54, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" },
  eventBadge: {
    position: "absolute", top: 10, right: 10,
    fontSize: 10, fontWeight: 600, letterSpacing: 1,
    padding: "3px 9px", borderRadius: 100,
  },
  eventBody: { padding: "12px 14px 8px" },
  eventTitle: {
    fontSize: 14, fontWeight: 600, color: "var(--color-text-primary, #111)",
    marginBottom: 5, lineHeight: 1.35,
  },
  eventDesc: {
    fontSize: 12, lineHeight: 1.55,
    color: "var(--color-text-secondary, #6b7280)", marginBottom: 10,
  },
  eventMeta: { display: "flex", flexDirection: "column", gap: 4 },
  eventMetaPill: {
    display: "flex", alignItems: "center", gap: 5,
    fontSize: 11, color: "var(--color-text-secondary, #6b7280)",
  },
  eventFooter: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "9px 14px 12px",
    borderTop: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
    marginTop: "auto",
  },
  eventAuthor: { display: "flex", alignItems: "center", gap: 7 },
  eventAvatar: {
    width: 24, height: 24, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: 700,
  },
  eventAuthorName: { fontSize: 12, color: "var(--color-text-secondary, #6b7280)" },
  eventExplore: { fontSize: 12, fontWeight: 600, color: GREEN },

  // ── Business announcements
  annScroll: {
    display: "flex", gap: 12, padding: "0 20px 20px",
    overflowX: "auto", scrollbarWidth: "none",
  },
  annCard: {
    minWidth: 230, maxWidth: 230, flexShrink: 0,
    background: "var(--color-background-primary, #fff)",
    border: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
    borderRadius: 16, overflow: "hidden", cursor: "pointer",
  },
  annImg: { height: 100, display: "flex", alignItems: "center", justifyContent: "center" },
  annBody: { padding: "10px 12px 12px" },
  annBadge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    fontSize: 10, fontWeight: 600, padding: "3px 8px",
    borderRadius: 100, marginBottom: 7,
  },
  liveDot: {
    width: 5, height: 5, borderRadius: "50%", background: GREEN,
    display: "inline-block", boxShadow: `0 0 0 2px ${GREEN_MID}`,
  },
  annTitle: {
    fontSize: 13, fontWeight: 600, color: "var(--color-text-primary, #111)",
    marginBottom: 3, lineHeight: 1.35,
  },
  annSub: {
    fontSize: 11, color: "var(--color-text-secondary, #6b7280)",
    lineHeight: 1.45, marginBottom: 9,
  },
  annFoot: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    paddingTop: 8, borderTop: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
  },
  annBizRow: { display: "flex", alignItems: "center", gap: 5 },
  annBizDot: {
    width: 20, height: 20, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10,
  },
  annBizName: { fontSize: 11, color: "var(--color-text-secondary, #6b7280)" },
  annTime: { fontSize: 10, color: "var(--color-text-tertiary, #9ca3af)" },

  // Overlay + modal
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)", display: "flex",
    alignItems: "center", justifyContent: "center",
    zIndex: 50, padding: 24,
  },
  modal: {
    background: "var(--color-background-primary, #fff)",
    border: "0.5px solid var(--color-border-secondary, #e5e7eb)",
    borderRadius: 20, padding: 28, width: "100%", maxWidth: 480,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  modalHeader: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 24,
  },
  modalTag: { fontSize: 10, fontWeight: 700, letterSpacing: 3, color: GREEN, display: "block", marginBottom: 4 },
  modalTitle: { fontSize: 20, fontWeight: 600, margin: 0 },
  modalClose: {
    background: "none", border: "none",
    color: "var(--color-text-secondary, #9ca3af)",
    fontSize: 18, cursor: "pointer", padding: 4, lineHeight: 1,
  },
  modalForm: { display: "flex", flexDirection: "column", gap: 16 },
  formField: { display: "flex", flexDirection: "column", gap: 6 },
  formRow: { display: "flex", gap: 12 },
  formLabel: { fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--color-text-secondary, #9ca3af)" },
  formInput: {
    background: "var(--color-background-secondary, #f9fafb)",
    border: "0.5px solid var(--color-border-secondary, #e5e7eb)",
    borderRadius: 10, padding: "11px 14px",
    color: "var(--color-text-primary, #111)",
    fontSize: 13, outline: "none", fontFamily: "inherit",
    width: "100%", boxSizing: "border-box",
  },
  modalActions: { display: "flex", gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, background: "transparent",
    border: "0.5px solid var(--color-border-secondary, #e5e7eb)",
    color: "var(--color-text-secondary, #9ca3af)",
    borderRadius: 10, padding: 12, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
  },
  submitBtn: {
    flex: 1, background: GREEN, color: "#fff",
    border: "none", borderRadius: 10, padding: 12,
    fontSize: 13, fontWeight: 700, letterSpacing: 2,
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(29,158,117,0.35)",
  },
}