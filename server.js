import 'dotenv/config';
import express from 'express';
import { cargarConfig } from './js/config.js';
import supabase from './js/supabase.js';

const app = express();

app.use(express.static('.'));

app.get('/config', async (req, res) => {
  const config = await cargarConfig();
  res.json(config);
});

app.get('/negocios', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Negocios')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error al obtener negocios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('🚀 Servidor activo en http://localhost:3000');
});