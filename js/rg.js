import { vercontra } from './utilidades.js';


class PaginaRegistro {
  constructor(formId) {
    this.formulario = document.getElementById(formId);
    if (this.formulario) {
      this.inputNombre = document.getElementById('nombre');
      this.inputCelular = document.getElementById('celular');
      this.inputPassword = document.getElementById('contrasena-usuario');
      this.inputConfirmPassword = document.getElementById('contrasena-repetida');
    }
  }


  obtenerDatos() {
    return {
      nombre: this.inputNombre.value.trim(),
      celular: this.inputCelular.value.trim(),
      password: this.inputPassword.value,
      confirmPassword: this.inputConfirmPassword.value
    };
  }


  validarDatos({ nombre, celular, password, confirmPassword }) {

    if (!nombre || !celular || !password || !confirmPassword) { alert("Por favor, completa todos los campos obligatorios."); return false; }
    if (password.length < 6) { alert("La contraseña debe tener al menos 6 caracteres."); return false; }
    if (password !== confirmPassword) { alert("Las contraseñas no coinciden. Por favor, verifícalas."); return false; }
    return true;
  }


  async guardarEnBaseDeDatos(datosBackend) {

    const respuesta = await fetch('http://localhost:3000/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosBackend)
    });

    const resultado = await respuesta.json();
    if (!respuesta.ok) { throw new Error(resultado.error || 'Error al procesar el registro'); }
    return resultado;
  }

  async manejarRegistro(evento) {
    if (evento) evento.preventDefault(); 
    const datos = this.obtenerDatos();
    if (!this.validarDatos(datos)) return;
    const datosBackend = { nombre: datos.nombre, celular: datos.celular, password: datos.password, confirmPassword: datos.confirmPassword };
    try {
      await this.guardarEnBaseDeDatos(datosBackend);
      alert(`¡Cuenta creada con éxito!\nBienvenido/a a Chele Delibery, ${datos.nombre}.`);
      this.formulario.reset();
      window.location.href = "is.html"; 
    } catch (error) { alert(error.message || "Hubo un problema al registrar la cuenta. Por favor, intenta de nuevo."); }
  }

  configurarEventos() {
    this.formulario.addEventListener('submit', (evento) => this.manejarRegistro(evento));
    vercontra('#icon-contrasena-usuario', '#contrasena-usuario');
    vercontra('#icon-contrasena-repetida', '#contrasena-repetida');
  }


  inicializar() {
    if (this.formulario) { this.configurarEventos(); } 
    else { console.error("Formulario de registro no encontrado en el DOM."); }
  }

}


document.addEventListener("DOMContentLoaded", () => {
  const registro = new PaginaRegistro('formulario-registro');
  registro.inicializar();
});