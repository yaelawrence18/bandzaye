import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

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
      day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  return (
    <div className="w-96 border-l border-neutral-800 bg-neutral-950 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <span className="text-xs bg-neutral-800 text-amber-400 px-2 py-1 rounded-full font-semibold uppercase">
          {event.categorie}
        </span>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-white text-xl leading-none cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Détails */}
      <div className="px-4 py-4 border-b border-neutral-800">
        <h2 className="text-white font-bold text-lg mb-1">{event.titre}</h2>
        <p className="text-neutral-400 text-sm mb-3">{event.description}</p>
        {event.adresse && (
          <p className="text-neutral-500 text-xs mb-1">📍 {event.adresse}</p>
        )}
        {event.date_event && (
          <p className="text-neutral-500 text-xs mb-1">📅 {formatDate(event.date_event)}</p>
        )}
        <p className="text-neutral-600 text-xs mt-2">Publié par {event.auteur}</p>
      </div>

      {/* Commentaires */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        <h3 className="text-white font-semibold text-sm">
          Commentaires ({comments.length})
        </h3>
        {comments.length === 0 && (
          <p className="text-neutral-600 text-sm">Sois le premier à commenter !</p>
        )}
        {comments.map(comment => (
          <div key={comment.id} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-amber-400 text-xs font-semibold">{comment.auteur}</span>
              <span className="text-neutral-600 text-xs">{formatDate(comment.created_at)}</span>
            </div>
            <p className="text-neutral-300 text-sm">{comment.contenu}</p>
          </div>
        ))}
      </div>

      {/* Formulaire commentaire */}
      <form onSubmit={handleComment} className="px-4 py-3 border-t border-neutral-800 flex gap-2">
        <input
          type="text"
          placeholder="Ajouter un commentaire..."
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold rounded-lg px-4 py-2 text-sm transition cursor-pointer"
        >
          →
        </button>
      </form>
    </div>
  )
}

export default EventDetail