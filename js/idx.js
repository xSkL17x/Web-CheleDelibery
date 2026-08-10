// js/idx.js

class PaginaInicio {
  constructor() { 
    this.config = null; 
    this.negocios = []; 
  }

  async cargarconfigs() {
    try {
      const respuesta = await fetch('/config');
      this.config = await respuesta.json();
      // Obtene id en html
      const slogan = document.getElementById('slogan');
      const descripcion = document.getElementById('descripcion');
      const numero = document.getElementById('numero');

      // Asignar valores de la config a los elementos HTML
      if (slogan) slogan.innerHTML = this.config.slogan;
      if (descripcion) descripcion.innerHTML = this.config.descripcion;
      if (numero) numero.innerHTML = this.config.numero;

      // Configurar el enlace de WhatsApp
      const btnWhatsapp = document.getElementById('btn-whatsapp');

      if (btnWhatsapp && this.config.numero) {
        const telefonoLimpio = this.config.numero.replace(/\D/g, ''); 
        const mensaje = encodeURIComponent("¡Hola! Quiero solicitar un Chele Delivery");
        btnWhatsapp.href = `https://wa.me/+505${telefonoLimpio}?text=${mensaje}`;
        btnWhatsapp.target = "_blank";
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    }
  }

  async cargarNegocios() {
    try {
      const respuesta = await fetch('/negocios');
      const data = await respuesta.json();

      this.negocios = data.filter(negocio => negocio.socio === true);
      this.renderizarNegocios(this.negocios);
    } catch (error) {
      console.error("Error cargando la BD de Negocios:", error);
    }
  }

  obtenerUrlStorage(urlDb) {
    if (!urlDb) return 'assets/tiendas_default.png';
    const supabaseUrl = process.env.SUPABASE_URL;
    const baseUrl = supabaseUrl + "/storage/v1/object/public/img_negocios/";
    console.log(urlDb)
    console.log("Nombre obtenerUrlStorage: ", urlDb);
    console.log("URL completa: ", `${baseUrl}${urlDb.replace(" ", "")}.png`);
    return `${baseUrl}${urlDb}.png`;
  }

  renderizarNegocios(negociosSocios) {
      const contenedor = document.querySelector('#contenedor-negocios'); 

      if (!contenedor) return; 
      contenedor.innerHTML = '';

      negociosSocios.forEach(negocio => {
        const nombre = negocio.nombre || 'Nombre no disponible';
        const descripcion = negocio.descripcion || 'Sin descripción';
        const urlImagen = this.obtenerUrlStorage(negocio.nombre);
        const categoria = negocio.categoria || 'General';
        const link = negocio.url_web || '#';
        
        const article = document.createElement('article');
        article.className = 'tarjeta-negocio';
        article.style.cursor = 'pointer';
        article.addEventListener('click', () => { if (link !== '#') window.open(link, '_blank'); });

        article.innerHTML = `
          <div class="imagen-contenedor">
              <img src="${urlImagen}" alt="${nombre}" class="img-negocio" onerror="this.src='assets/tiendas_default.png'">
              <span class="etiqueta-categoria">${categoria}</span>
          </div>
          <div class="info-negocio">
              <h3>${nombre}</h3>
              <p>${descripcion}</p>
              <span class="enlace-ver-mas">Ver más →</span>
          </div>
        `;
        contenedor.appendChild(article);
      });


      const elementos = Array.from(contenedor.children);
      elementos.forEach(elemento => {
          const clon = elemento.cloneNode(true);

          const nombreNegocio = clon.querySelector('h3').textContent;
          const negocioOriginal = negociosSocios.find(n => n.nombre === nombreNegocio);
          const link = negocioOriginal?.url_web || '#';
          
          clon.addEventListener('click', () => { if (link !== '#') window.open(link, '_blank'); });
          contenedor.appendChild(clon);
      });
    }

  async inizializar() {
    await this.cargarconfigs();
    await this.cargarNegocios();
  }
}

const inicio = new PaginaInicio();
inicio.inizializar();