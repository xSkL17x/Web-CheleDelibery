const path = require("path");
const sqlite3 = require("sqlite3").verbose();





function obtenerDB() {
    return new sqlite3.Database(path.join(__dirname, "app.db"), err => {
        if (err) return console.error("❌ Error DB:", err.message);

        console.log("✅ Base de datos lista.");
    });
}

module.exports = { obtenerDB };