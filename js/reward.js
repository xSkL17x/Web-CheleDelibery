import { cargarDatosCliente, borrarCacheCliente, procesarCanjeCupon } from './dt_usuario.js';

const cuponesDisponibles = [
  { id: 1, valor: "20C$", tipo: "DESCUENTO", reqPuntos: 840 },
  { id: 2, valor: "50C$", tipo: "DESCUENTO", reqPuntos: 2000 },
  { id: 3, valor: "80C$", tipo: "DESCUENTO", reqPuntos: 3200 }
];

let idCuponSeleccionado = null;
let datosUsuario = null;
let Canjeando = false;

document.addEventListener('DOMContentLoaded', async () => {
  datosUsuario = await cargarDatosCliente();
  
  if (!datosUsuario) {
    renderizarPuntos(0);
    renderizarCupones(cuponesDisponibles, 0); 
    renderizarCuponesCanjeados([]);
  } else {
    const puntosActuales = datosUsuario.Puntos || 0; 
    console.log("Datos encontrados. " + puntosActuales);
    renderizarPuntos(puntosActuales);
    renderizarCupones(cuponesDisponibles, puntosActuales);
    const cupones = await obtenerCuponesCanjeados(datosUsuario.UID_Social);
    renderizarCuponesCanjeados(cupones);
  }

  configurarEventosInteractivos();
});

function renderizarPuntos(puntos) {
  const elPuntos = document.getElementById('puntos-actuales');
  if (elPuntos) elPuntos.textContent = puntos.toLocaleString('es-NI');
}

function renderizarCupones(cupones, puntosActuales) {
  const contenedor = document.getElementById('contenedor-cupones');
  if (!contenedor) return;

  contenedor.innerHTML = cupones.map(cupon => {
    const estaBloqueado = puntosActuales < cupon.reqPuntos;
    const claseBloqueado = estaBloqueado ? 'cupon-bloqueado' : '';
    const atributoDisabled = estaBloqueado ? 'disabled' : '';

    return `
      <button type="button" class="cupon ${claseBloqueado}" data-id="${cupon.id}" ${atributoDisabled}>
        <div class="cupon-valor">${cupon.valor}</div>
        <div class="cupon-tipo">${cupon.tipo}</div>
        <div class="cupon-req">${cupon.reqPuntos.toLocaleString('es-NI')} PUNTOS</div>
      </button>
    `;
  }).join('');
}

function renderizarCuponesCanjeados(cupones = []) {
  const contenedor = document.getElementById('contenedor-cupones-canjeados');
  if (!contenedor) return;

  if (!cupones.length) {
    contenedor.innerHTML = '<p class="sin-cupones">No tienes cupones canjeados aún.</p>';
    return;
  }

  contenedor.innerHTML = cupones.map(c => `
    <div class="cupon-canjeado ${c.Estado === 'ACTIVO' ? 'activo' : 'usado'}">
      <div class="cupon-info">
        <span class="cupon-codigo">${c.codigo}</span>
        <span class="cupon-puntos">-${c.puntos_gastados} pts</span>
      </div>
      <span class="cupon-estado">${c.Estado}</span>
    </div>
  `).join('');
}

function mostrarMensaje(texto, tipo = 'info') {
  let elMensaje = document.getElementById('mensaje-pantalla');
  

  if (!elMensaje) {
    elMensaje = document.createElement('div');
    elMensaje.id = 'mensaje-pantalla';
    const contenedor = document.getElementById('contenedor-cupones').parentNode;
    contenedor.insertBefore(elMensaje, document.getElementById('contenedor-cupones'));
  }
  
  elMensaje.textContent = texto;
  elMensaje.className = `mensaje mensaje-${tipo}`; // Ej: mensaje-error, mensaje-exito
}

function configurarEventosInteractivos() {
  const contenedorCupones = document.getElementById('contenedor-cupones');
  const btnCanjear = document.getElementById('btn-canjear');

  if (contenedorCupones) {
    contenedorCupones.addEventListener('click', (e) => {
      const cuponClickeado = e.target.closest('.cupon');
      if (!cuponClickeado || cuponClickeado.classList.contains('cupon-bloqueado') || Canjeando) return;

      document.querySelectorAll('.cupon').forEach(c => c.classList.remove('cupon-seleccionado'));
      cuponClickeado.classList.add('cupon-seleccionado');
      idCuponSeleccionado = Number(cuponClickeado.dataset.id);
    });
  }

  if (btnCanjear) {
    btnCanjear.addEventListener('click', async () => {
      if (!datosUsuario) {
        window.location.href = 'is.html';
        return;
      }

      if (!idCuponSeleccionado) {
        mostrarMensaje("Por favor, selecciona el cupón que deseas canjear.", "error");
        return;
      }

      if (Canjeando) return;
      
      const cupon = cuponesDisponibles.find(c => c.id === idCuponSeleccionado);
      if (!cupon) return;


      Canjeando = true;
      btnCanjear.disabled = true;
      mostrarMensaje("Procesando tu canje, por favor espera...", "info");

      try {

        const resultado = await procesarCanjeCupon(datosUsuario.UID_Social, cupon);

        datosUsuario.Puntos = resultado.nuevosPuntos;
        await borrarCacheCliente();
        
        renderizarPuntos(resultado.nuevosPuntos);
        renderizarCupones(cuponesDisponibles, resultado.nuevosPuntos);

        const cuponesActualizados = await obtenerCuponesCanjeados(datosUsuario.UID_Social);
        renderizarCuponesCanjeados(cuponesActualizados);        
        
        idCuponSeleccionado = null;
        document.querySelectorAll('.cupon').forEach(c => c.classList.remove('cupon-seleccionado'));

        mostrarMensaje(`¡Canje exitoso! Tu código es: ${resultado.codigoGenerado}`, "exito");
      } catch (err) {
        mostrarMensaje(err.message || "Ocurrió un error inesperado durante el canje.", "error");
      } finally {
        // Desbloquear UI
        Canjeando = false;
        btnCanjear.disabled = false;
      }
    });
  }
}