import { API_URL, getAuthHeaders } from './auth.js'; 

export async function getAnunciosSwipe(filtros) {
    try {
        const response = await fetch(`${API_URL}/swipe/anuncios`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(filtros) 
        });

        if (!response.ok) {
            const errorFecth = await response.json();
            throw new Error(errorFecth.message || 'Error al obtener anuncios para swipe');
        }

        return await response.json();
        
    } catch (error) {
        throw error;
    }
}