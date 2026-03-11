export const API_URL = 'http://localhost:5500/api';

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
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
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

export function getAuthHeaders() {
    const token = localStorage.getItem('relink_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}