import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

const GREEN = "#1D9E75"
const GREEN_DARK = "#0F6E56"
const GREEN_LIGHT = "#E1F5EE"
const GREEN_MID = "#5DCAA5"

const CAT_COLORS = {
  bar:        { bg: "#E6F1FB", color: "#0C447C", border: "#A8CBF0" },
  restaurant: { bg: "#E1F5EE", color: "#085041", border: "#5DCAA5" },
  cinema:     { bg: "#EEEDFE", color: "#3C3489", border: "#B0ACEF" },
  parc:       { bg: "#EAF3DE", color: "#27500A", border: "#90C060" },
}

const AVATAR_COLORS = [
  { bg: "#E1F5EE", color: "#085041" },
  { bg: "#E6F1FB", color: "#0C447C" },
  { bg: "#FAEEDA", color: "#633806" },
  { bg: "#EEEDFE", color: "#3C3489" },
]

function EventDetail({ event, onClose }) {
  const [comments, setComments] = useState([])
  const [contenu, setContenu] = useState("")
  const [loading, setLoading] = useState(false)
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => { fetchComments() }, [event.id])

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events/${event.id}/comments`)
      setComments(res.data)
    } catch (err) { console.log(err) }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!contenu.trim()) return
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `${API_URL}/api/events/${event.id}/comments`,
        { contenu },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setContenu("")
      fetchComments()
    } catch (err) { console.log(err) }
    finally { setLoading(false) }
  }

  const formatDate = (date) => {
    if (!date) return ""
    const d = new Date(date)
    const diff = Math.floor((Date.now() - d) / 60000)
    if (diff < 60) return `Il y a ${diff}min`
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  const initials = (name) => name?.slice(0, 2).toUpperCase() || "?"
  const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
  const cs = CAT_COLORS[event.categorie] || { bg: "#F3F4F6", color: "#4B5563", border: "#D1D5DB" }

  return (
    <div style={s.panel}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ ...s.catTag, background: cs.bg, color: cs.color, border: `0.5px solid ${cs.border}` }}>
          {event.categorie?.toUpperCase()}
        </div>
        <button onClick={onClose} style={s.closeBtn}>✕</button>
      </div>

      {/* Scrollable body */}
      <div style={s.body}>
        {/* Author */}
        <div style={s.authorRow}>
          <div style={{ ...s.avatar, background: GREEN_LIGHT, color: GREEN_DARK }}>
            {initials(event.auteur)}
          </div>
          <div>
            <p style={s.authorName}>{event.auteur}</p>
            <p style={s.authorDate}>{formatDate(event.created_at)}</p>
          </div>
        </div>

        <h2 style={s.title}>{event.titre}</h2>
        <p style={s.desc}>{event.description}</p>

        {event.adresse && (
          <div style={s.metaRow}>
            <span style={s.metaIcon}>📍</span>
            <span style={s.metaText}>{event.adresse}</span>
          </div>
        )}
        {event.date_event && (
          <div style={s.metaRow}>
            <span style={s.metaIcon}>🕐</span>
            <span style={s.metaText}>{formatDate(event.date_event)}</span>
          </div>
        )}

        <div style={s.divider} />

        {/* Comments */}
        <div style={s.commentsHeader}>
          <span style={s.commentsLabel}>
            <span style={{ fontSize: 13, marginRight: 5 }}>💬</span>
            Ce que disent les gens
          </span>
          <span style={s.commentCount}>{comments.length}</span>
        </div>

        <div style={s.commentsList}>
          {comments.length === 0 && (
            <p style={s.emptyComments}>Sois le premier à commenter</p>
          )}
          {comments.map((comment, idx) => {
            const ac = avatarColor(comment.auteur)
            return (
              <div key={comment.id} style={s.commentCard}>
                <div style={s.commentTop}>
                  <div style={{ ...s.commentAvatar, background: ac.bg, color: ac.color }}>
                    {initials(comment.auteur)}
                  </div>
                  <span style={s.commentAuthor}>{comment.auteur}</span>
                  <span style={s.commentDate}>{formatDate(comment.created_at)}</span>
                </div>
                <p style={s.commentText}>{comment.contenu}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Comment input */}
      <div style={s.commentForm}>
        <div style={{ ...s.commentAvatar, background: GREEN_LIGHT, color: GREEN_DARK, flexShrink: 0 }}>
          {initials(user.nom)}
        </div>
        <input
          type="text"
          placeholder="Laisser un avis…"
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleComment(e)}
          style={s.commentInput}
        />
        <button
          onClick={handleComment}
          disabled={loading}
          style={{ ...s.sendBtn, opacity: loading ? 0.5 : 1 }}
        >
          <span style={{ fontSize: 14 }}>→</span>
        </button>
      </div>
    </div>
  )
}

const s = {
  panel: {
    width: 380, minWidth: 380,
    background: "var(--color-background-primary, #fff)",
    borderLeft: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
    borderRadius: 20,
    display: "flex", flexDirection: "column", overflow: "hidden",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    maxHeight: "90vh",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
  },
  catTag: {
    fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
    padding: "4px 10px", borderRadius: 100,
  },
  closeBtn: {
    background: "none", border: "none",
    color: "var(--color-text-secondary, #9ca3af)",
    fontSize: 16, cursor: "pointer", padding: 4, lineHeight: 1,
    borderRadius: 8,
  },
  body: {
    flex: 1, overflowY: "auto", padding: 16,
    display: "flex", flexDirection: "column", gap: 0,
  },
  authorRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 600, flexShrink: 0,
  },
  authorName: { color: "var(--color-text-primary, #111)", fontSize: 13, fontWeight: 600, margin: 0 },
  authorDate: { color: "var(--color-text-tertiary, #9ca3af)", fontSize: 11, margin: 0, marginTop: 1 },
  title: {
    color: "var(--color-text-primary, #111)", fontSize: 18, fontWeight: 600,
    margin: "0 0 10px 0", lineHeight: 1.3,
  },
  desc: {
    color: "var(--color-text-secondary, #6b7280)", fontSize: 14,
    lineHeight: 1.6, margin: "0 0 12px 0",
  },
  metaRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  metaIcon: { fontSize: 14, lineHeight: 1 },
  metaText: { color: "var(--color-text-secondary, #6b7280)", fontSize: 12 },
  divider: {
    height: "0.5px",
    background: "var(--color-border-tertiary, #e5e7eb)",
    margin: "16px 0",
  },
  commentsHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 12,
  },
  commentsLabel: {
    fontSize: 12, fontWeight: 500,
    color: "var(--color-text-secondary, #6b7280)",
    display: "flex", alignItems: "center",
  },
  commentCount: {
    fontSize: 11, color: GREEN_DARK,
    background: GREEN_LIGHT,
    padding: "2px 8px", borderRadius: 100, fontWeight: 600,
  },
  commentsList: { display: "flex", flexDirection: "column", gap: 8 },
  emptyComments: { color: "var(--color-text-tertiary, #9ca3af)", fontSize: 13, margin: 0 },
  commentCard: {
    background: "var(--color-background-secondary, #f9fafb)",
    border: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
    borderRadius: 12, padding: "10px 12px",
  },
  commentTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  commentAvatar: {
    width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 600, flexShrink: 0,
  },
  commentAuthor: { color: "var(--color-text-primary, #111)", fontSize: 12, fontWeight: 600, flex: 1 },
  commentDate: { color: "var(--color-text-tertiary, #9ca3af)", fontSize: 10 },
  commentText: { color: "var(--color-text-secondary, #6b7280)", fontSize: 13, margin: 0, lineHeight: 1.5 },
  commentForm: {
    padding: "12px 16px",
    borderTop: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
    display: "flex", alignItems: "center", gap: 8,
    background: "var(--color-background-primary, #fff)",
  },
  commentInput: {
    flex: 1,
    background: "var(--color-background-secondary, #f9fafb)",
    border: "0.5px solid var(--color-border-secondary, #e5e7eb)",
    borderRadius: 100, padding: "8px 14px",
    color: "var(--color-text-primary, #111)",
    fontSize: 13, outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    background: GREEN, color: "#fff", border: "none",
    borderRadius: "50%", width: 34, height: 34,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", flexShrink: 0,
    boxShadow: `0 2px 8px rgba(29,158,117,0.35)`,
  },
}

export default EventDetail