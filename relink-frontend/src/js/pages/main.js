import { renderNavbar } from '../components/navBar.js';
import { getAnuncios, buscarAnunciosPorTitulo } from '../services/anuncios.js';

document.addEventListener('DOMContentLoaded', () => {
    // Pintamos el menú superior
    renderNavbar();

    // Leemos la URL para ver si venimos de una búsqueda
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    if (searchQuery) {

        const searchInput = document.getElementById('navbarSearchInput');
        searchInput.value = searchQuery;
        // 1. Ejecutamos la búsqueda filtrada
        realizarBusqueda(searchQuery);
    } else {
        // 2. Si no hay búsqueda, cargamos todo normal
        cargarAnuncios();
    }
});

async function realizarBusqueda(termino) {
    const cancelButton = document.getElementById('navbarCancelBtn');
    cancelButton.style.display = 'block';
    cancelButton.addEventListener('click', cargarAnuncios);

    const contenedor = document.getElementById('lista-anuncios');
    contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Buscando...</p>';

    try {
        const anuncios = await buscarAnunciosPorTitulo(termino);
        // Limpiamos el texto de "Cargando..."
        contenedor.innerHTML = '';

        // Si no hay anuncios
        if (anuncios.length === 0) {
            contenedor.innerHTML = '<p>No hay anuncios publicados todavía.</p>';
            return;
        }

        const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';

        // Recorremos los anuncios y creamos el HTML de cada tarjeta
        anuncios.forEach(anuncio => {
            // Solo mostramos los que estén publicados
            if (anuncio.estado === 'publicado') {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'anuncio-card';
                tarjeta.style = 'border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px;';

                tarjeta.onclick = () => {
                    window.location.href = `ver-anuncio.html?id=${anuncio.id}`;
                };

                let rutaImagen;

                if (!anuncio.foto_principal) {
                    rutaImagen = `${URL_BACKEND_STORAGE}anuncios/default1.jpg`;
                } else {
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
        contenedor.innerHTML = `<p style="color: red; grid-column: 1/-1;">Error: ${error.message}</p>`;
    }
}

async function cargarAnuncios() {
    document.getElementById('navbarSearchInput').value = '';
    // Busca un contenedor en tu index.html que se llame id="lista-anuncios"
    const contenedor = document.getElementById('lista-anuncios');

    contenedor.innerHTML = '<p>Cargando anuncios...</p>';

    try {
        // Llamamos a nuestra API
        const anuncios = await getAnuncios();
        
        // Limpiamos el texto de "Cargando..."
        contenedor.innerHTML = '';

        // Si no hay anuncios
        if (anuncios.length === 0) {
            contenedor.innerHTML = '<p>No hay anuncios publicados todavía.</p>';
            return;
        }

        const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';

        // Recorremos los anuncios y creamos el HTML de cada tarjeta
        anuncios.forEach(anuncio => {
            // Solo mostramos los que estén publicados
            if (anuncio.estado === 'publicado') {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'anuncio-card';
                tarjeta.style = 'border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px;';

                tarjeta.onclick = () => {
                    window.location.href = `ver-anuncio.html?id=${anuncio.id}`;
                };

                let rutaImagen;

                if (!anuncio.foto_principal) {
                    rutaImagen = `${URL_BACKEND_STORAGE}anuncios/default1.jpg`;
                } else {
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