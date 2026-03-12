import { renderNavbar } from '../components/Navbar.js';
import { getAnuncioById } from '../services/anuncios.js';
import { toggleFavorito, checkIfFavorito } from '../services/favoritos.js'; 

document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar();

    const parametros = new URLSearchParams(window.location.search);
    const anuncioId = parametros.get('id');

    if (!anuncioId) {
        document.getElementById('mensaje-estado').innerHTML = '<span style="color: red;">Error: No se ha especificado ningún anuncio.</span>';
        return;
    }

    try {
        const respuesta = await getAnuncioById(anuncioId);
        const anuncio = respuesta.datos; 

        document.getElementById('mensaje-estado').style.display = 'none';
        document.getElementById('contenido-anuncio').style.display = 'flex';

        // Rellenar textos
        document.getElementById('ad-titulo').textContent = anuncio.titulo;
        document.getElementById('ad-precio').textContent = anuncio.precio;
        document.getElementById('ad-descripcion').textContent = anuncio.descripcion;
<<<<<<< HEAD

        // Si Laravel nos devuelve las relaciones de categoría y localidad, las pintamos. Si no, ponemos algo por defecto.
        document.getElementById('ad-categoria').textContent = anuncio.subcategoria ? anuncio.subcategoria.nombre : 'Sin subcategoría';
        document.getElementById('ad-localidad').textContent = anuncio.localidad ? `${anuncio.localidad.nombre}` : 'Ubicación desconocida';
=======
        document.getElementById('ad-categoria').textContent = anuncio.categoria ? anuncio.categoria.nombre : 'Sin categoría';
        document.getElementById('ad-localidad').textContent = anuncio.localidad ? anuncio.localidad.nombre : 'Ubicación desconocida';
        document.getElementById('ad-fecha').textContent = new Date(anuncio.fecha_publi).toLocaleDateString('es-ES');
        document.getElementById('link-vendedor').textContent = anuncio.user ? anuncio.user.name : "Usuario Anónimo";
>>>>>>> 56e4cc946a021ec88bf1d5ed04c517ff21d0e917

        // Galería de fotos
        const imgPrincipal = document.getElementById('img-principal');
        const galeriaMiniaturas = document.getElementById('galeria-miniaturas');
        const URL_STORAGE = 'http://localhost:5500/storage/';

        if (anuncio.imagenes && anuncio.imagenes.length > 0) {
            imgPrincipal.src = URL_STORAGE + anuncio.imagenes[0].url;

<<<<<<< HEAD
        // url de donde se guardan las fotos en Laravel
        const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';

        if (imagenes && imagenes.length > 0) {
            
            // Función para traducir la imagen a la ruta
            function getUrlFoto(img) {
                let ruta = img.url;

                if (ruta.startsWith('http')) {
                    return ruta; 
                } else {
                    let rutaCompleta = URL_BACKEND_STORAGE + ruta;
                    return rutaCompleta;
                }
            }
            // ----------------------------------------------

            // Ponemos la primera imagen grande por defecto
            imgPrincipal.src = getUrlFoto(imagenes[0]);

            // Creamos las miniaturas
            imagenes.forEach((imagen, index) => {
=======
            anuncio.imagenes.forEach((imagen, index) => {
>>>>>>> 56e4cc946a021ec88bf1d5ed04c517ff21d0e917
                const imgMini = document.createElement('img');
                imgMini.src = URL_STORAGE + imagen.url;
                imgMini.className = 'miniatura' + (index === 0 ? ' activa' : '');
                imgMini.style = "width: 80px; height: 60px; object-fit: cover; margin-right: 10px; cursor: pointer; border: 2px solid #ccc;";

                imgMini.addEventListener('click', () => {
                    imgPrincipal.src = URL_STORAGE + imagen.url;
                    document.querySelectorAll('.miniatura').forEach(m => m.style.borderColor = '#ccc');
                    imgMini.style.borderColor = '#007bff';
                });

                galeriaMiniaturas.appendChild(imgMini);
            });
        } else {
<<<<<<< HEAD
            // Si el anuncio se publicó sin fotos, ponemos una de relleno
            imgPrincipal.src = URL_BACKEND_STORAGE + '/anucios/default.jpg';
=======
            imgPrincipal.src = 'https://placehold.co/800x400?text=Sin+Imagen';
>>>>>>> 56e4cc946a021ec88bf1d5ed04c517ff21d0e917
        }

        // Lógica de Favoritos
        const btnFavorito = document.getElementById('btn-favorito');
        const token = localStorage.getItem('relink_token');

        if (token && btnFavorito) {
            const favStatus = await checkIfFavorito(anuncioId);
            if (favStatus.is_favorito) {
                btnFavorito.innerHTML = '<i class="fa-solid fa-heart"></i> Quitar de Favoritos';
            }

            btnFavorito.addEventListener('click', async () => {
                const res = await toggleFavorito(anuncioId);
                btnFavorito.innerHTML = res.message === 'Añadido a favoritos' 
                    ? '<i class="fa-solid fa-heart"></i> Quitar de Favoritos' 
                    : '<i class="fa-regular fa-heart"></i> Guardar en Favoritos';
            });
        }

    } catch (error) {
        console.error(error);
        document.getElementById('mensaje-estado').innerHTML = '<span style="color: red;">El anuncio no existe.</span>';
    }
});