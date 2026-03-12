import { renderNavbar } from '../components/navBar.js';
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
        document.getElementById('ad-localidad').textContent = anuncio.localidad ? anuncio.localidad.nombre : 'Ubicación desconocida';
        document.getElementById('ad-fecha').textContent = new Date(anuncio.fecha_publi).toLocaleDateString('es-ES');
        document.getElementById('link-vendedor').textContent = anuncio.user ? anuncio.user.name : "Usuario Anónimo";

        // --- LÓGICA DE CATEGORÍA Y SUBCATEGORÍA ---
        const spanCategoria = document.getElementById('ad-categoria');
        const spanSubcategoria = document.getElementById('ad-subcategoria');

        if (anuncio.subcategoria) {
            spanSubcategoria.textContent = anuncio.subcategoria.nombre;
            // Si tu backend devuelve la categoría anidada dentro de la subcategoría:
            if (anuncio.subcategoria.categoria) {
                spanCategoria.textContent = anuncio.subcategoria.categoria.nombre;
            } else {
                spanCategoria.textContent = 'Categoría Principal';
            }
        } else {
            spanSubcategoria.textContent = 'Sin subcategoría';
            spanCategoria.textContent = 'Sin categoría';
        }

        // Galería de fotos
        const imgPrincipal = document.getElementById('img-principal');
        const galeriaMiniaturas = document.getElementById('galeria-miniaturas');
        const URL_STORAGE = 'http://localhost:5500/storage/';

        if (anuncio.imagenes && anuncio.imagenes.length > 0) {
            imgPrincipal.src = URL_STORAGE + anuncio.imagenes[0].url;

            anuncio.imagenes.forEach((imagen, index) => {
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
            imgPrincipal.src = 'https://placehold.co/800x400?text=Sin+Imagen';
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