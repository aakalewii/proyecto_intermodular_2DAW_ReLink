import { API_URL, getAuthHeaders} from './auth.js';

// Método para ocultar un anuncio (No me interesa)
export async function marcarNoMeInteresa(id) {
    try {
        const response = await fetch(`${API_URL}/anuncios/${id}/dislike`, {
            method: 'POST',
            headers: getAuthHeaders() 
        });

        if (!response.ok) {
            const errorData = await response.json(); 
            throw new Error(errorData.message || 'Error al ocultar el anuncio');
        }

        return await response.json();
        
    } catch (error) {
        throw error;
    }
}

// Obtener los anuncios descartados
export async function getMisDescartes() {
    try {
        const response = await fetch(`${API_URL}/mis-descartes`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Error al cargar descartes');
        return await response.json();
    } catch (error) { throw error; }
}

// Restaurar un anuncio
export async function quitarNoMeInteresa(id) {
    try {
        const response = await fetch(`${API_URL}/anuncios/${id}/dislike`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al restaurar anuncio');
        return await response.json();
    } catch (error) { throw error; }
}