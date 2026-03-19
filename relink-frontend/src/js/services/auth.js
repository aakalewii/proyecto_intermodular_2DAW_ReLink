// Esta constante define la ruta base de nuestra API en Laravel.
export const API_URL = 'http://localhost:5500/api';

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

// Este método se usa en las páginas de administración para asegurar que nadie se cuele.
export function verificarAccesoAdmin() {
    const token = localStorage.getItem('relink_token');
    const userString = localStorage.getItem('relink_user');

    // Si ni siquiera está logueado, lo mandamos al login
    if (!token || !userString) {
        window.location.href = '/login.html';
        return false;
    }

    const user = JSON.parse(userString);

    // Si está logueado pero su rol NO es de administrador
    if (user.rol !== 'admin') {
        window.location.href = '/acceso-denegado.html';
        return false;
    }

    return true;
}

export function forzarCierreSesion() {
    // Destruimos el token falso o caducado
    localStorage.removeItem('relink_token');
    localStorage.removeItem('relink_user'); 
    
    // Redirigimos a la vista
    window.location.href = '/acceso-denegado.html';
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