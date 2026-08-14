import { verificarSesion, cerrarSesion } from './auth.js';

document.addEventListener("DOMContentLoaded", async () => {
    const btnLogin = document.getElementById('btn-login');
    const userProfile = document.getElementById('Perfil_Usuario');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const btnLogout = document.getElementById('Cerrar-Sesion');
    const dropdownMenu = document.getElementById('dropdown-menu'); // Nuevo elemento

    const user = await verificarSesion();

    if (user) {
        if(btnLogin) btnLogin.style.display = 'none';
        if(userProfile) userProfile.style.display = 'flex';

        const nombre = user.user_metadata?.full_name || user.email;
        const fotoUrl = user.user_metadata?.avatar_url || 'assets/default-avatar.png';

        if(userName) userName.textContent = nombre;
        if(userAvatar) userAvatar.src = fotoUrl;

        // --- LÓGICA DEL MENÚ DESPLEGABLE ---
        if (userAvatar && dropdownMenu) {
            // Abrir/Cerrar al tocar el avatar
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que el clic se propague y cierre el menú de inmediato
                dropdownMenu.classList.toggle('show-dropdown');
            });

            // Cerrar el menú si se hace clic fuera de él
            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target)) {
                    dropdownMenu.classList.remove('show-dropdown');
                }
            });
        }
        // ------------------------------------

        if(btnLogout) {
            btnLogout.addEventListener('click', async () => {
                await cerrarSesion();
                window.location.reload(); 
            });
        }
    } else {
        if(btnLogin) btnLogin.style.display = 'flex';
        if(userProfile) userProfile.style.display = 'none';
    }
});







// import { verificarSesion } from './auth.js';
// import supabase from './supabase.js'; // Tu cliente de supabase del frontend

// async function obtenerMisPedidos() {
//     // 1. Llamas a la función que ya creaste en auth.js
//     const user = await verificarSesion();

//     if (!user) {
//         console.log("Debes iniciar sesión para ver tus pedidos.");
//         return;
//     }

//     // 2. Si el usuario existe, puedes usar "user.id" (o user.email) para buscar en tu BD
//     console.log("El ID único del usuario es:", user.id);
//     console.log("El email del usuario es:", user.email);

//     // 3. Ejemplo de consulta a Supabase usando el ID del usuario:
//     try {
//         const { data: pedidos, error } = await supabase
//             .from('Pedidos')
//             .select('*')
//             .eq('cliente_id', user.id); // Asumiendo que guardas el id del usuario en la columna cliente_id

//         if (error) throw error;
        
//         console.log("Tus pedidos son:", pedidos);
//         // Aquí pintarías los pedidos en el HTML...
        
//     } catch (error) {
//         console.error("Error al buscar en la base de datos:", error.message);
//     }
// }

// // Ejecutar la función cuando sea necesario
// obtenerMisPedidos();