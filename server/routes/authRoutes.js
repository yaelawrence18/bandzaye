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

async function saveToken(userId, token, type, expiresInHours) {
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)
  const query = "INSERT INTO auth_tokens (user_id, token, type, expires_at) VALUES ($1, $2, $3, $4)"
  await db.query(query, [userId, token, type, expiresAt])
}

// ─── REGISTER ─────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires." })
  }

  try {
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await db.query(
      "INSERT INTO users (nom, email, password) VALUES ($1, $2, $3) RETURNING id",
      [username, email, hashedPassword]
    )

    const token = generateToken()
    await saveToken(result.rows[0].id, token, "verify_email", 24)
    await sendVerificationEmail(email, token)

    res.status(201).json({ message: "Compte créé. Vérifie ton email pour l'activer." })
  } catch (err) {
    console.error("Erreur register:", err)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// ─── VERIFY EMAIL ─────────────────────────────────────────────────

router.get("/verify-email", async (req, res) => {
  const { token } = req.query

  try {
    const result = await db.query(
      `SELECT * FROM auth_tokens 
       WHERE token = $1 AND type = 'verify_email' AND used = FALSE AND expires_at > NOW()`,
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Lien invalide ou expiré" })
    }

    const { user_id, id } = result.rows[0]
    await db.query("UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE id = $1", [user_id])
    await db.query("UPDATE auth_tokens SET used = TRUE WHERE id = $1", [id])

    res.json({ message: "Email vérifié avec succès !" })
  } catch (err) {
    console.error("Erreur verify-email:", err)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// ─── LOGIN ────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis." })
  }

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Identifiants incorrects." })
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: "Identifiants incorrects." })

    if (!user.email_verified) {
      return res.status(403).json({ message: "Confirme ton email avant de te connecter." })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.json({ message: "Connexion réussie", token, user: { id: user.id, nom: user.nom, email: user.email } })
  } catch (err) {
    console.error("Erreur login:", err)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// ─── FORGOT PASSWORD ──────────────────────────────────────────────

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email])

    if (result.rows.length > 0) {
      const token = generateToken()
      await saveToken(result.rows[0].id, token, "reset_password", 1)
      await sendResetPasswordEmail(email, token)
    }

    res.json({ message: "Si cet email existe, un lien a été envoyé." })
  } catch (err) {
    console.error("Erreur forgot-password:", err)
    res.json({ message: "Si cet email existe, un lien a été envoyé." })
  }
})

// ─── RESET PASSWORD ───────────────────────────────────────────────

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body

  try {
    const result = await db.query(
      `SELECT * FROM auth_tokens 
       WHERE token = $1 AND type = 'reset_password' AND used = FALSE AND expires_at > NOW()`,
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Lien invalide ou expiré" })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, result.rows[0].user_id])
    await db.query("UPDATE auth_tokens SET used = TRUE WHERE id = $1", [result.rows[0].id])

    res.json({ message: "Mot de passe mis à jour." })
  } catch (err) {
    console.error("Erreur reset-password:", err)
    res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe." })
  }
})

module.exports = router