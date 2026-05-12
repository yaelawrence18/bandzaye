require("dotenv").config()

const express = require("express")
const cors = require("cors")
const authRoutes = require("./routes/authRoutes")
const eventRoutes = require("./routes/eventRoutes")

const app = express()

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ]
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin)
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req.method === "OPTIONS") {
    return res.sendStatus(200)
  }
  next()
})

app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)

app.get("/", (req, res) => {
  res.send("API BANDZAYE OK")
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`)
})