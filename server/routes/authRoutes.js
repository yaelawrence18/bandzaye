const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const db = require("../db")

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" })
    }

    const checkQuery = "SELECT * FROM users WHERE email = ?"

    db.query(checkQuery, [email], async (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" })

      if (result.length > 0) {
        return res.status(400).json({ message: "Email déjà utilisé" })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const insertQuery = "INSERT INTO users (nom, email, password) VALUES (?, ?, ?)"

      db.query(insertQuery, [username, email, hashedPassword], (err, result) => {
        if (err) {
          console.log(err)
          return res.status(500).json({ message: "Erreur insertion utilisateur" })
        }
        res.status(201).json({ message: "Compte créé avec succès" })
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" })
    }

    const query = "SELECT * FROM users WHERE email = ?"

    db.query(query, [email], async (err, result) => {
      if (err) return res.status(500).json({ message: "Erreur serveur" })

      if (result.length === 0) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" })
      }

      const user = result[0]
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" })
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      )

      res.status(200).json({
        message: "Connexion réussie",
        token,
        user: { id: user.id, nom: user.nom, email: user.email, role: user.role }
      })
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

module.exports = router