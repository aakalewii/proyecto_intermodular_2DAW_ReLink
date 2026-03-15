// Importamos la URL base y nuestra función "mágica" que construye las cabeceras con el Token
import { API_URL, getAuthHeaders} from './auth.js';

/*
   SERVICIO: CATEGORÍAS Y SUBCATEGORÍAS
   Este archivo actúa como un "traductor" entre nuestra interfaz visual y el backend de Laravel.
   Ningún archivo HTML o JS de las vistas habla directamente con la API; todos tienen que
   pedirle los datos a estas funciones.
*/

// CATEGORÍAS PRINCIPALES
// Obtiene la lista completa de categorías (Método GET)
export async function getCategorias() {
    // Le pasamos las cabeceras de autenticación por si la ruta está protegida.
    const response = await fetch(`${API_URL}/categorias`, { headers: getAuthHeaders() });
    
    // Si la respuesta no es 200 OK (ej: 404 Not Found o 500 Server Error)
    if (!response.ok) throw new Error('Error al cargar las categorías');
    
    // Convertimos el string JSON que llega del servidor a un objeto de JavaScript usable
    return await response.json();
}

// Crea una nueva categoría
export async function createCategoria(data) {
    const response = await fetch(`${API_URL}/categorias`, {
        method: 'POST',
        headers: getAuthHeaders(),
        // Convertimos el objeto JS a texto plano (JSON)
        body: JSON.stringify(data)
    });
    if (!response.ok){
        throw new Error('Error al crear la categoría');
    }
    return await response.json();
}

// Actualiza una categoría existente
export async function updateCategoria(id, data) {
    // URL: inyectamos el ID concreto al final, cumpliendo con el estándar REST
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

// Elimina una categoría
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

// SUBCATEGORÍAS
// (La lógica es idéntica al CRUD anterior, pero apuntando a la tabla/ruta de subcategorías)

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
        // leemos el mensaje exacto que nos manda el backend (errorData.message) y lo mostramos.
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


// RUTAS PERSONALIZADAS


// Filtrado en cascada: Esta función es la que usan los formularios de Anuncios
// cuando seleccionas "Motor" y quieres que el segundo select solo muestre "Coches", "Motos", etc.
export async function getSubcategoriasPorCategoria(categoriaId) {
    // URL: es una ruta anidada (/categorias/5/subcategorias).
    // Expresa perfectamente la relación jerárquica: "De la categoría 5, dame sus subcategorías".
    const response = await fetch(`${API_URL}/categorias/${categoriaId}/subcategorias`, { 
        headers: getAuthHeaders() 
    });
    if (!response.ok){
        throw new Error('Error al cargar las subcategorías filtradas');
    }
    return await response.json();
}