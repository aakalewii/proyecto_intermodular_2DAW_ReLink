import { renderNavbar } from '../components/navBar.js';
import { getLocalidades } from '../services/ubicaciones.js';
import { createAnuncio } from '../services/anuncios.js';
import { getCategorias, getSubcategoriasPorCategoria } from '../services/categorias.js';
import { forzarCierreSesion, verificarAccesoUsuario } from '../services/auth.js';

/*
   PANTALLA: CREAR ANUNCIO

   Este script controla el formulario donde los usuarios publican nuevos productos.
   Sus responsabilidades principales son: 
   1. Validar que el usuario esté logueado.
   2. Cargar los desplegables dinámicos (Categorías -> Subcategorías y Localidades).
   3. Empaquetar los datos de texto junto con las FOTOS usando FormData para 
      enviárselos al backend.
*/

document.addEventListener('DOMContentLoaded', async () => {
    // Renderizamos la barra de navegación
    renderNavbar();

    // --- CAPTURA DE ELEMENTOS DEL DOM ---
        const form = document.getElementById('formCrearAnuncio');
        const errorMessageDiv = document.getElementById('errorMsg');
        const submitButton = form.querySelector('button[type="submit"]');

        const selectCategoria = document.getElementById('categoria_id');
        const selectSubcategoria = document.getElementById('subcategoria_id');
        
    const puedePasar = await verificarAccesoUsuario();

    if (puedePasar) {
        
        cargarSelectCategorias();
        cargarSelectLocalidades();

        // Leemos el localStorage. Si no hay token, el usuario es anónimo y lo 
        // redirigimos inmediatamente a la página de login para que no pueda ver el formulario.
        const token = localStorage.getItem('relink_token');
        if (!token) {
            forzarCierreSesion();
            return;
        }

        // EVENTO DE DESPLEGABLES (Selects en cascada)
        // Cuando el usuario elige una Categoría principal, este 
        // evento salta, bloquea el segundo select temporalmente y pide a la API 
        // las subcategorías correspondientes.
        selectCategoria.addEventListener('change', async (e) => {
            const categoriaSeleccionadaId = e.target.value;
            
            // Bloqueo visual mientras carga para evitar que el usuario elija datos erróneos
            selectSubcategoria.innerHTML = '<option value="" disabled selected>Cargando subcategorías...</option>';
            selectSubcategoria.disabled = true;

            try {
                // Cargamos las subcategorías de la categoria seleccionada
                const subcategoriasFiltradas = await getSubcategoriasPorCategoria(categoriaSeleccionadaId);

                selectSubcategoria.innerHTML = '<option value="" disabled selected>Selecciona una subcategoría...</option>';
                
                if (subcategoriasFiltradas.length === 0) {
                    selectSubcategoria.innerHTML = '<option value="" disabled>No hay subcategorías en esta categoría</option>';
                    return; // Cortamos aquí si no hay datos
                }

                // Inyectamos las subcategorías recibidas
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

        // EVENTO PRINCIPAL: ENVÍO DEL FORMULARIO
    form.addEventListener('submit', async (e) => {
            e.preventDefault();
            limpiarErrores();
            cargando(true);

            try {
                // Utilizamos 'FormData' en lugar de JSON porque necesitamos enviar 
                // archivos binarios (fotos) al servidor.
                const formData = new FormData();

                // Añadimos los datos de texto e IDs de las relaciones
                formData.append('titulo', document.getElementById('titulo').value);
                formData.append('descripcion', document.getElementById('descripcion').value);
                formData.append('precio', document.getElementById('precio').value);
                formData.append('subcategoria_id', document.getElementById('subcategoria_id').value);
                formData.append('localidad_id', document.getElementById('localidad_id').value);

                // PROCESAMIENTO DE LAS FOTOS
                const inputArchivos = document.getElementById('imagenes');
                
                // Si el input existe en el HTML y el usuario ha seleccionado alguna foto...
                if (inputArchivos && inputArchivos.files.length > 0) {
                    // Entramos en un bucle porque el usuario puede elegir múltiples fotos a la vez
                    for (let i = 0; i < inputArchivos.files.length; i++) {
                        // Aádimos el Array de fotos.
                        formData.append('imagenes[]', inputArchivos.files[i]); 
                    }
                }

                // Enviamos el paquete completo al backend
                await createAnuncio(formData);

                // Si Laravel responde con éxito (Status 201), mandamos al usuario a su perfil 
                // para que pueda ver su nuevo anuncio publicado.
                window.location.href = '/perfil.html'; 

            } catch (error) {

                if (error.message.includes('401')) {
                    forzarCierreSesion();
                    return; // Cortamos la ejecución al instante
                }

                // Si Laravel nos devuelve un error (ej. faltan datos o la foto pesa mucho)
                mostrarError(error.message || 'Error al publicar el anuncio. Revisa los datos.');
            } finally {
                // Independientemente de si hay éxito o error, devolvemos el botón a la normalidad
                cargando(false);
            }
        });
    }

    // --- FUNCIONES AUXILIARES ---

    // Pide la lista general de categorías a la API
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

    // Pide la lista de localidades y le concatena el nombre del municipio para dar más contexto
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

    // Funciones genéricas para el manejo de la interfaz
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

    // Gestiona el estado del botón principal para evitar múltiples clics
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