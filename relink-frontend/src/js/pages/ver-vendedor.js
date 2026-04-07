import { renderNavbar } from '../components/navBar.js';
import { getPerfilUsuario } from '../services/perfil.js'; // El servicio que acabamos de crear

// PANTALLA: VER PERFIL DEL VENDEDOR (Público)

document.addEventListener('DOMContentLoaded', async () => {
    
    renderNavbar();

    // Extraemos la ID del vendedor desde la URL (ej: ver-vendedor.html?id=3)
    const parametros = new URLSearchParams(window.location.search);
    const vendedorId = parametros.get('id');

    // Referencias al DOM
    const mensajeEstado = document.getElementById('mensaje-estado');
    const bloqueLectura = document.getElementById('bloque-lectura');
    const contenedorPrincipal = document.getElementById('contenido-vendedor');

    if (!vendedorId) {
        mensajeEstado.innerHTML = '<span style="color: red;">Error: No se ha especificado ningún vendedor.</span>';
        return; 
    }

    try {
        // Llamamos a la ruta pública de Laravel (sin token)
        const respuesta = await getPerfilUsuario(vendedorId);
        const vendedor = respuesta.data;
        
        // ---  PINTAMOS LOS DATOS PERSONALES DEL VENDEDOR ---
        
        // Reconstruimos el nombre completo
        const nombreCompleto = vendedor.apellidos 
            ? `${vendedor.nombre} ${vendedor.apellidos}` 
            : vendedor.nombre;
            
        document.getElementById('vend-nombre').textContent = nombreCompleto;
        document.getElementById('vend-telefono').textContent = vendedor.telefono || 'No especificado';
        document.getElementById('vend-localidad').textContent = vendedor.localidad;

        // Pintamos su foto de perfil si la tiene
        const divFoto = document.getElementById('bloque-foto-vendedor');
        if (divFoto) {
            const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';
            
            // Si Laravel nos manda url, la usamos. Si no, default.
            let rutaFoto = vendedor.url 
                ? `${URL_BACKEND_STORAGE}${vendedor.url}`
                : `${URL_BACKEND_STORAGE}perfiles/default.jpg`;

            divFoto.innerHTML = `
                <div style="text-align: left; margin-bottom: 20px;">
                    <img src="${rutaFoto}" alt="Foto de perfil de ${vendedor.nombre}" 
                         style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                </div>
            `;
        }

        // ---  PINTAMOS SUS ANUNCIOS PÚBLICOS ---
        pintarAnunciosVendedor(vendedor.anuncios);

        // Ocultamos el mensaje de "Cargando..." y mostramos el perfil
        if (mensajeEstado) mensajeEstado.style.display = 'none';
        if (contenedorPrincipal) contenedorPrincipal.style.display = 'block';

    } catch (error) {
        console.error("Error al cargar el perfil del vendedor:", error);
        if (mensajeEstado) {
            mensajeEstado.innerHTML = '<span style="color: red;">El perfil de este vendedor no existe o ha sido eliminado.</span>';
        }
    }

    // FUNCIÓN PARA PINTAR LAS TARJETAS
    function pintarAnunciosVendedor(anuncios) {
        const listaAnuncios = document.getElementById('anuncios-vendedor-lista');
        listaAnuncios.innerHTML = ''; 

        if (anuncios.length === 0) {
            listaAnuncios.innerHTML = '<p class="texto-vacio">Este vendedor no tiene anuncios publicados en este momento.</p>';
            return; 
        }

        const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';

        anuncios.forEach(anuncio => {
            const card = document.createElement('div');
            card.className = 'anuncio-card';
            
            card.style = `border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; height: 100%; transition: box-shadow 0.3s;`;
            
            card.addEventListener('mouseenter', () => card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)');
            card.addEventListener('mouseleave', () => card.style.boxShadow = 'none');

            let rutaImagen;
            if (anuncio.imagenes && anuncio.imagenes.length > 0) {
                rutaImagen = `${URL_BACKEND_STORAGE}${anuncio.imagenes[0].url}`;
            } else {
                rutaImagen = `${URL_BACKEND_STORAGE}anuncios/default1.jpg`;
            }

            const fecha = anuncio.fecha_publi ? anuncio.fecha_publi : anuncio.created_at;

            // Inyectamos el diseño
            card.innerHTML = `
                <div style="cursor: pointer; flex-grow: 1; display: flex; flex-direction: column;" onclick="window.location.href='/ver-anuncio.html?id=${anuncio.id}'">
                    <div style="width: 100%; height: 180px; overflow: hidden; border-radius: 4px; display: flex; align-items: center; justify-content: center; background-color: #f9f9f9;">
                        <img src="${rutaImagen}" alt="${anuncio.titulo}" style="max-width: 100%; max-height: 100%; object-fit: cover;"/>
                    </div>
                    <h3 style="margin: 10px 0 5px 0; font-size: 1.1rem; color: #333;">${anuncio.titulo}</h3>
                    <p style="margin: 0 0 5px 0; font-size: 1.2rem; color: #2ecc71;"><strong>${anuncio.precio} €</strong></p>
                    <small style="color: #7f8c8d; margin-top: auto;">Publicado el: ${new Date(fecha).toLocaleDateString()}</small>
                </div>
            `;
            
            listaAnuncios.appendChild(card);
        });
    }
});