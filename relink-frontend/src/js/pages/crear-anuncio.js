import { renderNavbar } from '../components/navBar.js';
// Importamos la función para traer las localidades
import { getLocalidades } from '../services/ubicaciones.js';
import { createAnuncio } from '../services/anuncios.js';
import { getCategorias, getSubcategoriasPorCategoria } from '../services/categorias.js';

document.addEventListener('DOMContentLoaded', () => {
    // Renderizamos la barra de navegación
    renderNavbar();

    cargarSelectCategorias();
    cargarSelectLocalidades();

    // Comprobamos si el usuario está logueado
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

    const selectCategoria = document.getElementById('categoria_id');
    const selectSubcategoria = document.getElementById('subcategoria_id');

    selectCategoria.addEventListener('change', async (e) => {
        const categoriaSeleccionadaId = e.target.value;
        
        // Bloqueamos y mostramos "Cargando..." en las subcategorías
        selectSubcategoria.innerHTML = '<option value="" disabled selected>Cargando subcategorías...</option>';
        selectSubcategoria.disabled = true;

        try {
            // Le pedimos a Laravel SOLAMENTE las subcategorías de esta categoría
            const subcategoriasFiltradas = await getSubcategoriasPorCategoria(categoriaSeleccionadaId);

            selectSubcategoria.innerHTML = '<option value="" disabled selected>Selecciona una subcategoría...</option>';
            
            if (subcategoriasFiltradas.length === 0) {
                selectSubcategoria.innerHTML = '<option value="" disabled>No hay subcategorías en esta categoría</option>';
                return; // Cortamos aquí si no hay datos
            }

            // Rellenamos las opciones
            subcategoriasFiltradas.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.id;
                option.textContent = sub.nombre;
                selectSubcategoria.appendChild(option);
            });

            // Desbloqueamos para que el usuario pueda elegir
            selectSubcategoria.disabled = false;

        } catch (error) {
            selectSubcategoria.innerHTML = '<option value="" disabled>Error al cargar subcategorías</option>';
        }
    });

    // 3. Escuchamos cuando el usuario le da a enviar
   form.addEventListener('submit', async (e) => {
        e.preventDefault();
        limpiarErrores();
        cargando(true);

        try {
            // 1. Creamos la "caja" vacía
            const formData = new FormData();

            // 2. Metemos los textos sacándolos directamente del HTML
            formData.append('titulo', document.getElementById('titulo').value);
            formData.append('descripcion', document.getElementById('descripcion').value);
            formData.append('precio', document.getElementById('precio').value);
            formData.append('subcategoria_id', document.getElementById('subcategoria_id').value);
            formData.append('localidad_id', document.getElementById('localidad_id').value);

            // 3. Buscamos el input de las fotos
            const inputArchivos = document.getElementById('imagenes');
            
            // Si el input existe y el usuario ha seleccionado al menos una foto...
            if (inputArchivos && inputArchivos.files.length > 0) {
                // Recorremos las fotos y las metemos en la caja
                for (let i = 0; i < inputArchivos.files.length; i++) {
                    // El 'imagenes[]' con corchetes le dice a Laravel que es una lista de fotos
                    formData.append('imagenes[]', inputArchivos.files[i]); 
                }
            }

            // 4. Se lo mandamos TODO de golpe a nuestra función del servicio
            await createAnuncio(formData);

            alert('¡Anuncio y fotos publicados con éxito!');
            window.location.href = '/index.html'; 

        } catch (error) {
            mostrarError(error.message || 'Error al publicar el anuncio. Revisa los datos.');
        } finally {
            cargando(false);
        }
    });

    async function cargarSelectCategorias() {
        const selectCat = document.getElementById('categoria_id');
        try {
            const categorias = await getCategorias();
            selectCat.innerHTML = '<option value="" disabled selected>Selecciona una categoría...</option>';
            
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.nombre;
                selectCat.appendChild(option);
            });
        } catch (error) {
            selectCat.innerHTML = '<option value="" disabled>Error al cargar categorías</option>';
        }
    }

    // --- FUNCIÓN PARA LLENAR EL DESPLEGABLE DE LOCALIDADES ---
    async function cargarSelectLocalidades() {
    const selectLocalidad = document.getElementById('localidad_id');
    try {
        const localidades = await getLocalidades();
        selectLocalidad.innerHTML = '<option value="" disabled selected>Selecciona una localidad...</option>';
        
        localidades.forEach(localidad => {
            const option = document.createElement('option');
            option.value = localidad.id;
            
            // Mostramos el nombre de la localidad y su municipio entre paréntesis
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
        if (isLoading === true) {
            submitButton.disabled = true;
            submitButton.textContent = 'Publicando...';
            submitButton.style.opacity = '0.7';
        } 
        else {
            submitButton.disabled = false;
            submitButton.textContent = 'Publicar Anuncio';
            submitButton.style.opacity = '1';
        }
    }
});