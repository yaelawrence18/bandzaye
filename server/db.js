const mysql = require("mysql2")

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "bandzaye"
})

connection.getConnection((err) => {
  if (err) console.log("Erreur connexion MySQL :", err)
  else console.log("Connecté à la base de données MySQL")
})

module.exports = connection