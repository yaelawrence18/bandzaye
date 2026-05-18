const express = require("express")
const db = require("../db")
const router = express.Router()

// ─── MIDDLEWARE AUTH ───────────────────────────────────────────────

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ message: "Non autorisé" })
  const jwt = require("jsonwebtoken")
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: "Token invalide" })
  }
}

// ─── RÉCUPÉRER TOUS LES EVENTS ────────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT e.*, u.nom as auteur
      FROM events e
      JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
    `)
    res.status(200).json(result.rows)
  } catch (err) {
    console.error("Erreur GET /events:", err)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// ─── CRÉER UN EVENT ───────────────────────────────────────────────

router.post("/", verifyToken, async (req, res) => {
  const { titre, description, categorie, adresse, latitude, longitude, date_event, photo } = req.body

  if (!titre || !categorie) {
    return res.status(400).json({ message: "Titre et catégorie obligatoires" })
  }

  try {
    const result = await db.query(
      `INSERT INTO events (user_id, titre, description, categorie, adresse, latitude, longitude, date_event, photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [req.user.id, titre, description, categorie, adresse, latitude, longitude, date_event, photo]
    )
    res.status(201).json({ message: "Événement créé", id: result.rows[0].id })
  } catch (err) {
    console.error("Erreur POST /events:", err)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// ─── RÉCUPÉRER LES COMMENTAIRES D'UN EVENT ────────────────────────

router.get("/:id/comments", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.*, u.nom as auteur
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.event_id = $1
       ORDER BY c.created_at ASC`,
      [req.params.id]
    )
    res.status(200).json(result.rows)
  } catch (err) {
    console.error("Erreur GET /events/:id/comments:", err)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// ─── AJOUTER UN COMMENTAIRE ───────────────────────────────────────

router.post("/:id/comments", verifyToken, async (req, res) => {
  const { contenu } = req.body
  if (!contenu) return res.status(400).json({ message: "Commentaire vide" })

  try {
    await db.query(
      "INSERT INTO comments (user_id, event_id, contenu) VALUES ($1, $2, $3)",
      [req.user.id, req.params.id, contenu]
    )
    res.status(201).json({ message: "Commentaire ajouté" })
  } catch (err) {
    console.error("Erreur POST /events/:id/comments:", err)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

module.exports = router