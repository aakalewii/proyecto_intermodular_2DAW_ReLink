export const API_URL = 'http://localhost:5500/api';

// Función auxiliar para obtener el token guardado
export function getAuthHeaders() {
    const token = localStorage.getItem('relink_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Función para el acceso de Admins
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
        // Borramos todo el contenido de la página y pintamos una vista de error
        document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background-color: #f8f9fa;">
                <h1 style="font-size: 5rem; margin: 0; color: #dc3545;">403</h1>
                <h2 style="color: #333;">Acceso Denegado</h2>
                <p style="color: #666; margin-bottom: 20px;">No tienes los permisos necesarios para acceder a esta zona.</p>
                <a href="/index.html" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Volver al Inicio</a>
            </div>
        `;
        return false;
    }

    return true;
}

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
        throw error;
    }
}


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

export async function logoutUser() {
    const token = localStorage.getItem('relink_token');
    
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: getAuthHeaders()
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