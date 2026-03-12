import { renderNavbar } from '../components/Navbar.js';
import { getMisFavoritos } from '../services/favoritos.js';

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();

    // Redirigir si no está logueado
    const token = localStorage.getItem('relink_token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    cargarFavoritos();
});

async function cargarFavoritos() {
    const contenedor = document.getElementById('lista-anuncios');
    contenedor.innerHTML = '<p>Cargando tus favoritos...</p>';

    try {
        const respuesta = await getMisFavoritos();
        
        const anuncios = respuesta.datos;
        
        contenedor.innerHTML = '';

        if (!anuncios || anuncios.length === 0) {
            contenedor.innerHTML = '<p>Aún no has guardado ningún anuncio en favoritos.</p>';
            return;
        }

        // Pintamos las tarjetas igual que en el index
        anuncios.forEach(anuncio => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'anuncio-card';
            tarjeta.style = 'border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px;';
            
            tarjeta.innerHTML = `
                <h3>${anuncio.titulo}</h3>
                <p><strong>${anuncio.precio} €</strong></p>
                <p>${anuncio.descripcion}</p>
                <small>Publicado el: ${new Date(anuncio.fecha_publi).toLocaleDateString()}</small>
                <br>
                <button onclick="window.location.href='/ver-anuncio.html?id=${anuncio.id}'">
                    Ver detalle
                </button>
            `;
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        contenedor.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}