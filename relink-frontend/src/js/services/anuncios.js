import { API_URL } from './auth.js';

// Obtener todos los anuncios
export async function getAnuncios() {
    const response = await fetch(`${API_URL}/anuncios`, {
        headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error('Error al cargar anuncios');
    return await response.json();
}

// OBTENER DETALLE DE UN ANUNCIO (Para ver-anuncio.js)
export async function getAnuncioById(id) {
    const response = await fetch(`${API_URL}/anuncios/${id}`, {
        headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error('No se pudo cargar el anuncio');
    return await response.json(); 
}

// Eliminar Anuncio
export async function deleteAnuncio(id) {
    const token = localStorage.getItem('relink_token');
    const response = await fetch(`${API_URL}/anuncios/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    if (!response.ok) throw new Error('Error al eliminar el anuncio');
    return await response.json();
}

// Actualizar Anuncio (Para editar)
export async function updateAnuncio(id, formData) {
    const token = localStorage.getItem('relink_token');
    const response = await fetch(`${API_URL}/anuncios/${id}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        body: formData
    });
    if (!response.ok) throw new Error('Error al actualizar');
    return await response.json();
}