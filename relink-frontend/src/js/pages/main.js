import { renderNavbar } from '../components/navBar.js';
import { getAnuncios, marcarNoMeInteresa } from '../services/anuncios.js';
import { getAnunciosSwipe } from '../services/swipe.js';
import { toggleFavorito } from '../services/favoritos.js';
import { misDatos } from '../services/auth.js';
import { getCategorias, getSubcategoriasPorCategoria } from '../services/categorias.js'; 
import { getLocalidades } from '../services/ubicaciones.js';
import { STORAGE_URL } from '../services/auth.js';

/*
   PANTALLA: TABLÓN PRINCIPAL (HOME)

   Este script es el punto de entrada de la aplicación. Se encarga de cargar 
   el menú de navegación y pedir al backend todos los anuncios públicos para 
   mostrarlos en forma de cuadrícula dinámica de tarjetas.
*/

// --- VARIABLES GLOBALES ---
let anunciosPila = [];
let indiceActual = 0;
let usuarioLogueado = null;
//const URL_BACKEND_STORAGE = STORAGE_URL;
const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';

document.addEventListener('DOMContentLoaded', async () => {
    // Pintamos el menú superior
    renderNavbar();   
    // Inyectamos el buscador básico en la página
    crearBarraBusqueda();
    // Cargamos los datos de los filtros
    inicializarFiltros();

    // Identificar al usuario silenciosamente para no mostrarle sus propios anuncios en Swipe
    const token = localStorage.getItem('relink_token');
    if (token) {
        try { 
            usuarioLogueado = await misDatos(); 
        }
         catch (e) { 
            console.warn("Usuario anónimo."); 
        }
    }

    // Disparamos la petición a la base de datos para cargar el catálogo
    cargarAnuncios();
    
    // Escuchador del formulario Swipe
    const formFiltros = document.getElementById('form-filtros-swipe');
    if (formFiltros) formFiltros.addEventListener('submit', manejarBusquedaSwipe);
});

// Función para inyectar la barra de búsqueda
function crearBarraBusqueda() {
    const contenedorLista = document.getElementById('lista-anuncios');
    
    const divBuscador = document.createElement('div');
    divBuscador.style = "margin-bottom: 20px; text-align: center;";
    
    // Añadidas clases genéricas, bordes redondeados y transiciones a los botones/inputs
    divBuscador.innerHTML = `
        <input type="text" id="input-buscador" placeholder="Buscar anuncios..." style="padding: 10px 15px; width: 60%; max-width: 400px; border: 2px solid #ccc; border-radius: 20px; outline: none; transition: border-color 0.3s;">
        <button id="btn-buscar" style="padding: 10px 20px; cursor: pointer; border-radius: 20px; border: none; background-color: #000102ff; color: white; transition: background-color 0.3s; font-weight: bold; margin-left: 5px;"><i class="fa-solid fa-magnifying-glass"></i></button>
        <button id="btn-limpiar" style="padding: 10px 20px; cursor: pointer; display: none; border-radius: 20px; border: 1px solid #ccc; background-color: #f8f9fa; transition: background-color 0.3s; margin-left: 5px;"><i class="fa-solid fa-broom"></i></button>
    `;
    
    // Lo insertamos justo antes de la lista de anuncios
    contenedorLista.parentNode.insertBefore(divBuscador, contenedorLista);

    const btnBuscar = document.getElementById('btn-buscar');
    const inputBuscador = document.getElementById('input-buscador');
    const btnLimpiar = document.getElementById('btn-limpiar');

    // Efectos visuales al pasar el ratón o hacer click (hover y focus)
    inputBuscador.addEventListener('focus', () => inputBuscador.style.borderColor = '#000102ff');
    inputBuscador.addEventListener('blur', () => inputBuscador.style.borderColor = '#ccc');

    btnBuscar.addEventListener('mouseenter', () => btnBuscar.style.backgroundColor = '#333');
    btnBuscar.addEventListener('mouseleave', () => btnBuscar.style.backgroundColor = '#000102ff');

    btnLimpiar.addEventListener('mouseenter', () => btnLimpiar.style.backgroundColor = '#e2e6ea');
    btnLimpiar.addEventListener('mouseleave', () => btnLimpiar.style.backgroundColor = '#f8f9fa');

    // Evento al hacer clic en buscar
    btnBuscar.addEventListener('click', () => {
        const termino = inputBuscador.value.trim();
        if (termino !== '') {
            btnLimpiar.style.display = 'inline-block';
            cargarAnuncios(termino); // Llamamos pasándole la palabra
        }
    });

    // Evento para poder buscar pulsando "Enter"
    inputBuscador.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnBuscar.click();
        }
    });

    // Evento para limpiar la búsqueda y ver todo otra vez
    btnLimpiar.addEventListener('click', () => {
        inputBuscador.value = '';
        btnLimpiar.style.display = 'none';
        cargarAnuncios(); // Llamamos sin pasarle nada para ver todos
    });
}

async function cargarAnuncios(busqueda = '') {

    // Ocultamos la zona Swipe y mostrar el catálogo normal
    document.getElementById('contenedor-swipe').style.display = 'none';
    // Buscamos el contenedor vacío que dejamos preparado en el HTML
    const contenedor = document.getElementById('lista-anuncios');

    contenedor.innerHTML = '<p>Cargando anuncios...</p>';

    try {
        // Llamamos a nuestra API pasándole lo que el usuario ha buscado
        const anuncios = await getAnuncios(busqueda);
        
        // Limpiamos el texto de "Cargando..."
        contenedor.innerHTML = '';

        // Si el array está vacío, avisamos al usuario amigablemente
        if (anuncios.length === 0) {
            // Diferenciamos si estaba buscando algo o si simplemente no hay anuncios en la BD
            if (busqueda !== '') {
                contenedor.innerHTML = `<p>No se encontraron resultados para "${busqueda}".</p>`;
            } else {
                contenedor.innerHTML = '<p>No hay anuncios publicados todavía.</p>';
            }
            return;
        }

        // RENDERIZADO DEL CATÁLOGO
        // Recorremos el array de anuncios que nos devolvió Laravel
        anuncios.forEach(anuncio => {
            // Solo mostramos los que estén publicados
            if (anuncio.estado === 'publicado') {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'anuncio-card';
                // 'transition' para animar el hover
                tarjeta.style = 'border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; background-color: white;';

                // Efecto Hover (Levantar tarjeta y poner sombra)
                tarjeta.addEventListener('mouseenter', () => {
                    tarjeta.style.transform = 'translateY(-4px)';
                    tarjeta.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                });
                tarjeta.addEventListener('mouseleave', () => {
                    tarjeta.style.transform = 'translateY(0)';
                    tarjeta.style.boxShadow = 'none';
                });

                // Convertimos toda la tarjeta en un enlace hacia la vista detalle
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
                        <img src="${rutaImagen}" alt="${anuncio.titulo}" style="max-width: 100%; border-radius: 4px;"/>
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

async function manejarBusquedaSwipe(e) {
    e.preventDefault();

    const filtros = {
        categoria_id: document.getElementById('select-categoria').value,
        subcategoria_id: document.getElementById('select-subcategoria').value,
        municipio_id: document.getElementById('select-municipio').value,
        precio_min: document.getElementById('precio-min').value,
        precio_max: document.getElementById('precio-max').value,
    };

    try {
        const datos = await getAnunciosSwipe(filtros);
        anunciosPila = datos;
        indiceActual = 0;
            
        document.getElementById('lista-anuncios').style.display = 'none';
        document.getElementById('contenedor-swipe').style.display = 'block';
        document.getElementById('titulo-seccion').textContent = "Modo Swipe: Encuentra tu match";

        document.getElementById('btn-buscar').style.display = 'none';
        document.getElementById('input-buscador').style.display = 'none';
            
        renderizarCartaSwipe();

    } catch (error) {
        alert(error.message);
    }
}

function renderizarCartaSwipe() {
    const contenedorSwipe = document.getElementById('contenedor-swipe');
    const divCarta = contenedorSwipe.querySelector('.swipe-card'); 
    
    // CASO A: Se acabaron las cartas
    if (anunciosPila.length === 0 || indiceActual >= anunciosPila.length) {
        divCarta.style.display = 'none'; 
        let msgFin = document.getElementById('msg-fin-swipe');
        if (!msgFin) {
            msgFin = document.createElement('h3');
            msgFin.id = 'msg-fin-swipe';
            msgFin.style = "text-align: center; color: #666; margin-top: 30px;";
            contenedorSwipe.appendChild(msgFin);
        }
        msgFin.textContent = "No hay más anuncios con estos filtros. ¡Prueba otra búsqueda!";
        msgFin.style.display = 'block';
        return;
    }

    // CASO B: Hay cartas
    divCarta.style.display = 'flex';
    const msgFin = document.getElementById('msg-fin-swipe');
    if (msgFin) msgFin.style.display = 'none';

    const anuncio = anunciosPila[indiceActual];

    if (usuarioLogueado && anuncio.user && usuarioLogueado.id === anuncio.user.id) {
        indiceActual++;
        return renderizarCartaSwipe();
    }

    // TEXTOS (Blindados)
    document.getElementById('swipe-titulo').textContent = anuncio.titulo || 'Sin título';
    document.getElementById('swipe-precio').textContent = (anuncio.precio || 0) + ' €';
    document.getElementById('swipe-localidad').textContent = anuncio.ubicacion ? anuncio.ubicacion.nombre : 'España';
    document.getElementById('swipe-descripcion').textContent = anuncio.descripcion || '';

    // LA IMAGEN PRINCIPAL Y GALERÍA
    const imgMain = document.getElementById('swipe-img-principal');
    const cajaImagenSwipe = imgMain.parentElement;

    cajaImagenSwipe.style.display = 'flex';
    cajaImagenSwipe.style.flexDirection = 'column';
    cajaImagenSwipe.style.alignItems = 'center';

    const imagenes = anuncio.imagenes && anuncio.imagenes.length > 0 ? anuncio.imagenes : [{ url: 'anuncios/default1.jpg' }];
    
    // Cargamos la imagen principal del anuncio actual
    imgMain.src = `${URL_BACKEND_STORAGE}${imagenes[0].url}`;

    // Buscamos o creamos un contenedor para las miniaturas
    let galeriaSwipe = document.getElementById('swipe-galeria-miniaturas');
    if (!galeriaSwipe) {
        galeriaSwipe = document.createElement('div');
        galeriaSwipe.id = 'swipe-galeria-miniaturas';
        
        // Forzamos orden horizontal para las miniaturas y ancho completo
        galeriaSwipe.style.cssText = 'display: flex; flex-direction: row; justify-content: center; gap: 10px; margin-top: 15px; flex-wrap: wrap; width: 100%;';
        
        // Lo metemos dentro de la caja padre, justo debajo de la imagen
        cajaImagenSwipe.appendChild(galeriaSwipe); 
    }

    // Vaciamos las miniaturas del anuncio anterior
    galeriaSwipe.innerHTML = '';

    // Si el anuncio tiene más de 1 foto, creamos las miniaturas
    if (imagenes.length > 1) {
        galeriaSwipe.style.display = 'flex';

        imagenes.forEach((imagen, index) => {
            const imgMini = document.createElement('img');
            imgMini.src = `${URL_BACKEND_STORAGE}${imagen.url}`;
            
            imgMini.style.width = '50px';
            imgMini.style.height = '50px';
            imgMini.style.objectFit = 'cover';
            imgMini.style.borderRadius = '8px';
            imgMini.style.cursor = 'pointer';
            imgMini.style.transition = 'all 0.2s ease';
            imgMini.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            
            // Marcamos la primera como activa visualmente
            if (index === 0) {
                imgMini.style.border = '2px solid #007bff';
                imgMini.style.transform = 'scale(1.05)';
                imgMini.classList.add('activa');
            } else {
                imgMini.style.border = '2px solid transparent';
                imgMini.style.transform = 'scale(1)';
            }

            // Evento para cambiar la foto al hacer clic
            imgMini.addEventListener('click', (e) => {
                e.stopPropagation();
                
                imgMain.src = `${URL_BACKEND_STORAGE}${imagen.url}`;
                
                // Reseteamos todas las miniaturas
                galeriaSwipe.querySelectorAll('img').forEach(m => {
                    m.style.border = '2px solid transparent';
                    m.style.transform = 'scale(1)';
                    m.classList.remove('activa');
                });
                
                // Resaltamos la clickeada
                imgMini.style.border = '2px solid #007bff';
                imgMini.style.transform = 'scale(1.05)';
                imgMini.classList.add('activa');
            });

            galeriaSwipe.appendChild(imgMini);
        });
    } else {
        galeriaSwipe.style.display = 'none';
    }

    // BOTONES
    document.getElementById('btn-swipe-dislike').onclick = () => {
        indiceActual++;
        renderizarCartaSwipe(); 
    };

    document.getElementById('btn-swipe-wa').onclick = () => {
        const telefonoVendedor = anuncio.user.telefono; 
            if (!telefonoVendedor) {
                alert("Este vendedor no tiene un número de teléfono guardado.");
                return;
            }

            let telefonoLimpio = String(telefonoVendedor).replace(/\D/g, '');

            window.open(`https://wa.me/${telefonoLimpio}`, '_blank');
    };
    

    document.getElementById('btn-swipe-like').onclick = async () => {
        if (!usuarioLogueado){
            return alert("¡Inicia sesión para guardar favoritos!");
        }
        try {
            await toggleFavorito(anuncio.id); 
        } catch (error) {
            console.error("Fallo al guardar:", error);
        } finally {
            indiceActual++;
            renderizarCartaSwipe(); 
        }
    };
    // Buscamos la caja donde están los otros botones
    const contenedorBotones = document.getElementById('btn-swipe-like').parentElement;

    let btnOjoSwipe = document.getElementById('btn-ojo-swipe');
    if (!btnOjoSwipe) {
        btnOjoSwipe = document.createElement('button');
        btnOjoSwipe.id = 'btn-ojo-swipe';
        btnOjoSwipe.title = 'Ocultar anuncio';
        btnOjoSwipe.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
        
        // Estilos
        btnOjoSwipe.style.cssText = 'background-color: #fff0f0; color: #cc0000; border: 1px solid #ffcccc; border-radius: 50%; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.3s; font-size: 1.2rem; margin: 0 5px;';
        
        // Hover
        btnOjoSwipe.addEventListener('mouseenter', () => btnOjoSwipe.style.background = '#ffcccc'); 
        btnOjoSwipe.addEventListener('mouseleave', () => btnOjoSwipe.style.background = '#fff0f0');

        // Lo añadimos al lado de los otros botones
        contenedorBotones.appendChild(btnOjoSwipe);
    }

    // Le damos vida al botón
    btnOjoSwipe.onclick = async (e) => {
        e.stopPropagation();
        
        if (!usuarioLogueado) {
            alert("Debes iniciar sesión para ocultar anuncios.");
            return;
        }

        if (confirm("¿Ocultar este anuncio? Se guardará en tus descartes y no lo volverás a ver.")) {
            try {
                btnOjoSwipe.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
                btnOjoSwipe.disabled = true;

                await marcarNoMeInteresa(anuncio.id);

                indiceActual++;
                renderizarCartaSwipe();

            } catch (error) {
                alert("Error al ocultar: " + error.message);
            } finally {
                btnOjoSwipe.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
                btnOjoSwipe.disabled = false;
            }
        }
    };
}

async function inicializarFiltros() {
    const selectCategoria = document.getElementById('select-categoria');
    const selectSubcategoria = document.getElementById('select-subcategoria');
    const selectMunicipio = document.getElementById('select-municipio');

    try {
        // Cargar todas las Categorías
        const categorias = await getCategorias();
        categorias.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.nombre;
            selectCategoria.appendChild(option);
        });

        // Cargar todas las Localidades
        const localidades = await getLocalidades();
        localidades.forEach(loc => {
            const option = document.createElement('option');
            option.value = loc.id;
            option.textContent = loc.nombre;
            selectMunicipio.appendChild(option);
        });

        // Cargar Subcategorías al cambiar la Categoría
        selectCategoria.addEventListener('change', async (e) => {
            const categoriaId = e.target.value;
            
            // Limpiamos y bloqueamos por defecto
            selectSubcategoria.innerHTML = '<option value="">Todas las subcategorías</option>';
            selectSubcategoria.disabled = true;

            // Si vuelve a la opción vacía, paramos aquí
            if (!categoriaId) return;

            try {
                // Buscamos las subcategorías filtradas usando tu servicio
                const subcategorias = await getSubcategoriasPorCategoria(categoriaId);
                
                // Desbloqueamos el select y lo rellenamos
                selectSubcategoria.disabled = false;
                subcategorias.forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub.id;
                    option.textContent = sub.nombre;
                    selectSubcategoria.appendChild(option);
                });
            } catch (errorSub) {
                console.error("No se pudieron cargar las subcategorías:", errorSub);
            }
        });

    } catch (error) {
        console.error("Error inicializando los selectores:", error);
    }
}