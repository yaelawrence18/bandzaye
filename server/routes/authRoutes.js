const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const db = require("../db")
const { sendVerificationEmail, sendResetPasswordEmail } = require("../services/emailService")

// ─── HELPERS ──────────────────────────────────────────────────────

function generateToken() {
  return crypto.randomBytes(32).toString("hex")
}

function saveToken(userId, token, type, expiresInHours) {
  return new Promise((resolve, reject) => {
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
    const query = "INSERT INTO auth_tokens (user_id, token, type, expires_at) VALUES (?, ?, ?, ?)"
    db.query(query, [userId, token, type, expiresAt], (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

// ─── REGISTER ─────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires." })
  }

  try {
    // Check if email already exists
    db.query("SELECT id FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" })
      if (result.length > 0) return res.status(409).json({ message: "Cet email est déjà utilisé." })

      const hashedPassword = await bcrypt.hash(password, 10)
      const insertQuery = "INSERT INTO users (nom, email, password) VALUES (?, ?, ?)"

      db.query(insertQuery, [username, email, hashedPassword], async (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur lors de la création du compte." })

        const token = generateToken()
        await saveToken(result.insertId, token, "verify_email", 24)
        await sendVerificationEmail(email, token)

        res.status(201).json({ message: "Compte créé. Vérifie ton email pour l'activer." })
      })
    })
  } catch (err) {
    console.error("Erreur register:", err)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// ─── VERIFY EMAIL ─────────────────────────────────────────────────

router.get("/verify-email", (req, res) => {
  const { token } = req.query
  const query = `
    SELECT * FROM auth_tokens 
    WHERE token = ? AND type = 'verify_email' AND used = FALSE AND expires_at > NOW()
  `
  db.query(query, [token], (err, result) => {
    if (err || result.length === 0)
      return res.status(400).json({ message: "Lien invalide ou expiré" })

    const { user_id, id } = result[0]
    db.query("UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE id = ?", [user_id])
    db.query("UPDATE auth_tokens SET used = TRUE WHERE id = ?", [id])
    res.json({ message: "Email vérifié avec succès !" })
  })
})

// ─── LOGIN ────────────────────────────────────────────────────────

router.post("/login", (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." })
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" })
    if (result.length === 0) return res.status(401).json({ message: "Identifiants incorrects." })

    const user = result[0]

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: "Identifiants incorrects." })

    if (!user.email_verified) {
      return res.status(403).json({ message: "Confirme ton email avant de te connecter." })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.json({ message: "Connexion réussie", token, user: { id: user.id, nom: user.nom, email: user.email } })
  })
})

// ─── FORGOT PASSWORD ──────────────────────────────────────────────

router.post("/forgot-password", (req, res) => {
  const { email } = req.body

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err || result.length === 0)
      return res.json({ message: "Si cet email existe, un lien a été envoyé." })

    try {
      const token = generateToken()
      await saveToken(result[0].id, token, "reset_password", 1)
      await sendResetPasswordEmail(email, token)
    } catch (e) {
      console.error("Erreur forgot-password:", e)
    }

    res.json({ message: "Si cet email existe, un lien a été envoyé." })
  })
})

// ─── RESET PASSWORD ───────────────────────────────────────────────

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body

  const query = `
    SELECT * FROM auth_tokens 
    WHERE token = ? AND type = 'reset_password' AND used = FALSE AND expires_at > NOW()
  `
  db.query(query, [token], async (err, result) => {
    if (err || result.length === 0)
      return res.status(400).json({ message: "Lien invalide ou expiré" })

    try {
      const hashed = await bcrypt.hash(newPassword, 10)
      db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, result[0].user_id])
      db.query("UPDATE auth_tokens SET used = TRUE WHERE id = ?", [result[0].id])
      res.json({ message: "Mot de passe mis à jour." })
    } catch (e) {
      res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe." })
    }
  })
})

module.exports = router