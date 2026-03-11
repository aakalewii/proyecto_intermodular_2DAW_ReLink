import { API_URL, getAuthHeaders} from './auth.js';

// --- CATEGORÍAS ---
export async function getCategorias() {
    const response = await fetch(`${API_URL}/categorias`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Error al cargar las categorías');
    return await response.json();
}

export async function createCategoria(data) {
    const response = await fetch(`${API_URL}/categorias`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok){
        throw new Error('Error al crear la categoría');
    }
    return await response.json();
}

export async function updateCategoria(id, data) {
    const response = await fetch(`${API_URL}/categorias/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok){
        throw new Error('Error al actualizar la categoría');
    }
    return await response.json();
}

export async function deleteCategoria(id) {
    const response = await fetch(`${API_URL}/categorias/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok){
        throw new Error('Error al borrar la categoría');
    }
    return await response.json();
}

// --- SUBCATEGORÍAS ---
export async function getSubcategorias() {
    const response = await fetch(`${API_URL}/subcategorias`, { headers: getAuthHeaders() });
    if (!response.ok){
        throw new Error('Error al cargar las subcategorías');
    }
    return await response.json();
}

export async function createSubcategoria(data) {
    const response = await fetch(`${API_URL}/subcategorias`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la subcategoría');
    }
    return await response.json();
}

export async function updateSubcategoria(id, data) {
    const response = await fetch(`${API_URL}/subcategorias/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la subcategoría');
    }
    return await response.json();
}

export async function deleteSubcategoria(id) {
    const response = await fetch(`${API_URL}/subcategorias/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok){
        throw new Error('Error al borrar la subcategoría');
    }
    return await response.json();
}

// Filtrado en cascada
export async function getSubcategoriasPorCategoria(categoriaId) {
    const response = await fetch(`${API_URL}/categorias/${categoriaId}/subcategorias`, { 
        headers: getAuthHeaders() 
    });
    if (!response.ok){
        throw new Error('Error al cargar las subcategorías filtradas');
    }
    return await response.json();
}