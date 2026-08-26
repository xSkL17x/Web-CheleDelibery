import supabase from './supabase.js'; 

const TIEMPO_CACHE_MS = 30 * 60 * 1000; // 30 minutos COOLDOWN para actualizar datos

export async function cargarDatosCliente() {
  const cacheLocal = sessionStorage.getItem('perfil_usuario');
  const cacheTime = sessionStorage.getItem('perfil_usuario_time');
  const ahora = Date.now();

  if (cacheLocal && cacheTime && (ahora - cacheTime < TIEMPO_CACHE_MS)) {
    console.log("⚡ Datos de usuario cargados desde el almacenamiento local.");
    return JSON.parse(cacheLocal);
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.log("No hay sesión activa.");
    return null;
  }
  console.log("🔑 ID de Supabase Auth (session.user.id):", session.user.id);

  try {
    const { data: datos, error } = await supabase
      .from('Clientes') 
      .select('*')
      .eq('UID_Social', session.user.id)
      .maybeSingle(); 

    if (error) throw error;
    if (!datos) {
      console.warn("El usuario está autenticado, pero no se encontró su perfil en la tabla Clientes.");
      return null;
    }

    sessionStorage.setItem('perfil_usuario', JSON.stringify(datos));
    sessionStorage.setItem('perfil_usuario_time', ahora.toString());

    console.log("📥 Datos de usuario descargados de Supabase y cacheados:", datos); 
    return datos;
  } catch (error) { 
    console.error("Error al obtener perfil desde Supabase:", error.message); 
    return null; 
  }
}

export async function borrarCacheCliente() {
  sessionStorage.removeItem('perfil_usuario');
  sessionStorage.removeItem('perfil_usuario_time');
  return await cargarDatosCliente();
}

export async function obtenerCuponesCanjeados(uid) {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('UID_Social', uid)
      .order('fecha_emitido', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error al obtener cupones:", err.message);
    return [];
  }
}

export async function procesarCanjeCupon(uid, cupon) {
  try {
    // 1. Validar puntos frescos en la base de datos
    const { data: clienteFresco, error: errCliente } = await supabase
      .from('Clientes')
      .select('Puntos')
      .eq('UID_Social', uid)
      .single();

    if (errCliente) throw new Error("Error al verificar tus puntos actuales.");

    const puntosReales = clienteFresco.Puntos || 0;
    if (puntosReales < cupon.reqPuntos) {
      throw new Error("No tienes suficientes puntos para este canje.");
    }

    const nuevosPuntos = puntosReales - cupon.reqPuntos;
    const codigoGenerado = 'CUP-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 2. Actualizar puntos del cliente
    const { error: errUpdate } = await supabase
      .from('Clientes')
      .update({ Puntos: nuevosPuntos })
      .eq('UID_Social', uid);

    if (errUpdate) throw new Error("Error al descontar los puntos.");

    // 3. Insertar el cupón en la tabla rewards
    const { error: errReward } = await supabase
      .from('rewards')
      .insert([{
        UID_Social: uid,
        codigo: codigoGenerado,
        puntos_gastados: cupon.reqPuntos,
        Estado: 'ACTIVO',
        fecha_emitido: new Date().toISOString()
      }]);

    if (errReward) throw new Error("Error al generar tu cupón en el sistema.");

    return { success: true, nuevosPuntos, codigoGenerado };
  } catch (error) {
    throw error; // Relanza el error para que la interfaz lo maneje y muestre
  }
}