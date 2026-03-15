import { renderNavbar } from '../components/navBar.js';
import { getAnuncioById } from '../services/anuncios.js';
import { toggleFavorito, checkIfFavorito } from '../services/favoritos.js'; 

/* 
   PANTALLA: VER DETALLE DEL ANUNCIO

   Este script se encarga de mostrar la vista pública de un producto.
   Lee el ID de la URL, pide los datos completos al backend y los inyecta en el DOM.
   Además, incluye lógica interactiva para la galería de imágenes 
   y la gestión en tiempo real del botón de "Añadir a Favoritos".
*/

document.addEventListener('DOMContentLoaded', async () => {
    
    // Cargamos el menú de navegación superior
    renderNavbar();

    // Extraemos el id de la URL
    // Extraemos el ID del anuncio que el usuario quiere ver directamente de la barra de direcciones
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

        // INYECCIÓN DE DATOS BÁSICOS
        // Usamos operadores ternarios '?' por si algún dato relacional 
        // fallara o fuera nulo desde la base de datos, evitando que la página colapse.
        document.getElementById('ad-titulo').textContent = anuncio.titulo;
        document.getElementById('ad-precio').textContent = anuncio.precio;
        document.getElementById('ad-descripcion').textContent = anuncio.descripcion;
        document.getElementById('ad-localidad').textContent = anuncio.localidad ? anuncio.localidad.nombre : 'Ubicación desconocida';
        document.getElementById('ad-fecha').textContent = new Date(anuncio.fecha_publi).toLocaleDateString('es-ES');
        document.getElementById('link-vendedor').textContent = anuncio.user ? anuncio.user.name : "Usuario Anónimo";
        
        const spanCategoria = document.getElementById('ad-categoria');
        const spanSubcategoria = document.getElementById('ad-subcategoria');

        if (anuncio.subcategoria) {
            spanSubcategoria.textContent = anuncio.subcategoria.nombre;
            // Gracias a la subconsulta SQL de nuestro DAO, podemos acceder al padre
            if (anuncio.subcategoria.categoria) {
                spanCategoria.textContent = anuncio.subcategoria.categoria.nombre;
            } else {
                spanCategoria.textContent = 'Categoría Principal';
            }
        } else {
            spanSubcategoria.textContent = 'Sin subcategoría';
            spanCategoria.textContent = 'Sin categoría';
        }

        // LÓGICA DE LA GALERÍA DE IMÁGENES
        const imgPrincipal = document.getElementById('img-principal');
        const galeriaMiniaturas = document.getElementById('galeria-miniaturas');

        const imagenes = anuncio.imagenes;

        // url de donde se guardan las fotos en Laravel
        const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';

        if (imagenes && imagenes.length > 0) {
            
            // FUNCIÓN AUXILIAR DE RUTAS: 
            function getUrlFoto(img) {
                return URL_BACKEND_STORAGE + img.url;
            }
            // ----------------------------------------------

            // Cargamos la primera foto en el visor grande por defecto
            imgPrincipal.src = getUrlFoto(imagenes[0]);

            // Iteramos para crear el carrusel de miniaturas
            imagenes.forEach((imagen, index) => {
                const imgMini = document.createElement('img');
                
                imgMini.src = getUrlFoto(imagen);
                imgMini.className = 'miniatura';
                
                if (index === 0) {
                    imgMini.classList.add('activa');
                }

                // Al hacer clic en una miniatura, su ruta se 
                // traslada a la imagen principal y actualizamos la clase CSS 'activa'
                imgMini.addEventListener('click', () => {
                    imgPrincipal.src = getUrlFoto(imagen);
                    document.querySelectorAll('.miniatura').forEach(m => m.classList.remove('activa'));
                    imgMini.classList.add('activa');
                });

                galeriaMiniaturas.appendChild(imgMini);
            });

        } else {
            // Imagen de relleno por si el usuario no subió ninguna foto
            imgPrincipal.src = URL_BACKEND_STORAGE + 'anuncios/default.jpg';
        }

        // LÓGICA DEL BOTÓN DE FAVORITOS
        const btnFavorito = document.getElementById('btn-favorito');
        const token = localStorage.getItem('relink_token');

        // Si el usuario es anónimo, el botón funciona como un acceso directo al Login
        if (!token) {
            btnFavorito.innerHTML = '<i class="fa-regular fa-heart"></i> Inicia sesión para guardar';
            btnFavorito.addEventListener('click', () => {
                window.location.href = '/login.html';
            });
        } 
        else {
            
            // SI ESTÁ LOGUEADO: 
            // Primero le preguntamos a la API si ya tenía este anuncio guardado 
            // para pintar el corazón relleno o vacío desde el minuto cero.
            try {
                const respuesta = await checkIfFavorito(anuncioId);

                if (respuesta.is_favorito === true) {
                    btnFavorito.innerHTML = '<i class="fa-solid fa-heart"></i> Quitar de Favoritos';
                }
            } catch (error) {
                console.error("No se pudo comprobar el estado del favorito:", error);
            }

            // Evento del Toggle (Interruptor)
            btnFavorito.addEventListener('click', async () => {
                try {
                    btnFavorito.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
                    btnFavorito.disabled = true;

                    const respuesta = await toggleFavorito(anuncioId);

                    // Evaluamos la respuesta del backend para cambiar el texto e icono
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
        // Error global 404: Si el ID de la URL no existe o el anuncio ha sido borrado
        console.error("Error al cargar el anuncio:", error);
        document.getElementById('mensaje-estado').innerHTML = '<span style="color: red;">El anuncio no existe o ha sido borrado.</span>';
    }

});