import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { cargarConfig } from './js/config.js';
import supabase from './js/supabase-server.js';
import { obtenerPerfilUsuario, registroSocial } from './js/authController.js'; // Controladores de Auth


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());

const limiterRegistro = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Demasiados intentos desde esta IP, por favor intenta más tarde.' } });

app.get('/config', async (req, res) => {
  try { res.json(await cargarConfig()); } 
  catch (error) { res.status(500).json({ error: 'Error interno del servidor' }); }
});

let negociosCache = null, ultimaActualizacionCache = 0;
const TIEMPO_CACHE_MINUTOS = 60000; 

app.get('/negocios', async (req, res) => {
  try {
    const ahora = Date.now();
    if (negociosCache && (ahora - ultimaActualizacionCache < TIEMPO_CACHE_MINUTOS)) return res.json(negociosCache);
    const { data, error } = await supabase.from('Negocios').select('*');
    if (error) throw error;
    negociosCache = data; ultimaActualizacionCache = ahora;
    res.json(data);
  } catch (error) { res.status(500).json({ error: 'Error interno del servidor' }); }
});

// Rutas de registro modularizadas
app.get('/usuario/perfil', obtenerPerfilUsuario);
app.post('/auth/social', registroSocial);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`Servidor activo en el puerto ${PORT}`);
  if (process.env.NODE_ENV === 'production') console.log('Modo Producción: Sirviendo estáticos desde /dist');
  else console.log('Modo Desarrollo: Recuerda usar tu servidor de Vite para el frontend');
});

