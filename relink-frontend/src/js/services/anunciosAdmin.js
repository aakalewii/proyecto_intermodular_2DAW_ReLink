import { API_URL, getAuthHeaders } from './auth.js';

/*
   SERVICIO: GESTIÓN DE ANUNCIOS (ADMIN PANEL)
*/

// OBTENER ESTADÍSTICAS
export async function getAnuncioStats() {
    const response = await fetch(`${API_URL}/admin/anuncios/stats`, { 
        headers: getAuthHeaders() 
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Error al cargar las estadísticas');
    }
    return result;
}

// OBTENER LA LISTA COMPLETA DE ANUNCIOS
export async function getAnuncios() {
    const response = await fetch(`${API_URL}/admin/anuncios`, { 
        headers: getAuthHeaders() 
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Error al cargar los anuncios');
    }
    return result;
}

// SUSPENDER UN ANUNCIO
export async function suspenderAnuncio(id) {
    const response = await fetch(`${API_URL}/admin/anuncios/${id}/suspender`, {
        method: 'PUT',
        headers: getAuthHeaders()
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Error al suspender el anuncio');
    }
    return result;
}

// ACTIVAR UN ANUNCIO
export async function activarAnuncio(id) {
    const response = await fetch(`${API_URL}/admin/anuncios/${id}/activar`, {
        method: 'PUT',
        headers: getAuthHeaders()
    });
    
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Error al activar el anuncio');
    }
    return result;
}