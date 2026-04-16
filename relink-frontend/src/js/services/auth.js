// Esta constante define la ruta base de nuestra API en Laravel.
export const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5500/api' 
    : 'http://relink-equipo.ddns.net/backend/api';

export const STORAGE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5500/storage/'      // storage en local
    : 'http://relink-equipo.ddns.net/backend/storage/';

// Esta función auxiliar construye las cabeceras (headers) HTTP necesarias para las peticiones seguras.
export function getAuthHeaders() {
    const token = localStorage.getItem('relink_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Si hay token, lo inyectamos con el formato Bearer. Si no, mandamos un string vacío.
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

export async function verificarAccesoUsuario() {
    const token = localStorage.getItem('relink_token');
    if (!token) return false;

    try {
        const user = await misDatos();

        if (user.email_verified_at === null) {
            window.location.href = '/email-revisar-bandeja.html'; 
            return false;
        }
        return true; 
        
    } catch (error) {
        forzarCierreSesion();
        return false;
    }
}

// Este método se usa en las páginas de administración para asegurar que nadie se cuele.
export async function verificarAccesoAdmin() {
    const token = localStorage.getItem('relink_token');

    // Si ni siquiera está logueado, lo mandamos al login
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }

    try {

        // Comprobammos el rol del user
        const user = await misDatos();

        // Si no es adin forzamos cierre eliminando el token
        if (user.rol !== 'admin') {
                forzarCierreSesion();
                return false;
            }

        // Si llega aquí, es porque tiene token y su rol es ADMIN
        return true;

    } catch (error) {
        // Si misDatos() lanza un error (ej. token caducado o falso)
        forzarCierreSesion();
        return false;
    }

    return true;
}

export function forzarCierreSesion() {

    console.log('polla gorda')
    // Destruimos el token falso o caducado
    localStorage.removeItem('relink_token');
    
    // Redirigimos a la vista
    window.location.replace('./acceso-denegado.html');
}

// Método para recibir los datos del usuario desde el token y no tener que subir el user al LocalStorage
export async function misDatos(){

    const token = localStorage.getItem('relink_token');
    const response = await fetch(`${API_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

    if (!response.ok) {
            throw new Error('Token inválido');
        }

    const user = await response.json();
    return user;
}

// Este método se encarga de enviar los datos del nuevo usuario al backend mediante una petición POST.
// Convierte el objeto de JavaScript a una cadena de texto (JSON.stringify) para que Laravel lo entienda.
// Si Laravel devuelve un error (ej. email duplicado), lanza una excepción que será capturada por el frontend.
export async function registerUser(userData) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en el registro. Revisa los datos.');
        }

        return data;
    } catch (error) {
        throw error; // Re-lanzamos el error
    }
}

// Este método contacta con el endpoint de login de Laravel.
// Recibe el email y la contraseña, y si todo va bien, devuelve la respuesta de la API
export async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Credenciales incorrectas.');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Este método avisa a Laravel de que queremos destruir la sesión.
// A diferencia del login y register, aquí usamos getAuthHeaders() porque
// esta es una "Ruta Protegida": Laravel necesita saber QUÉ token queremos destruir.
export async function logoutUser() {
    const token = localStorage.getItem('relink_token');
    
    if (!token) return; // Si no hay token

    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: getAuthHeaders() // Inyectamos el Bearer Token
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cerrar sesión en el servidor.');
        }

        return data;
    } catch (error) {
        console.error("Error en el logout:", error);
        throw error;
    }
}