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
<<<<<<< Updated upstream
=======
}

// 6. Borrar una imagen suelta de un anuncio
export async function deleteImagenAnuncio(imagenId) {
    const token = localStorage.getItem('relink_token');
    const response = await fetch(`${API_URL}/imagenes/${imagenId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) throw new Error('Error al borrar la imagen');
    return await response.json();
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

// --- NUEVA FUNCIÓN: ACTUALIZAR ANUNCIO CON FOTOS (FormData) ---
export async function updateAnuncioCompleto(id, formData) {
    const token = localStorage.getItem('relink_token');
    
    const response = await fetch(`${API_URL}/anuncios/${id}`, {
        method: 'POST', // Usamos POST porque Laravel lo requiere cuando enviamos archivos y el _method=PUT
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json'
            // OJO: No pongas 'Content-Type': 'multipart/form-data' aquí, fetch lo pone solo con el boundary correcto
        },
        body: formData
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al actualizar el anuncio completo');
    }
    return await response.json();
>>>>>>> Stashed changes
}