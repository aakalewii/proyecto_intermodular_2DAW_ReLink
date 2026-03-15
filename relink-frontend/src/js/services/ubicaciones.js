import { API_URL, getAuthHeaders } from './auth.js';

/* 
   SERVICIOS DE UBICACIONES (API FETCH)

   Este archivo centraliza todas las peticiones (HTTP) que el frontend hace a 
   nuestra API de Laravel relacionadas con la geografía. 
   
   La ventaja de tener esto separado es la reutilización en cualquier vista 
   pudiendo importar estas funciones sin tener que repetir la lógica del fetch.

*/

// --- FUNCIONES PARA PAISES ---

// Esta función hace una petición GET a la API para traer la lista completa de países. 
// Inyecta los tokens de seguridad con 'getAuthHeaders()' para que el backend sepa quién está haciendo la petición.
export async function getPaises() {
    const response = await fetch(`${API_URL}/paises`, {
        headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al realizar la operación');
    }
    return result;
}

// Esta función se encarga de mandar los datos de un nuevo país al backend usando el método POST. 
// Convierte el objeto de datos en un string JSON para que Laravel pueda entenderlo y guardarlo.
export async function createPais(data) {
    const response = await fetch(`${API_URL}/paises`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al realizar la operación');
    }
    return result;
}

// Esta función actualiza un país existente. Requiere el ID por la URL para saber cuál modificar 
// y usa el método PUT para enviar los nuevos datos que queremos sobrescribir en la base de datos.
export async function updatePais(id, data) {
    const response = await fetch(`${API_URL}/paises/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al realizar la operación');
    }
    return result;
}

// Esta función pide al servidor que elimine un registro usando el método DELETE. 
// Como solo necesita el ID, solo envaiamos la URL correspondiente y nuestras credenciales.
export async function deletePais(id) {
    const response = await fetch(`${API_URL}/paises/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al realizar la operación');
    }
    return result;
}

// El resto de la jerarquía geográfica sigue el mismo patron que paises.

// --- FUNCIONES PARA PROVINCIAS ---

export async function getProvincias() {
    const response = await fetch(`${API_URL}/provincias`, { headers: getAuthHeaders() });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al realizar la operación');
    }
    return result;
}

export async function createProvincia(data) {
    const response = await fetch(`${API_URL}/provincias`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al realizar la operación');
    }
    return result;
}

export async function updateProvincia(id, data) {
    const response = await fetch(`${API_URL}/provincias/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al realizar la operación');
    }
    return result;
}

export async function deleteProvincia(id) {
    const response = await fetch(`${API_URL}/provincias/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al realizar la operación');
    }
    return result;
}


// -- FUNCIONES PARA MUNICIPIOS --


export async function getMunicipios() {
    const response = await fetch(`${API_URL}/municipios`, {
        headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al realizar la operación');
    }
    return result;
}

export async function createMunicipio(data) {
    const response = await fetch(`${API_URL}/municipios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al crear');
    }
    return result;
}

export async function updateMunicipio(id, data) {
    const response = await fetch(`${API_URL}/municipios/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al actualizar');
    }
    return result;
}

export async function deleteMunicipio(id) {
    const response = await fetch(`${API_URL}/municipios/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al borrar');
    }
    return result;
}

// -- FUNCIONES PARA LOCALIDADES --

export async function getLocalidades() {
    const response = await fetch(`${API_URL}/localidades`, {
        headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al realizar la operación');
    }
    return result;
}

export async function createLocalidad(data) {
    const response = await fetch(`${API_URL}/localidades`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al crear la localidad');
    }
    return result;
}

export async function updateLocalidad(id, data) {
    const response = await fetch(`${API_URL}/localidades/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al actualizar la localidad');
    }
    return result;
}

export async function deleteLocalidad(id) {
    const response = await fetch(`${API_URL}/localidades/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const result = await response.json();
    if (!response.ok){
        throw new Error(result.message || 'Error al borrar la localidad');
    }
    return result;
}