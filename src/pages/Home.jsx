import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import EventDetail from "../components/EventDetail"

const CATEGORIES = [
  { id: "all", label: "Tout", emoji: "🎉" },
  { id: "bar", label: "Bars", emoji: "🍺" },
  { id: "restaurant", label: "Restos", emoji: "🍽️" },
  { id: "cinema", label: "Cinéma", emoji: "🎬" },
  { id: "parc", label: "Parcs", emoji: "🎡" },
]

const CATEGORIE_COLORS = {
  bar: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  restaurant: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  cinema: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  parc: "bg-green-500/20 text-green-400 border-green-500/30",
}

const API_URL = import.meta.env.VITE_API_URL

function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const [events, setEvents] = useState([])
  const [filtre, setFiltre] = useState("all")
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    titre: "", description: "", categorie: "bar", adresse: ""
  })

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

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a0a00 50%, #0f0f0f 100%)" }}>

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-sm sticky top-0 z-40" style={{ background: "rgba(0,0,0,0.6)" }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎊</span>
          <h1 className="text-2xl font-black tracking-widest text-amber-400 uppercase">Bandzaye</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-neutral-950 font-black text-xs">
              {user.nom?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-white font-medium">{user.nom}</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-sm px-5 py-2 rounded-full transition cursor-pointer shadow-lg shadow-amber-400/20"
          >
            🎤 Publier
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-500 hover:text-white transition cursor-pointer"
          >
            Quitter
          </button>
        </div>
      </nav>

      {/* Hero bandeau */}
      <div className="px-6 py-8 text-center border-b border-white/10">
        <p className="text-4xl mb-2">🎶🔥🎉</p>
        <h2 className="text-3xl font-black text-white mb-1">
          Qu'est-ce qui se passe <span className="text-amber-400">près de toi ?</span>
        </h2>
        <p className="text-neutral-400 text-sm">Découvre les bons plans, sorties et événements du moment</p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 px-6 py-4 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFiltre(cat.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition cursor-pointer border ${
              filtre === cat.id
                ? "bg-amber-400 text-neutral-950 border-amber-400 shadow-lg shadow-amber-400/30"
                : "bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">

          {eventsFiltres.length === 0 && (
            <div className="col-span-full text-center mt-20">
              <p className="text-5xl mb-4">🎈</p>
              <p className="text-neutral-400 text-lg font-semibold">Rien pour l'instant...</p>
              <p className="text-neutral-600 text-sm mt-1">Sois le premier à partager un bon plan !</p>
            </div>
          )}

          {eventsFiltres.map(event => (
            <div
              key={event.id}
              onClick={() => setSelected(event)}
              className={`rounded-2xl p-4 cursor-pointer transition-all border hover:scale-[1.02] hover:shadow-xl ${
                selected?.id === event.id
                  ? "border-amber-400 shadow-amber-400/20 shadow-xl bg-white/10"
                  : "border-white/10 bg-white/5 hover:bg-white/8"
              }`}
            >
              {/* Auteur */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-neutral-950 font-black text-sm shadow-md">
                  {event.auteur?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{event.auteur}</p>
                  <p className="text-neutral-500 text-xs">
                    {new Date(event.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${CATEGORIE_COLORS[event.categorie] || "bg-white/10 text-white border-white/20"}`}>
                  {CATEGORIES.find(c => c.id === event.categorie)?.emoji} {event.categorie}
                </span>
              </div>

              {/* Contenu */}
              <h3 className="font-black text-white text-base mb-1">{event.titre}</h3>
              <p className="text-neutral-400 text-sm line-clamp-2 mb-3">{event.description}</p>
              {event.adresse && (
                <p className="text-neutral-500 text-xs flex items-center gap-1">
                  📍 {event.adresse}
                </p>
              )}
            </div>
          ))}
        </div>

        {selected && <EventDetail event={selected} onClose={() => setSelected(null)} />}
      </div>

      {/* Modal publier */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-5">
              <p className="text-3xl mb-1">📣</p>
              <h2 className="text-white font-black text-xl">Partage un bon plan !</h2>
              <p className="text-neutral-500 text-sm mt-1">Dis-nous ce qui se passe près de toi</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Titre de l'événement *"
                value={form.titre}
                onChange={e => setForm({...form, titre: e.target.value})}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 placeholder-neutral-600 transition"
              />
              <textarea
                placeholder="Décris l'ambiance, les détails..."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 placeholder-neutral-600 h-24 resize-none transition"
              />
              <select
                value={form.categorie}
                onChange={e => setForm({...form, categorie: e.target.value})}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 transition"
              >
                <option value="bar">🍺 Bar</option>
                <option value="restaurant">🍽️ Restaurant</option>
                <option value="cinema">🎬 Cinéma</option>
                <option value="parc">🎡 Parc</option>
              </select>
              <input
                type="text"
                placeholder="📍 Adresse ou quartier"
                value={form.adresse}
                onChange={e => setForm({...form, adresse: e.target.value})}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 placeholder-neutral-600 transition"
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-white/10 text-neutral-400 rounded-xl py-3 text-sm hover:text-white transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl py-3 text-sm transition cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  🎉 Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home