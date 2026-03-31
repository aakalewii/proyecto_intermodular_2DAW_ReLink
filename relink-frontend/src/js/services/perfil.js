// Archivo: src/js/services/perfilService.js
import { API_URL, getAuthHeaders } from './auth.js';

/*
   SERVICIO: PERFILES DE USUARIO
   Este archivo maneja todas las llamadas a la API relacionadas con los usuarios.
   Tiene funciones tanto para la zona privada (Mi Perfil) como para la zona pública (Ver Vendedor).
*/

// ZONA PRIVADA (Requiere Token)
// Esta función pide al backend toda la información personal del usuario logueado (y sus anuncios).
export async function getMiPerfil() {
    // Al ser una ruta protegida en Laravel (middleware auth:sanctum),
    // es OBLIGATORIO enviarle el token en las cabeceras usando getAuthHeaders().
    const response = await fetch(`${API_URL}/perfil`, { headers: getAuthHeaders() });
    
    if (!response.ok) throw new Error('No se pudo cargar el perfil');
    
    return await response.json();
}

// Esta función envía los nuevos datos personales (nombre, teléfono, localidad) para actualizarlos.
export async function updatePerfil(datos) {
    const response = await fetch(`${API_URL}/perfil`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        // Convertimos el objeto JS con los nuevos datos a texto JSON plano
        body: JSON.stringify(datos)
    });
    
    if (!response.ok) throw new Error('Error al actualizar');
    
    return await response.json();
}

// FUNCION NO IMPLEMENTADA TODAVÍA
// ZONA PÚBLICA (No requiere Token)
// Esta función se usa cuando un visitante hace clic en un anuncio y quiere ver
// quién es el vendedor (sus datos públicos y otros anuncios que tenga).
export async function getPerfilUsuario(userId) {
    const response = await fetch(`${API_URL}/verperfil/${userId}`);
    
    if (!response.ok) throw new Error('No se pudo cargar el perfil del vendedor');
    
    return await response.json();
}

// Función para actualizar foto de perfil
export async function updateFotoPerfil(urlFoto) {
    // Al ser una ruta protegida en Laravel, usamos getAuthHeaders() para el token.
    // Como vamos a enviar datos, usamos el método PATCH y empaquetamos la URL en el body.
    const response = await fetch(`${API_URL}/perfil/foto`, { 
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url_foto: urlFoto })
    });
    
    if (!response.ok) throw new Error('No se pudo actualizar la foto de perfil');
    
    return await response.json();
}