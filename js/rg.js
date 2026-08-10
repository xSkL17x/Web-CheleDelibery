// js/rg.js


class PaginaRegistro {
  constructor() {
    // Referencias a los elementos del DOM
    this.formulario = document.getElementById('formulario-registro');
    this.inputNombre = document.getElementById('nombre');
    this.inputCelular = document.getElementById('celular');
    this.inputDireccion = document.getElementById('direccion');
  }

  async manejarRegistro(evento) {
    evento.preventDefault(); // Evita que la página se recargue

    // Extraer y limpiar los valores
    const nombre = this.inputNombre.value.trim();
    const celular = this.inputCelular.value.trim();
    const direccion = this.inputDireccion.value.trim();

    // Validación de seguridad extra
    if (!nombre || !celular || !direccion) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      // ==========================================
      // Aquí irá tu lógica de base de datos (Ej. fetch a tu endpoint o Supabase)
      // await supabase.from('perfiles').insert([{ nombre, celular, direccion }]);
      // ==========================================

      console.log("Datos registrados localmente:", { nombre, celular, direccion });
      alert(`¡Cuenta creada con éxito!\nBienvenido/a a Chele Delivery, ${nombre}.`);

      // Limpiar formulario y redirigir
      this.formulario.reset();
      window.location.href = "is.html"; 

    } catch (error) {
      console.error("Error procesando el registro:", error);
      alert("Hubo un problema al registrar la cuenta.");
    }
  }

  configurarEventos() {
    if (this.formulario) {
      // Usamos una función flecha para que 'this' siga apuntando a la clase
      this.formulario.addEventListener('submit', (evento) => this.manejarRegistro(evento));
    } else {
      console.error("Formulario de registro no encontrado en el DOM.");
    }
  }

  async inizializar() {
    this.configurarEventos();
  }
}

// Instanciar e inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const registro = new PaginaRegistro();
  registro.inizializar();
});
