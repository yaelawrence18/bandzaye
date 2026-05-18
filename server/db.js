const mysql = require("mysql2")

const connection = mysql.createPool(process.env.MYSQL_PUBLIC_URL)

connection.getConnection((err) => {
  if (err) console.log("Erreur connexion MySQL :", err)
  else console.log("Connecté à la base de données MySQL")
})

module.exports = connection