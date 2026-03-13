import { renderNavbar } from '../components/navBar.js';
import { getAnuncioById } from '../services/anuncios.js';
import { toggleFavorito, checkIfFavorito } from '../services/favoritos.js'; 

document.addEventListener('DOMContentLoaded', async () => {
    
    // Cargamos el menú de navegación superior
    renderNavbar();

    // Extraemos el id de la url
    const parametros = new URLSearchParams(window.location.search);
    const anuncioId = parametros.get('id');

    // Si alguien entra a ver-anuncio.html a secas sin ID, le mostramos un error
    if (!anuncioId) {
        document.getElementById('mensaje-estado').innerHTML = '<span style="color: red;">Error: No se ha especificado ningún anuncio para ver.</span>';
        return;
    }

    try {
        // Le pedimos el anuncio al BackEnd
        const respuesta = await getAnuncioById(anuncioId);
        const anuncio = respuesta.datos; 

        // Ocultamos el texto de "Cargando..." y mostramos el diseño a dos columnas
        document.getElementById('mensaje-estado').style.display = 'none';
        document.getElementById('contenido-anuncio').style.display = 'flex';

        // --- RELLENAMOS CAMPOS ---
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

        const imagenes = anuncio.imagenes;

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
                const imgMini = document.createElement('img');
                
                imgMini.src = getUrlFoto(imagen);
                imgMini.className = 'miniatura';
                
                if (index === 0) {
                    imgMini.classList.add('activa');
                }

                // Al hacer clic cambiamos la imagen grande por otra
                imgMini.addEventListener('click', () => {
                    imgPrincipal.src = getUrlFoto(imagen);
                    document.querySelectorAll('.miniatura').forEach(m => m.classList.remove('activa'));
                    imgMini.classList.add('activa');
                });

                galeriaMiniaturas.appendChild(imgMini);
            });

        } else {
            // Si el anuncio se publicó sin fotos, ponemos una de relleno
            imgPrincipal.src = URL_BACKEND_STORAGE + 'anuncios/default.jpg';
        }

        // --- LÓGICA DEL BOTÓN DE FAVORITOS ---
        const btnFavorito = document.getElementById('btn-favorito');
        const token = localStorage.getItem('relink_token');

        if (!token) {
            btnFavorito.innerHTML = '<i class="fa-regular fa-heart"></i> Inicia sesión para guardar';
            btnFavorito.addEventListener('click', () => {
                window.location.href = '/login.html';
            });
        } 
        else {
            
            // COMPROBAR EL ESTADO INICIAL AL CARGAR LA PÁGINA
            try {
                // Le pasamos el ID de la URL directo al backend
                const respuesta = await checkIfFavorito(anuncioId);

                // Si Laravel dice que es true, lo pintamos de rojo
                if (respuesta.is_favorito === true) {
                    btnFavorito.innerHTML = '<i class="fa-solid fa-heart"></i> Quitar de Favoritos';
                }
            } catch (error) {
                console.error("No se pudo comprobar el estado del favorito:", error);
            }

            btnFavorito.addEventListener('click', async () => {
                try {
                    btnFavorito.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
                    btnFavorito.disabled = true;

                    const respuesta = await toggleFavorito(anuncioId);
                    
                    if (respuesta.message === 'Añadido a favoritos') {
                        btnFavorito.innerHTML = '<i class="fa-solid fa-heart"></i> Quitar de Favoritos';
                    } 
                    else {
                        btnFavorito.innerHTML = '<i class="fa-regular fa-heart"></i> Guardar en Favoritos';
                    }

                    btnFavorito.disabled = false;

                } catch (error) {
                    console.error(error);
                    alert("Hubo un problema al guardar el favorito.");
                    btnFavorito.disabled = false;
                }
            });
        }

    } catch (error) {
        console.error("Error al cargar el anuncio:", error);
        document.getElementById('mensaje-estado').innerHTML = '<span style="color: red;">El anuncio no existe o ha sido borrado.</span>';
    }

});