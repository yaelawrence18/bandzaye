const crypto = require("crypto")
const { sendVerificationEmail, sendResetPasswordEmail } = require("../services/emailService")

// Génère un token sécurisé
function generateToken() {
  return crypto.randomBytes(32).toString("hex")
}

// Sauvegarde un token en DB
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

// ─── REGISTER : envoie un email de vérification ───────────────────
router.post("/register", async (req, res) => {
  // ... ton code existant jusqu'à l'insertion ...
  db.query(insertQuery, [username, email, hashedPassword], async (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur insertion utilisateur" })

    // Nouveau : envoie l'email de vérification
    const token = generateToken()
    await saveToken(result.insertId, token, "verify_email", 24)
    await sendVerificationEmail(email, token)

    res.status(201).json({ message: "Compte créé. Vérifie ton email pour l'activer." })
  })
})

// ─── VERIFY EMAIL ──────────────────────────────────────────────────
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

// ─── LOGIN : vérifie que l'email est confirmé ──────────────────────
// Dans ton handler login existant, après isMatch, ajoute :
if (!user.email_verified) {
  return res.status(403).json({ message: "Confirme ton email avant de te connecter." })
}

// ─── FORGOT PASSWORD ───────────────────────────────────────────────
router.post("/forgot-password", (req, res) => {
  const { email } = req.body
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err || result.length === 0)
      return res.json({ message: "Si cet email existe, un lien a été envoyé." }) // Sécurité : ne pas révéler

    const token = generateToken()
    await saveToken(result[0].id, token, "reset_password", 1)
    await sendResetPasswordEmail(email, token)
    res.json({ message: "Si cet email existe, un lien a été envoyé." })
  })
})

// ─── RESET PASSWORD ────────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body
  const query = `
    SELECT * FROM auth_tokens 
    WHERE token = ? AND type = 'reset_password' AND used = FALSE AND expires_at > NOW()
  `
  db.query(query, [token], async (err, result) => {
    if (err || result.length === 0)
      return res.status(400).json({ message: "Lien invalide ou expiré" })

    const hashed = await bcrypt.hash(newPassword, 10)
    db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, result[0].user_id])
    db.query("UPDATE auth_tokens SET used = TRUE WHERE id = ?", [result[0].id])
    res.json({ message: "Mot de passe mis à jour." })
  })
})