// js/idx.js

class PaginaInicio {

  constructor() { this.config = null; this.db = null; }


  async cargarconfigs() {

    console.log("🚀 Cargando configuración...");

    const respuesta = await fetch('/config');
    this.config = await respuesta.json();

    console.log("✅ Config:", this.config);
    const slogan = document.getElementById('slogan');
    const descripcion = document.getElementById('descripcion');
    if (slogan) slogan.innerHTML = this.config.slogan;
    if (descripcion) descripcion.innerHTML = this.config.descripcion;
    
  }


  async cargardatos() {
    console.log("🚀 Cargando BD...");
    const respuesta = await fetch('/usuarios');
    this.db = await respuesta.json();

    console.log("✅ Datos:", this.db);
  }


  async inizializar() {
    await this.cargarconfigs();
   // await this.cargardatos();
    console.log("🎉 Página inicializada.");
  }

}


const inicio = new PaginaInicio();
inicio.inizializar();