const express = require("express");
const app = express();

const { cargarConfig } = require("./js/config");
const supabase = require("./js/supabase");

app.use(express.static("."));

app.get("/config", async (req,res)=>{ 
  const config = await cargarConfig();
  res.json(config);
});

app.listen(3000,"0.0.0.0",()=>{console.log("🚀 Servidor activo en 192.168.0.102:3000");});