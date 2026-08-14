import supabase from './supabase.js';


export async function iniciarSesion(proveedor) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: proveedor,
        options: { redirectTo: 'http://localhost:5173/index.html' } // Puerto por defecto de Vite
    });
    if (error) { throw error; }
    return data;
}


export async function verificarSesion() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) { console.error("Error al verificar la sesión:", error.message); return null; }
    if (!session) { return null; }    
    return session.user;
}

export async function cerrarSesion() {
    const { error } = await supabase.auth.signOut();
    if (error) { console.error("Error al cerrar sesión:", error.message); } else { window.location.href = 'index.html';}
}


supabase.auth.onAuthStateChange((event, session) => { if (event === 'SIGNED_OUT') {window.location.reload();  }  });//cambios de secion en supebase




// Solo para paginas que necesiten si o si usuario como el perfil

// import { verificarSesion } from './auth.js';

// document.addEventListener("DOMContentLoaded", async () => {
//     const user = await verificarSesion();
//     if (!user) return window.location.href = 'is.html';
//     console.log("Bienvenido a tu perfil", user.email);
// });