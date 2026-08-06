const supabase = require('./supabase');

let configCache = null;

async function cargarConfig() {

    if (configCache) {console.log("⚡ Configuración desde caché.");return configCache;}

    console.log("📥 Cargando configuración desde Supabase...");

    const { data, error } = await supabase.from('web_config').select('*');

    if (error) {console.error(error);return null;}

    const config = {};

    data.forEach(item => {config[item.id] = item.valor;});

    configCache = {
        slogan: config.slogan,
        descripcion: config.descripcion_slogan,
        numero: config.numero
    };

    console.log("✅ Configuración guardada en caché.");

    return configCache;
}

function actualizarCache(nuevaConfig) {configCache = nuevaConfig;}

module.exports = {
    cargarConfig,
    actualizarCache
};