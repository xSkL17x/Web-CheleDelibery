import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import { cargarConfig } from './js/config.js';
import supabase from './js/supabase-server.js';
import bcrypt from 'bcrypt'; 
import crypto from 'crypto'; 

// Configuración de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares globales
app.use(compression());
app.use(cors()); // Esencial para el modo desarrollo con Vite (puerto 5173 -> 3000)
app.use(express.json());

// ==========================================
// RUTAS DE LA API
// ==========================================

app.get('/config', async (req, res) => {
  try {
    const config = await cargarConfig();
    res.json(config);
  } catch (error) {
    console.error('Error al cargar config:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Sistema de caché para negocios
let negociosCache = null;
let ultimaActualizacionCache = 0;
const TIEMPO_CACHE_MINUTOS = 1 * 60 * 1000; 

app.get('/negocios', async (req, res) => {
  try {
    const ahora = Date.now();

    // Retornar caché si aún es válido
    if (negociosCache && (ahora - ultimaActualizacionCache < TIEMPO_CACHE_MINUTOS)) {
      return res.json(negociosCache);
    }

    const { data, error } = await supabase.from('Negocios').select('*');
    if (error) throw error;

    // Actualizar caché
    negociosCache = data;
    ultimaActualizacionCache = ahora;

    res.json(data);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Error al obtener negocios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/registro', async (req, res) => {
  try {
    const { nombre, celular, password, confirmPassword } = req.body;

    if (!nombre || !celular || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    const idGenerado = crypto.randomBytes(4).toString('hex');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const { data, error } = await supabase.from('Clientes').insert([{ 
      ID_Cliente: idGenerado, 
      Nombre: nombre, 
      telefono: celular, 
      regristrado_web: true,
      password: hashedPassword 
    }]).select();

    if (error) {
      return res.status(400).json({ error: `Error en BD: ${error.message}` });
    }
    
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuario: data });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ==========================================
// CONFIGURACIÓN PARA VITE (PRODUCCIÓN)
// ==========================================
// IMPORTANTE: Esto debe ir SIEMPRE al final de tus rutas API

if (process.env.NODE_ENV === 'production') {
  // Servir los archivos estáticos de la carpeta 'dist' generada por Vite
  app.use(express.static(path.join(__dirname, 'dist')));

  // Catch-all: Cualquier petición que no sea de la API devolverá el index.html de Vite.
  // Esto soluciona el error "Cannot GET /ruta" al recargar la página en producción.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`Servidor activo en el puerto ${PORT}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('Modo Producción: Sirviendo archivos estáticos desde /dist');
  } else {
    console.log('Modo Desarrollo: Recuerda usar tu servidor de Vite (ej. localhost:5173) para el frontend');
  }
});