import { renderNavbar } from '../components/navBar.js';
// Importamos la función para traer las localidades
import { getLocalidades } from '../services/ubicaciones.js';
import { createAnuncio } from '../services/anuncios.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Renderizamos la barra de navegación
    renderNavbar();

    cargarSelectLocalidades();

    // 2. Comprobamos si el usuario está logueado
    const token = localStorage.getItem('relink_token');
    if (!token) {
        alert("Debes iniciar sesión para publicar un anuncio.");
        window.location.href = '/login.html';
        return;
    }

    // Cuestionario para la creación del anuncio
    const form = document.getElementById('formCrearAnuncio');
    const errorMessageDiv = document.getElementById('errorMsg');
    const submitButton = form.querySelector('button[type="submit"]');

    if (!form) return;

    // 3. Escuchamos cuando el usuario le da a enviar
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        limpiarErrores();

        // Extraemos los datos del formulario
        const tituloValue = document.getElementById('titulo').value;
        const descripcionValue = document.getElementById('descripcion').value;
        const precioValue = document.getElementById('precio').value;
        const subcategoriaValue = document.getElementById('subcategoria_id').value;
        const localidadValue = document.getElementById('localidad_id').value;

        // Armamos el objeto
        const anuncioData = {
            titulo: tituloValue,
            descripcion: descripcionValue,
            precio: parseFloat(precioValue), // Lo convertimos a número decimal
            subcategoria_id: parseInt(subcategoriaValue), // Lo convertimos a número entero
            localidad_id: parseInt(localidadValue)
        };

        // Aseguramos que el precio y los IDs sean números
        anuncioData.precio = parseFloat(anuncioData.precio);
        anuncioData.subcategoria_id = parseInt(anuncioData.subcategoria_id);
        if (anuncioData.localidad_id) {
            anuncioData.localidad_id = parseInt(anuncioData.localidad_id);
        }

        cargando(true);

        try {
            // Llamamos a nuestro servicio
            await createAnuncio(anuncioData);

            alert('¡Anuncio publicado con éxito!');
            window.location.href = '/index.html'; // Lo mandamos al inicio para que vea su anuncio

        } catch (error) {
            mostrarError(error.message || 'Error al publicar el anuncio. Revisa los datos.');
        } finally {
            cargando(false);
        }
    });

    // --- FUNCIÓN PARA LLENAR EL DESPLEGABLE DE LOCALIDADES ---
async function cargarSelectLocalidades() {
    const selectLocalidad = document.getElementById('localidad_id');
    try {
        const localidades = await getLocalidades();
        selectLocalidad.innerHTML = '<option value="" disabled selected>Selecciona una localidad...</option>';
        
        localidades.forEach(localidad => {
            const option = document.createElement('option');
            option.value = localidad.id;
            
            // Un toque pro: mostramos el nombre de la localidad y su municipio entre paréntesis
            // Ejemplo: "Playa del Inglés (San Bartolomé de Tirajana)"
            const nombreMuni = localidad.municipio ? localidad.municipio.nombre : '';
            option.textContent = nombreMuni ? `${localidad.nombre} (${nombreMuni})` : localidad.nombre;
            
            selectLocalidad.appendChild(option);
        });
    } catch (error) {
        selectLocalidad.innerHTML = '<option value="" disabled>Error al cargar localidades</option>';
    }
}

    // --- FUNCIONES AUXILIARES ---
    function mostrarError(message) {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message;
            errorMessageDiv.style.display = 'block';
        } else {
            alert(message);
        }
    }

    function limpiarErrores() {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = '';
            errorMessageDiv.style.display = 'none';
        }
    }

    function cargando(isLoading) {
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.textContent = isLoading ? 'Publicando...' : 'Publicar Anuncio';
            submitButton.style.opacity = isLoading ? '0.7' : '1';
        }
    }
});