// js/config.js
const fs = require('fs');
const path = './assets/config.json';

const datosIniciales = {
  slogan: "Tu tiempo vale oro",
  descripcion: "Enviamos comida, paquetes, documentos y mucho más de forma rápida, segura y al mejor precio.",
  numero: "+50586947233"
};

function cargarConfig() {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify(datosIniciales, null, 2));
    console.log('✅ config.json creado.');
    return datosIniciales;
  }

  try {
    const datos = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (!datos.slogan || !datos.descripcion || !datos.numero) {
      console.log('⚠️ Configuración incompleta. Regenerando...');
      fs.writeFileSync(path, JSON.stringify(datosIniciales, null, 2));
      return datosIniciales;
    }
    console.log('✅ Configuración cargada.');
    return datos;
  } catch (error) {
    console.log('⚠️ JSON inválido. Creando nuevo config.');
    fs.writeFileSync(path, JSON.stringify(datosIniciales, null, 2));
    return datosIniciales;
  }
}

module.exports = { cargarConfig };
