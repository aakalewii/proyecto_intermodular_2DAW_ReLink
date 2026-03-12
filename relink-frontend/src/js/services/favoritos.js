import { API_URL, getAuthHeaders } from './auth.js'; 

export async function toggleFavorito(anuncioId) {
    const response = await fetch(`${API_URL}/favoritos/${anuncioId}`, {
        method: 'POST',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Error al modificar la lista de favoritos');
    }
    
    return await response.json(); 
}

export async function checkIfFavorito(anuncioId) {
    const response = await fetch(`${API_URL}/favoritos/check/${anuncioId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Error al comprobar el estado del favorito');
    }
    
    return await response.json(); 
}

// Obtener todos los anuncios favoritos del usuario
export async function getMisFavoritos() {
    const response = await fetch(`${API_URL}/favoritos`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        throw new Error('Error al cargar la lista de favoritos');
    }
    
    return await response.json(); 
}