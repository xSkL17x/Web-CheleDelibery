const express = require("express");
const app = express();

const { obtenerDB } = require("./js/obtenerDB");
const { cargarConfig } = require("./js/config");

const db = obtenerDB();

app.use(express.static("."));

app.get("/config", (req, res) => {res.json(cargarConfig());});

app.listen(3000, "0.0.0.0", () => {console.log("🚀 Servidor activo en http://192.168.0.106:3000");});