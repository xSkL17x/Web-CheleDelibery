import { iniciarSesion } from './auth.js';


document.addEventListener("DOMContentLoaded", () => {
  const btnGoogle = document.getElementById('btn-google');
  const btnFacebook = document.getElementById('btn-facebook');

  if (btnGoogle) { 
    btnGoogle.addEventListener('click', async () => {
      try { await iniciarSesion('google'); } 
      catch (error) {
        console.error("Error al conectar con Google:", error.message);
        alert("Hubo un problema al intentar iniciar sesión con Google.");
      }
    });
  }

  if (btnFacebook) { 
    btnFacebook.addEventListener('click', async () => {
      try { await iniciarSesion('facebook'); } 
      catch (error) {
        console.error("Error al conectar con facebook:", error.message);
        alert("Hubo un problema al intentar iniciar sesión con facebook.");
      }
    });
  }

});