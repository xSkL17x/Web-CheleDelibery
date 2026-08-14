import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) { throw new Error('Faltan las credenciales de Supabase en las variables de entorno de Vite'); }

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;