const db = require("./obtenerDB");

function crearTablaTiendas() {
    db.run(`
        CREATE TABLE IF NOT EXISTS tiendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            imagen TEXT
            url TEXT NOT NULL
        )
    `);
}

function crearTiendasPrueba() {
    const tiendas = [
        ["Pizza", "https://cdn-icons-png.flaticon.com/512/776/776645.png" ,"https://cdn-icons-png.flaticon.com/512/776/776645.png"],
        ["Tienda", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk-lNsdWgcGMLSjEP20L8cUAQDoOEX4uQpJVJZjKE5DA&s=10", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk-lNsdWgcGMLSjEP20L8cUAQDoOEX4uQpJVJZjKE5DA&s=10"],
        ["Farmacia Central", "https://cdn-icons-png.flaticon.com/512/4320/4320337.png", "https://cdn-icons-png.flaticon.com/512/4320/4320337.png"]
    ];

    const sql = "INSERT INTO tiendas (nombre, imagen, url) VALUES (?, ?, ?)";

    tiendas.forEach(tienda => db.run(sql, tienda));

    console.log("🏪 Tiendas de prueba creadas.");
}

module.exports = { crearTablaTiendas, crearTiendasPrueba };