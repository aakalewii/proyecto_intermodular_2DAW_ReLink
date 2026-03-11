import { API_URL, getAuthHeaders} from './auth.js';

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
export async function createAnuncio(formData) {
    try {
        const token = localStorage.getItem('relink_token');
        
        const response = await fetch(`${API_URL}/anuncios`, {
            method: 'POST',
            headers: {
            'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData
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

// 4. Ver anuncio especifico
export async function getAnuncioById(id) {
    const response = await fetch(`${API_URL}/anuncios/${id}`, {
        // Es una ruta pública, así que solo necesitamos el Accept
        headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok){
        throw new Error('Error al cargar el anuncio');
    }
    return await response.json();
}

// 5. Borrar Anuncio
export async function deleteAnuncio(id) {
    try {
        const response = await fetch(`${API_URL}/anuncios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok){
            throw new Error('Error al borrar el anuncio');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}

// --- FUNCIÓN PARA SUBIR FOTOS ---
export async function uploadImagenes(anuncioId, formData) {
    const token = localStorage.getItem('relink_token');
    
    const response = await fetch(`${API_URL}/anuncios/${anuncioId}/imagenes`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok){
        throw new Error('Error al subir las imágenes del anuncio');
    }
    
    return await response.json();
}