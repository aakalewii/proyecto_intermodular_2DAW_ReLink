import { renderNavbar } from '../components/navBar.js';
import { getMisFavoritos } from '../services/favoritos.js';
import { forzarCierreSesion, STORAGE_URL, verificarAccesoUsuario } from '../services/auth.js';

/*
   PANTALLA: MIS FAVORITOS

   Este script controla la vista privada donde el usuario puede ver los anuncios 
   que ha guardado previamente. Reutiliza la lógica visual de las tarjetas 
   del tablón principal, pero consume el endpoint protegido de favoritos.
*/

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();

    // Redirigir si no está logueado
    const token = localStorage.getItem('relink_token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Lanzamos la carga de datos
    cargarFavoritos();
});

async function cargarFavoritos() {
    const contenedor = document.getElementById('lista-anuncios');
    contenedor.innerHTML = '<p>Cargando tus favoritos...</p>';

    const puedePasar = await verificarAccesoUsuario();

    if(puedePasar){

        try {
            // Pedimos al backend la lista de anuncios que este usuario tiene guardados
            const respuesta = await getMisFavoritos();

            if (respuesta.status === 401) {
                forzarCierreSesion();
            return; 
            }
            
            // Extraemos el array de anuncios que viene dentro de 'datos'
            const anuncios = respuesta.datos;
            
            // Limpiamos el texto de "Cargando..."
            contenedor.innerHTML = '';

            // Si la API nos devuelve un array vacío, mostramos un mensaje amigable
            if (!anuncios || anuncios.length === 0) {
                contenedor.innerHTML = '<p>Aún no has guardado ningún anuncio en favoritos.</p>';
                return;
            }

            // Ruta base donde Laravel guarda los archivos públicos
            //const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';
            const URL_BACKEND_STORAGE = STORAGE_URL;

            // RENDERIZADO DE LAS TARJETAS
            // Recorremos el array y creamos el HTML dinámico para cada anuncio, 
            // manteniendo el mismo diseño que en la página principal (main.js).
            anuncios.forEach(anuncio => {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'anuncio-card';
                tarjeta.style = 'border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px;';
                // Evento para navegar al detalle del anuncio al hacer clic
                tarjeta.onclick = () => {
                    window.location.href = `/ver-anuncio.html?id=${anuncio.id}`;
                };

                let rutaImagen;

                // Lógica para mostrar la foto principal o una foto por defecto si no tiene
                if (!anuncio.foto_principal) {
                    rutaImagen = `${URL_BACKEND_STORAGE}anuncios/default1.jpg`;
                } else {
                    rutaImagen = `${URL_BACKEND_STORAGE}${anuncio.foto_principal}`;
                }

                // Inyectamos la estructura HTML de la tarjeta, ajustando la imagen
                tarjeta.innerHTML = `
                    <div>
                        <img src="${rutaImagen}" alt="${anuncio.titulo}"/>
                    </div>
                    <h3>${anuncio.titulo}</h3>
                    <p><strong>${anuncio.precio} €</strong></p>
                    <small>Publicado el: ${new Date(anuncio.fecha_publi).toLocaleDateString()}</small>
                `;
                contenedor.appendChild(tarjeta);
            });

        } catch (error) {
            console.error("Error crítico capturado en favoritos:", error);
            forzarCierreSesion();
        }
    }
}