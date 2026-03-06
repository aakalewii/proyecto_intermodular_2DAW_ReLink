const API_URL = 'http://localhost:5500/api';

// Función auxiliar para obtener el token del admin
function getAuthHeaders() {
    const token = localStorage.getItem('relink_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// --- FUNCIONES PARA PAISES ---

// 1. Traer todos los países
export async function getPaises() {
    const response = await fetch(`${API_URL}/paises`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al cargar los países');
    return await response.json();
}

// 2. Crear un país nuevo
export async function createPais(data) {
    const response = await fetch(`${API_URL}/paises`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear el país');
    return await response.json();
}

// 4. Actualizar un país
export async function updatePais(id, data) {
    const response = await fetch(`${API_URL}/paises/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar el país. ¿Quizás el nombre ya existe?');
    return await response.json();
}

// 4. Borrar un país
export async function deletePais(id) {
    const response = await fetch(`${API_URL}/paises/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al borrar el país');
    return await response.json();
}

// --- FUNCIONES PARA PROVINCIAS ---

export async function getProvincias() {
    const response = await fetch(`${API_URL}/provincias`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Error al cargar las provincias');
    return await response.json();
}

export async function createProvincia(data) {
    const response = await fetch(`${API_URL}/provincias`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear la provincia');
    return await response.json();
}

export async function updateProvincia(id, data) {
    const response = await fetch(`${API_URL}/provincias/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar la provincia');
    return await response.json();
}

export async function deleteProvincia(id) {
    const response = await fetch(`${API_URL}/provincias/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al borrar la provincia');
    return await response.json();
}