import { API_URL, getAuthHeaders } from './auth.js';

/*
   SERVICIO: GESTIÓN DE USUARIOS (ADMIN PANEL)
*/

// OBTENER RESUMEN / ESTADÍSTICAS
export async function getDashboardStats() {
    const response = await fetch(`${API_URL}/admin/stats`, { 
        headers: getAuthHeaders() 
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Error al cargar las estadísticas');
    }
    return result;
}

// OBTENER LA LISTA COMPLETA DE USUARIOS
export async function getUsuarios() {
    const response = await fetch(`${API_URL}/admin/users`, { 
        headers: getAuthHeaders() 
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Error al cargar los usuarios');
    }
    return result;
}

// ACTUALIZAR UN USUARIO
export async function updateUsuarioComoAdmin(id, userData) {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar el usuario');
    }
    return result;
}