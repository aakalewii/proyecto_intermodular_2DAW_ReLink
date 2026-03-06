const API_URL = 'http://localhost:5500/api';

// Función auxiliar para obtener el token guardado
function getAuthHeaders() {
    const token = localStorage.getItem('relink_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// 1. Leer Anuncios
export async function getAnuncios() {
    try {
        const response = await fetch(`${API_URL}/anuncios`, {
            headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Error al cargar los anuncios');
        return await response.json();
    } catch (error) {
        throw error;
    }
}

// 2. Crear Anuncio
export async function createAnuncio(anuncioData) {
    try {
        const response = await fetch(`${API_URL}/anuncios`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(anuncioData)
        });
        if (!response.ok) throw new Error('Error al crear el anuncio');
        return await response.json();
    } catch (error) {
        throw error;
    }
}

// 3. Actualizar Anuncio
export async function updateAnuncio(id, anuncioData) {
    try {
        const response = await fetch(`${API_URL}/anuncios/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(anuncioData)
        });
        if (!response.ok) throw new Error('Error al actualizar el anuncio');
        return await response.json();
    } catch (error) {
        throw error;
    }
}

// 4. Borrar Anuncio
export async function deleteAnuncio(id) {
    try {
        const response = await fetch(`${API_URL}/anuncios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Error al borrar el anuncio');
        return await response.json();
    } catch (error) {
        throw error;
    }
}