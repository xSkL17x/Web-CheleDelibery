// js/utilidades.js

export function vercontra(iconoSelector, inputSelector) {
  const icono = typeof iconoSelector === 'string' ? document.querySelector(iconoSelector) : iconoSelector;
  const input = typeof inputSelector === 'string' ? document.querySelector(inputSelector) : inputSelector;

  if (!icono || !input) return;

  icono.style.cursor = "pointer";

  if (icono.dataset.configurado) return;
  icono.dataset.configurado = "true";

  icono.addEventListener('click', () => {
    const tipoActual = input.getAttribute('type');
    
    if (tipoActual === 'password') {
      input.setAttribute('type', 'text');
      icono.classList.replace('fa-eye', 'fa-eye-slash'); 
    } else {
      input.setAttribute('type', 'password');
      icono.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });
}