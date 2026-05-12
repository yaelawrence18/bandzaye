import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

const CATEGORIE_LABELS = {
  bar: "BAR",
  restaurant: "RESTO",
  cinema: "CINÉMA",
  parc: "PARC",
}

function EventDetail({ event, onClose }) {
  const [comments, setComments] = useState([])
  const [contenu, setContenu] = useState("")
  const [loading, setLoading] = useState(false)
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  useEffect(() => {
    fetchComments()
  }, [event.id])

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/events/${event.id}/comments`)
      setComments(res.data)
    } catch (err) {
      console.log(err)
    }
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
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const initials = (name) => name?.charAt(0).toUpperCase() || "?"

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.catTag}>
          {CATEGORIE_LABELS[event.categorie] || event.categorie}
        </span>
        <button onClick={onClose} style={styles.closeBtn}>
          ✕
        </button>
      </div>

      {/* Event info */}
      <div style={styles.body}>
        {/* Author */}
        <div style={styles.authorRow}>
          <div style={styles.avatar}>{initials(event.auteur)}</div>
          <div>
            <p style={styles.authorName}>{event.auteur}</p>
            <p style={styles.authorDate}>{formatDate(event.created_at)}</p>
          </div>
        </div>

        <h2 style={styles.title}>{event.titre}</h2>
        <p style={styles.desc}>{event.description}</p>

        {event.adresse && (
          <div style={styles.metaRow}>
            <span style={styles.metaIcon}>◎</span>
            <span style={styles.metaText}>{event.adresse}</span>
          </div>
        )}
        {event.date_event && (
          <div style={styles.metaRow}>
            <span style={styles.metaIcon}>◷</span>
            <span style={styles.metaText}>{formatDate(event.date_event)}</span>
          </div>
        )}

        <div style={styles.divider} />

        {/* Comments */}
        <div style={styles.commentsHeader}>
          <span style={styles.commentsLabel}>COMMENTAIRES</span>
          <span style={styles.commentCount}>{comments.length}</span>
        </div>

        <div style={styles.commentsList}>
          {comments.length === 0 && (
            <p style={styles.emptyComments}>Sois le premier à commenter</p>
          )}
          {comments.map(comment => (
            <div key={comment.id} style={styles.commentCard}>
              <div style={styles.commentTop}>
                <div style={styles.commentAvatar}>{initials(comment.auteur)}</div>
                <span style={styles.commentAuthor}>{comment.auteur}</span>
                <span style={styles.commentDate}>{formatDate(comment.created_at)}</span>
              </div>
              <p style={styles.commentText}>{comment.contenu}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comment form */}
      <form onSubmit={handleComment} style={styles.commentForm}>
        <input
          type="text"
          placeholder="Ajoute un commentaire..."
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          style={styles.commentInput}
          onFocus={e => e.target.style.borderColor = "#2563eb"}
          onBlur={e => e.target.style.borderColor = "#1f2937"}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.sendBtn,
            opacity: loading ? 0.5 : 1,
          }}
        >
          →
        </button>
      </form>
    </div>
  )
}

const styles = {
  panel: {
    width: "360px",
    minWidth: "360px",
    background: "#050508",
    borderLeft: "1px solid #1f2937",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #1f2937",
  },
  catTag: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#2563eb",
    background: "rgba(37,99,235,0.1)",
    border: "1px solid rgba(37,99,235,0.2)",
    padding: "4px 10px",
    borderRadius: "4px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#4b5563",
    fontSize: "16px",
    cursor: "pointer",
    padding: "4px",
    lineHeight: 1,
    transition: "color 0.2s",
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },
  authorRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    flexShrink: 0,
  },
  authorName: {
    color: "#e5e7eb",
    fontSize: "13px",
    fontWeight: "600",
    margin: 0,
  },
  authorDate: {
    color: "#4b5563",
    fontSize: "11px",
    margin: 0,
    marginTop: "1px",
  },
  title: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "800",
    margin: "0 0 10px 0",
    lineHeight: 1.3,
  },
  desc: {
    color: "#9ca3af",
    fontSize: "14px",
    lineHeight: 1.6,
    margin: "0 0 14px 0",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  metaIcon: {
    color: "#2563eb",
    fontSize: "14px",
    lineHeight: 1,
  },
  metaText: {
    color: "#6b7280",
    fontSize: "12px",
  },
  divider: {
    height: "1px",
    background: "#1f2937",
    margin: "20px 0",
  },
  commentsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  commentsLabel: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#4b5563",
  },
  commentCount: {
    fontSize: "11px",
    color: "#2563eb",
    background: "rgba(37,99,235,0.12)",
    padding: "2px 8px",
    borderRadius: "999px",
    fontWeight: "700",
  },
  commentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  emptyComments: {
    color: "#374151",
    fontSize: "13px",
    margin: 0,
  },
  commentCard: {
    background: "#0d0d14",
    border: "1px solid #1f2937",
    borderRadius: "10px",
    padding: "12px",
  },
  commentTop: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  commentAvatar: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "#1f2937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontSize: "10px",
    fontWeight: "700",
    flexShrink: 0,
  },
  commentAuthor: {
    color: "#d1d5db",
    fontSize: "12px",
    fontWeight: "600",
    flex: 1,
  },
  commentDate: {
    color: "#374151",
    fontSize: "10px",
  },
  commentText: {
    color: "#9ca3af",
    fontSize: "13px",
    margin: 0,
    lineHeight: 1.5,
  },
  commentForm: {
    padding: "16px 20px",
    borderTop: "1px solid #1f2937",
    display: "flex",
    gap: "8px",
    background: "#050508",
  },
  commentInput: {
    flex: 1,
    background: "#0d0d14",
    border: "1px solid #1f2937",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  sendBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "700",
    transition: "opacity 0.2s",
    boxShadow: "0 0 12px rgba(37,99,235,0.3)",
  },
}

export default EventDetail