import { API_URL } from './auth.js';

/**
 * Obtiene todas las categorías principales
 */
export async function getCategorias() {
    try {
        const response = await fetch(`${API_URL}/categorias`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener las categorías');
        }

        return await response.json();
    } catch (error) {
        console.error("Error en getCategorias:", error);
        throw error;
    }
}

/**
 * Obtiene las subcategorías de una categoría específica
 * @param {number} categoriaId 
 */
export async function getSubcategoriasPorCategoria(categoriaId) {
    try {
        // Asumimos que tu API filtra por ID de categoría
        // Si tu ruta es distinta (ej: /categorias/${categoriaId}/subcategorias), cámbiala aquí
        const response = await fetch(`${API_URL}/subcategorias?categoria_id=${categoriaId}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener las subcategorías');
        }

        const data = await response.json();
        
        // Dependiendo de cómo devuelva Laravel los datos, 
        // a veces vienen en data.datos o directamente en data
        return data.datos || data;
        
    } catch (error) {
        console.error("Error en getSubcategoriasPorCategoria:", error);
        throw error;
    }
}