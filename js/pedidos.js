import { verificarSesion } from './auth.js';

// Datos temporales → posteriormente Supabase
const datosUsuarioMock = {
  pedidoActual: {
    estado: "En camino",
    progreso: "60%",
    horaEstimada: "3:30 PM",
    items: "Pizza Familiar, Soda",
    enlaceSeguimiento: "#"
  },

  historialSemana: [
    { fecha: "12/08", estado: "Entregado", items: "Tacos, Refresco", enlace: "#" },
    { fecha: "10/08", estado: "Entregado", items: "Hamburguesa, Papas", enlace: "#" }
  ]
};

let usuarioActual = null;

document.addEventListener('DOMContentLoaded', async () => {
  usuarioActual = await verificarSesion();

  if (!usuarioActual) { configurarVistaVisitante(); return; }
  
  renderizarPedidoActual(datosUsuarioMock.pedidoActual);
  renderizarHistorial(datosUsuarioMock.historialSemana);
});

// ═══════════════════════════════════════════════
// VISTA VISITANTE
// ═══════════════════════════════════════════════

function configurarVistaVisitante() {
  const seccionPedidos = document.getElementById('seccion-pedidos');
  if (seccionPedidos) seccionPedidos.style.display = 'none';
}

// ═══════════════════════════════════════════════
// PEDIDO ACTUAL
// ═══════════════════════════════════════════════

function renderizarPedidoActual(pedido) {
  const contenedor = document.getElementById('contenedor-pedido-actual');
  if (!contenedor || !pedido) return;

  contenedor.innerHTML = `
    <div class="pedido-actual">
      <div class="pedido-estado-header">
        <span>Estado: <span class="texto-primario">${pedido.estado}</span></span>
      </div>
      <div class="barra-progreso-fondo">
        <div class="barra-progreso-llena" style="width: ${pedido.progreso};"></div>
      </div>
      <p class="pedido-info-texto">Hora estimada: ${pedido.horaEstimada}</p>
      <p class="pedido-info-muted">Items: ${pedido.items}</p>
      <a href="${pedido.enlaceSeguimiento}" class="enlace-accion">Ver seguimiento</a>
    </div>
  `;
}

// ═══════════════════════════════════════════════
// HISTORIAL
// ═══════════════════════════════════════════════

function renderizarHistorial(historial) {
  const contenedor = document.getElementById('contenedor-historial');
  if (!contenedor || !usuarioActual) return;

  contenedor.innerHTML = historial.map(item => `
    <div class="historial-item">
      <div class="historial-fecha">${item.fecha}<br>Date</div>
      <div class="historial-detalles">
        <div class="estado-entregado">Estado: ${item.estado}</div>
        <div class="historial-items-texto">${item.items}</div>
      </div>
      <a href="${item.enlace}" class="enlace-accion-sm">Ver detalles</a>
    </div>
  `).join('');
}