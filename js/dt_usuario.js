import supabase from './supabase.js'; 

const TIEMPO_CACHE_MS = 30 * 60 * 1000; 
const DOCE_HORAS_MS = 12 * 60 * 60 * 1000; 

export async function cargarDatosCliente() {
  const cacheLocal = sessionStorage.getItem('perfil_usuario');
  const cacheTime = sessionStorage.getItem('perfil_usuario_time');
  const ahora = Date.now();
  if (cacheLocal && cacheTime && (ahora - cacheTime < TIEMPO_CACHE_MS)) return JSON.parse(cacheLocal);

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return null;

  try {
    const { data: datos, error } = await supabase.from('Clientes').select('*').eq('UID_Social', session.user.id).maybeSingle(); 
    if (error) throw error;
    if (!datos) return null;
    sessionStorage.setItem('perfil_usuario', JSON.stringify(datos));
    sessionStorage.setItem('perfil_usuario_time', ahora.toString());
    return datos;
  } catch (error) { 
    console.error("Error DB:", error.message); 
    return null; 
  }
}

export async function borrarCacheCliente() {
  sessionStorage.removeItem('perfil_usuario');
  sessionStorage.removeItem('perfil_usuario_time');
  sessionStorage.removeItem('cupones_usuario');
  sessionStorage.removeItem('cupones_usuario_time');
  return await cargarDatosCliente();
}

export async function obtenerCuponesCanjeados(uid) {
  const cacheLocal = sessionStorage.getItem('cupones_usuario');
  const cacheTime = sessionStorage.getItem('cupones_usuario_time');
  const ahora = Date.now();
  if (cacheLocal && cacheTime && (ahora - cacheTime < TIEMPO_CACHE_MS)) return JSON.parse(cacheLocal);

  try {
    const { data, error } = await supabase.from('rewards').select('*').eq('UID_Social', uid).order('fecha_emitido', { ascending: false });
    if (error) throw error;
    
    const cupones = data || [];
    const cuponesProcesados = [];
    let huboExpirados = false;

    for (let cupon of cupones) {
      if (cupon.Estado === 'ACTIVO') {
        const tiempoEmitido = new Date(cupon.fecha_emitido).getTime();
        if (ahora - tiempoEmitido > DOCE_HORAS_MS) {
          cupon.Estado = 'EXPIRADO';
          huboExpirados = true;

          const puntosDevolver = Math.max(0, cupon.puntos_gastados - 100); 
          
          await supabase.from('rewards').update({ Estado: 'EXPIRADO' }).eq('codigo', cupon.codigo)          
          if (puntosDevolver > 0) {
            const { data: clienteFresco } = await supabase.from('Clientes').select('Puntos').eq('UID_Social', uid).single();
            if (clienteFresco) {
              await supabase.from('Clientes').update({ Puntos: (clienteFresco.Puntos || 0) + puntosDevolver }).eq('UID_Social', uid);
            }
          }
        }
      }
      cuponesProcesados.push(cupon);
    }

    if (huboExpirados) {
      sessionStorage.removeItem('perfil_usuario');
      sessionStorage.removeItem('perfil_usuario_time');
    }

    sessionStorage.setItem('cupones_usuario', JSON.stringify(cuponesProcesados));
    sessionStorage.setItem('cupones_usuario_time', ahora.toString());
    return cuponesProcesados;
  } catch (err) {
    console.error("Error cupones:", err.message);
    return [];
  }
}

export async function procesarCanjeCupon(uid, cupon) {
  try {
    const { data: cuponesActivos, error: errActivo } = await supabase.from('rewards').select('codigo, fecha_emitido').eq('UID_Social', uid).eq('Estado', 'ACTIVO').limit(1);
    if (errActivo) throw new Error("Error DB al verificar cupones activos: " + errActivo.message);
    
    if (cuponesActivos && cuponesActivos.length > 0) {
      const cuponActivo = cuponesActivos[0];
      const tiempoEmitido = new Date(cuponActivo.fecha_emitido).getTime();
      if (Date.now() - tiempoEmitido < DOCE_HORAS_MS) {
        throw new Error(`Tienes un cupón activo: ${cuponActivo.codigo}`);
      } else {
        throw new Error("Tu cupón anterior expiró recién. Recarga la página para actualizar tus puntos antes de canjear otro.");
      }
    }


    const { data: clienteFresco, error: errCliente } = await supabase.from('Clientes').select('Puntos').eq('UID_Social', uid).single();
    if (errCliente) throw new Error("Error DB al verificar puntos: " + errCliente.message);

    const puntosReales = clienteFresco.Puntos || 0;
    if (puntosReales < cupon.reqPuntos) throw new Error("No tienes suficientes puntos para este canje.");

    const nuevosPuntos = puntosReales - cupon.reqPuntos;
    const codigoGenerado = 'SkL-' + Math.random().toString(36).substring(2, 8).toUpperCase();


    const { error: errUpdate } = await supabase.from('Clientes').update({ Puntos: nuevosPuntos }).eq('UID_Social', uid);
    if (errUpdate) throw new Error("Error DB al descontar puntos: " + errUpdate.message);


    const { error: errReward } = await supabase.from('rewards').insert([{ 
      UID_Social: uid, codigo: codigoGenerado, puntos_gastados: cupon.reqPuntos, Estado: 'ACTIVO', fecha_emitido: new Date().toISOString() 
    }]);
    if (errReward) throw new Error("Error DB al generar cupón: " + errReward.message);

    sessionStorage.removeItem('cupones_usuario');
    sessionStorage.removeItem('cupones_usuario_time');

    return { success: true, nuevosPuntos, codigoGenerado };
  } catch (error) {
    throw error;
  }
}