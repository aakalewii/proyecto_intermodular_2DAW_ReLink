import { renderNavbar } from '../components/navBar.js';
import { getAnuncios } from '../services/anuncios.js';

/*
   PANTALLA: TABLÓN PRINCIPAL (HOME)

   Este script es el punto de entrada de la aplicación. Se encarga de cargar 
   el menú de navegación y pedir al backend todos los anuncios públicos para 
   mostrarlos en forma de cuadrícula dinámica de tarjetas.
*/

document.addEventListener('DOMContentLoaded', () => {
    // Pintamos el menú superior
    renderNavbar();
    // Disparamos la petición a la base de datos para cargar el catálogo
    cargarAnuncios();
    
});

async function cargarAnuncios() {

// Buscamos el contenedor vacío que dejamos preparado en el HTML
    const contenedor = document.getElementById('lista-anuncios');

    contenedor.innerHTML = '<p>Cargando anuncios...</p>';

    try {
        // Llamamos a nuestra API a través del servicio
        const anuncios = await getAnuncios();
        
        // Limpiamos el texto de "Cargando..."
        contenedor.innerHTML = '';

        // Si el array está vacío, avisamos al usuario amigablemente
        if (anuncios.length === 0) {
            contenedor.innerHTML = '<p>No hay anuncios publicados todavía.</p>';
            return;
        }

        const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';

        // RENDERIZADO DEL CATÁLOGO
        // Recorremos el array de anuncios que nos devolvió Laravel
        anuncios.forEach(anuncio => {
            // Solo mostramos los que estén publicados
            if (anuncio.estado === 'publicado') {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'anuncio-card';
                tarjeta.style = 'border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px;';

                // Evento click: Convertimos toda la tarjeta en un enlace hacia la vista detalle
                tarjeta.onclick = () => {
                    window.location.href = `ver-anuncio.html?id=${anuncio.id}`;
                };

                let rutaImagen;

                // Lógica de fallback: Si no tiene foto, le asignamos la imagen por defecto
                if (!anuncio.foto_principal) {
                    rutaImagen = `${URL_BACKEND_STORAGE}anuncios/default1.jpg`;
                } else {
                    // Si tiene, construimos la ruta absoluta hacia el storage de Laravel
                    rutaImagen = `${URL_BACKEND_STORAGE}${anuncio.foto_principal}`;
                }

                tarjeta.innerHTML = `
                    <div>
                        <img src="${rutaImagen}" alt="${anuncio.titulo}"/>
                    </div>
                    <h3>${anuncio.titulo}</h3>
                    <p>${anuncio.precio} €</p>
                    <small>Publicado el: ${new Date(anuncio.fecha_publi).toLocaleDateString()}</small>
                `;
                contenedor.appendChild(tarjeta);
            }
        });

    } catch (error) {
        contenedor.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}