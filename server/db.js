const mysql = require("mysql2")

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
})

connection.getConnection((err) => {
  if (err) console.log("Erreur connexion MySQL :", err)
  else console.log("Connecté à la base de données MySQL")
})

module.exports = connection