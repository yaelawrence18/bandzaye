require("dotenv").config()

const express = require("express")
const cors = require("cors")
const authRoutes = require("./routes/authRoutes")
const eventRoutes = require("./routes/eventRoutes")

const app = express()

app.use(cors())

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