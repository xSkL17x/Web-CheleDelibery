import supabase from './supabase-server.js';

let configCache = null;

async function cargarConfig() {
    if (configCache) {
        console.log("⚡ Configuración desde caché.");
        return configCache;
    }

    console.log("📥 Cargando configuración desde Supabase...");

    const { data, error } = await supabase.from('web_config').select('*');

    if (error) { 
        if (process.env.NODE_ENV !== 'production') { console.error(error); } 
        return null; 
    }
    
    const config = {};
    data.forEach(item => { config[item.id] = item.valor; });

    configCache = {
        slogan: config.slogan,
        descripcion: config.descripcion_slogan,
        numero: config.numero
    };

    if (process.env.NODE_ENV !== 'production') { console.log("✅ Configuración guardada en caché."); }

    return configCache;
}

function actualizarCache(nuevaConfig) { configCache = nuevaConfig; }

export { cargarConfig, actualizarCache };