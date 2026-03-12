// Archivo: src/js/services/perfilService.js
import { API_URL, getAuthHeaders } from './auth.js';

export async function getMiPerfil() {
    const response = await fetch(`${API_URL}/perfil`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('No se pudo cargar el perfil');
    return await response.json();
}

export async function updatePerfil(datos) {
    const response = await fetch(`${API_URL}/perfil`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(datos)
    });
    if (!response.ok) throw new Error('Error al actualizar');
    return await response.json();
}

export async function getPerfilUsuario(userId) {
    const response = await fetch(`${API_URL}/verperfil/${userId}`);
    if (!response.ok) throw new Error('No se pudo cargar el perfil del vendedor');
    return await response.json();
}