import { API_URL, getAuthHeaders } from './auth.js'; 

/*
   SERVICIOS DE FAVORITOS (API FETCH)
   Este archivo agrupa todas las peticiones al servidor que gestionan la lista 
   de deseos del usuario.
*/

// Esta función actúa como un interruptor. Al llamarla, enviamos el ID del anuncio al backend mediante POST. 
// Si el anuncio no estaba en nuestra lista, el servidor lo añade; si ya estaba, lo quita. 
export async function toggleFavorito(anuncioId) {
    const response = await fetch(`${API_URL}/favoritos/${anuncioId}`, {
        method: 'POST',
        headers: getAuthHeaders()
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Error');
    }
    
    return result; 
}

// Esta función es una consulta de solo lectura (GET). 
// Se lanza automáticamente cuando el usuario entra a la página de detalle de un anuncio. 
// Le pregunta al backend si ese anuncio ya está guardado por el usuario logueado, 
// lo que nos permite pintar el icono del corazón vacío o relleno de color rojo.
export async function checkIfFavorito(anuncioId) {
    const response = await fetch(`${API_URL}/favoritos/check/${anuncioId}`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Error');
    }
    
    return result; 
}

// Esta función pide al servidor (GET) el catálogo completo de todos los anuncios que el usuario ha marcado como favoritos. 
// Es la que utilizamos para rellenar la pantalla de "Mi lista de favoritos" en el panel de control del usuario.
export async function getMisFavoritos() {
    const response = await fetch(`${API_URL}/favoritos`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Error');
    }
    
    return result;
}