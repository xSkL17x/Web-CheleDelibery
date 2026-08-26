// //js/authController.js

import supabase from './supabase-server.js';

// ———————————————๑•̀ᴗ•̀) ̫ ─꒱ FUNCIONES AUXILIARES ———————————————

const limpiarNumero = (numero) => numero ? numero.replace(/\s+/g, '') : '';
const obtenerFechaActual = () => new Date().toISOString().split('T')[0];

const buscarClientePorTelefono = async (telefono) => {
  console.log(`Buscando si el teléfono ${telefono} ya existe en la BD...`);
  const { data, error } = await supabase
    .from('Clientes')
    .select('*')
    .eq('telefono', telefono);

  if (error) {console.error('Error en Supabase al buscar cliente:', error);throw error  }
  return data && data.length > 0; 
};

const generarDatosBaseNuevoCliente = (telefono) => {
  return {
    ID_Cliente: crypto.randomBytes(4).toString('hex'),
    telefono: telefono,
    regristrado_web: true,
    fecha_registro: obtenerFechaActual()
  };
};



export const obtenerPerfilUsuario = async (req, res) => {
  try {
    // 1. Extraer el token de autenticación del header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No autorizado: Falta token de sesión' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Validar el token con Supabase para obtener el usuario real logueado
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    // 3. Traer datos del cliente (usando el UID de la sesión validada)
    const { data: cliente, error: errorCliente } = await supabase
      .from('Clientes')
      .select('ID_Cliente, nombre, telefono, UID_Social, puntos')
      .eq('UID_Social', user.id)
      .single();

    if (errorCliente || !cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    // 4. Traer ubicación
    const { data: ubicacion } = await supabase
      .from('Ubicacion_Usuarios')
      .select('*')
      .eq('usuario_id', cliente.ID_Cliente)
      .eq('TipoUbicacion', 'web')
      .maybeSingle();

    return res.json({
      id: cliente.ID_Cliente,
      nombre: cliente.nombre || 'Cliente',
      telefono: cliente.telefono,
      puntos: cliente.puntos || 0,
      ubicacion: ubicacion || null
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
// ———————————————๑•̀ᴗ•̀) ̫ ─꒱ Regitro Por Google ———————————————


export const registroSocial = async (req, res) => {
  console.log('--- Iniciando registroSocial ---');
  try {
    const { celular, uid_social } = req.body;


    if (!celular || !uid_social) {return res.status(400).json({ error: 'Celular y UID de red social obligatorios' });}

    const telefonoLimpio = limpiarNumero(celular);
    

    const existe = await buscarClientePorTelefono(telefonoLimpio);

    if (existe) {
      console.log('El cliente YA EXISTE. Procediendo a enlazar red social...');
      const { data, error } = await supabase
        .from('Clientes')
        .update({ regristrado_web: true, UID_Social: uid_social })
        .eq('telefono', telefonoLimpio)
        .select();

      if (error) return res.status(400).json({ error: `Error en BD: ${error.message}` });
      return res.status(200).json({ mensaje: 'Red social enlazada', usuario: data });
    }

    console.log('El cliente ES NUEVO. Procediendo a insertar datos iniciales sociales...');
    
    const datosNuevos = {
        ...generarDatosBaseNuevoCliente(telefonoLimpio),
        UID_Social: uid_social};

    const { data, error } = await supabase.from('Clientes').insert([datosNuevos]).select();

    if (error) return res.status(400).json({ error: `Error en BD: ${error.message}` });
    res.status(201).json({ mensaje: 'Usuario social creado (faltan datos)', usuario: data });

  } catch (error) { 
    console.error('Error crítico en registroSocial:', error);
    res.status(500).json({ error: 'Error interno' }); 
  }
};

