import { renderNavbar } from '../components/Navbar.js';
import { getAnuncios } from '../services/anuncios.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Pintamos el menú superior
    renderNavbar();

    // 2. Cargamos los anuncios
    cargarAnuncios();
});

async function cargarAnuncios() {
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

        // Recorremos los anuncios y creamos el HTML de cada tarjeta
        anuncios.forEach(anuncio => {
            // Solo mostramos los que estén publicados
            if (anuncio.estado === 'publicado') {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'anuncio-card';
                tarjeta.style = 'border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px;';
                
                tarjeta.innerHTML = `
                    <h3>${anuncio.titulo}</h3>
                    <p>${anuncio.precio} €</p>
                    <p>${anuncio.descripcion}</p>
                    <small>Publicado el: ${new Date(anuncio.fecha_publi).toLocaleDateString()}</small>
                    <br>
                    <button onclick="verDetalle(${anuncio.id})" style="margin-top: 10px;">Ver más</button>
                `;
                contenedor.appendChild(tarjeta);
            }
        });

    } catch (error) {
        contenedor.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}