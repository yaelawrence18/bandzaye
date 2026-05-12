import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) {
      setError("Veuillez remplir tous les champs.")
      return
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/register`, form)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-widest text-amber-400 uppercase">
            Bandzaye
          </h1>
          <p className="text-neutral-400 mt-2 text-sm tracking-wide">
            Rejoins la communauté
          </p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-white text-xl font-bold mb-6">Inscription</h2>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-neutral-400 text-sm mb-1.5">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="monpseudo"
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-400 transition placeholder-neutral-600"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-sm mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="toi@exemple.com"
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-400 transition placeholder-neutral-600"
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-sm mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-amber-400 transition placeholder-neutral-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold rounded-lg py-3 text-sm tracking-wide transition cursor-pointer"
            >
              {loading ? "Inscription..." : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-neutral-500 text-sm mt-6">
            Déjà un compte ?{" "}
            <Link to="/" className="text-amber-400 hover:underline">
              Connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register