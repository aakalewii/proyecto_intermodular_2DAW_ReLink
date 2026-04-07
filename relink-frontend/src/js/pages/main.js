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
    
    // Inyectamos el buscador básico en la página
    crearBarraBusqueda();

    // Disparamos la petición a la base de datos para cargar el catálogo
    cargarAnuncios();
    
});

// Función para inyectar la barra de búsqueda
function crearBarraBusqueda() {
    const contenedorLista = document.getElementById('lista-anuncios');
    
    const divBuscador = document.createElement('div');
    divBuscador.style = "margin-bottom: 20px; text-align: center;";
    
    // Añadidas clases genéricas, bordes redondeados y transiciones a los botones/inputs
    divBuscador.innerHTML = `
        <input type="text" id="input-buscador" placeholder="Buscar anuncios..." style="padding: 10px 15px; width: 60%; max-width: 400px; border: 2px solid #ccc; border-radius: 20px; outline: none; transition: border-color 0.3s;">
        <button id="btn-buscar" style="padding: 10px 20px; cursor: pointer; border-radius: 20px; border: none; background-color: #000102ff; color: white; transition: background-color 0.3s; font-weight: bold; margin-left: 5px;">Buscar</button>
        <button id="btn-limpiar" style="padding: 10px 20px; cursor: pointer; display: none; border-radius: 20px; border: 1px solid #ccc; background-color: #f8f9fa; transition: background-color 0.3s; margin-left: 5px;">Limpiar</button>
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

        const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';

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