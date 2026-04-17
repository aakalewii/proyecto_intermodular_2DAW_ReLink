import { API_URL, getAuthHeaders} from './auth.js';

/*
   SERVICIOS DE ANUNCIOS (API FETCH)

   Este archivo gestiona toda la comunicación con el backend referente a los 
   productos de la plataforma. Como los anuncios incluyen subida de imágenes, 
   veremos que algunas funciones usan 'FormData' en lugar de simples JSON.
*/

// Esta función se encarga de traer el tablón principal de anuncios. 
// Comprueba si el usuario está logueado leyendo el token. Si lo está, envía el token al backend para que Laravel 
// pueda filtrar y no mostrarle al usuario sus propios anuncios en la pantalla principal. 
// Si no hay token, simplemente trae todos los anuncios públicos.
export async function getAnuncios(busqueda = '') {
    try {
        const headersConfig = { 
            'Accept': 'application/json' 
        };

        const token = localStorage.getItem('relink_token');
        if (token) {
            headersConfig['Authorization'] = `Bearer ${token}`;
        }

        // Construimos la URL. Si hay búsqueda, le pegamos el ?buscar=...
        let url = `${API_URL}/anuncios`;
        if (busqueda && busqueda.trim() !== '') {
            url += `?buscar=${encodeURIComponent(busqueda)}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: headersConfig
        });

        if (!response.ok){
            throw new Error('Error al cargar los anuncios');
        }

        return await response.json();
        
    } catch (error) {
        throw error;
    }
}

// Esta función envía al servidor toda la información de un anuncio nuevo. 
// A diferencia de otros servicios, aquí recibimos un objeto 'FormData' porque necesitamos enviar archivos físicos (las fotos). 
// Por eso, no usamos JSON.stringify ni ponemos el header 'Content-Type', dejando que el navegador configure automáticamente el envío de archivos.
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

        if (!response.ok){
            const errorData = await response.json();

            throw new Error( errorData.message || 'Error al crear el anuncio');
        }
        return await response.json();

    } catch (error) {
        throw error;
    }
}

// Esta función es de acceso totalmente público. 
// Su trabajo es pedirle a la base de datos toda la información detallada de un anuncio concreto usando su ID. 
// No necesita token de seguridad porque cualquiera puede ver el detalle de un producto.
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

// Esta función procesa el borrado de un anuncio. Exige estar autenticado (getAuthHeaders), ya que el backend comprobará 
// estrictamente que el anuncio que intentas borrar te pertenece a ti y no a otro usuario.
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

// Esta es la función para editar un anuncio de forma completa. 
// Usamos el método POST en lugar de PUT porque PHP/Laravel no procesa bien la subida de archivos (FormData) mediante peticiones PUT nativas.
export async function updateAnuncioCompleto(id, formData) {
    const token = localStorage.getItem('relink_token');
    
    const response = await fetch(`${API_URL}/anuncios/${id}`, {
        method: 'POST',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Accept': 'application/json'
        },
        body: formData
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al actualizar el anuncio completo');
    }
    return await response.json();
}

// Esta función cambia el estado de un anuncio a "VENDIDO".
// Usamos el método PUT para actualizar el recurso y exigimos estar autenticados (getAuthHeaders)
// para que el backend valide que somos los dueños del anuncio.
export async function marcarComoVendido(id) {
    try {
        const response = await fetch(`${API_URL}/anuncios/${id}/vendido`, {
            method: 'PATCH',
            headers: getAuthHeaders() 
        });

        if (!response.ok) {
            // Intentamos capturar el mensaje exacto que nos manda Laravel (ej. "El anuncio ya estaba vendido")
            const errorData = await response.json(); 
            throw new Error(errorData.message || 'Error al marcar el anuncio como vendido');
        }

        return await response.json();
        
    } catch (error) {
        throw error;
    }
}

// Método para recuperar un anuncio eliminado
export async function recuperarAnuncio(id) {
    try {
        const response = await fetch(`${API_URL}/anuncios/${id}/recuperar`, {
            method: 'PATCH',
            headers: getAuthHeaders() 
        });

        if (!response.ok) {
            // Intentamos capturar el mensaje exacto que nos manda Laravel (ej. "No tienes permiso")
            const errorData = await response.json(); 
            throw new Error(errorData.message || 'Error al recuperar el anuncio');
        }

        return await response.json();
        
    } catch (error) {
        throw error;
    }

}