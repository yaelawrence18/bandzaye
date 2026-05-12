const express = require("express")
const db = require("../db")
const router = express.Router()

// Middleware pour vérifier le token
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

// Récupérer tous les events
router.get("/", (req, res) => {
  const query = `
    SELECT e.*, u.nom as auteur
    FROM events e
    JOIN users u ON e.user_id = u.id
    ORDER BY e.created_at DESC
  `
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" })
    res.status(200).json(result)
  })
})

// Créer un event
router.post("/", verifyToken, (req, res) => {
  const { titre, description, categorie, adresse, latitude, longitude, date_event, photo } = req.body

  if (!titre || !categorie) {
    return res.status(400).json({ message: "Titre et catégorie obligatoires" })
  }

  const query = `
    INSERT INTO events (user_id, titre, description, categorie, adresse, latitude, longitude, date_event, photo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  db.query(query, [req.user.id, titre, description, categorie, adresse, latitude, longitude, date_event, photo], (err, result) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ message: "Erreur serveur" })
    }
    res.status(201).json({ message: "Événement créé", id: result.insertId })
  })
})

// Récupérer les commentaires d'un event
router.get("/:id/comments", (req, res) => {
  const query = `
    SELECT c.*, u.nom as auteur
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.event_id = ?
    ORDER BY c.created_at ASC
  `
  db.query(query, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" })
    res.status(200).json(result)
  })
})

// Ajouter un commentaire
router.post("/:id/comments", verifyToken, (req, res) => {
  const { contenu } = req.body
  if (!contenu) return res.status(400).json({ message: "Commentaire vide" })

  const query = "INSERT INTO comments (user_id, event_id, contenu) VALUES (?, ?, ?)"
  db.query(query, [req.user.id, req.params.id, contenu], (err, result) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" })
    res.status(201).json({ message: "Commentaire ajouté" })
  })
})

module.exports = router