import { renderNavbar } from '../components/navBar.js';
import { getLocalidades } from '../services/ubicaciones.js';
import { getCategorias, getSubcategoriasPorCategoria } from '../services/categorias.js';
// Importamos la nueva función updateAnuncioCompleto
import { getAnuncioById, updateAnuncioCompleto } from '../services/anuncios.js';

document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar();

    const token = localStorage.getItem('relink_token');
    if (!token) {
        alert("Debes iniciar sesión para editar un anuncio.");
        window.location.href = '/login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const anuncioId = urlParams.get('id');

    if (!anuncioId) {
        alert("No se ha especificado ningún anuncio para editar.");
        window.location.href = '/index.html';
        return;
    }

    const form = document.getElementById('formEditarAnuncio');
    const errorMessageDiv = document.getElementById('errorMsg');
    const submitButton = form.querySelector('button[type="submit"]');

    const selectCategoria = document.getElementById('categoria_id');
    const selectSubcategoria = document.getElementById('subcategoria_id');
    const selectLocalidad = document.getElementById('localidad_id');
    const divImagenesActuales = document.getElementById('contenedorImagenesActuales');
    const inputNuevasFotos = document.getElementById('nuevas_imagenes');

    // AQUÍ GUARDAMOS LOS IDs DE LAS FOTOS QUE EL USUARIO QUIERE BORRAR
    let imagenesParaBorrar = [];

    if(submitButton) submitButton.textContent = 'Guardar Cambios';

    await cargarSelectCategorias();
    await cargarSelectLocalidades();

    // PEDIMOS LOS DATOS DEL ANUNCIO
    try {
        const response = await getAnuncioById(anuncioId);
        const anuncio = response.datos; 

        const miUsuarioString = localStorage.getItem('relink_user');

        const miUsuario = JSON.parse(miUsuarioString);

        if (anuncio.user_id != miUsuario.id) {
            alert("No tienes permiso para editar un anuncio que no es tuyo.");
            window.location.href = '/index.html'; // hacer pa un futuro una pagina html de Acceso denegado
            return;
        }

        document.getElementById('titulo').value = anuncio.titulo;
        document.getElementById('descripcion').value = anuncio.descripcion;
        document.getElementById('precio').value = anuncio.precio;
        selectLocalidad.value = anuncio.localidad_id;

        // Rellenar categorías
        if (anuncio.subcategoria_id && anuncio.subcategoria && anuncio.subcategoria.categoria_id) {
            selectCategoria.value = anuncio.subcategoria.categoria_id;
            await cargarSubcategorias(anuncio.subcategoria.categoria_id);
            selectSubcategoria.value = anuncio.subcategoria_id;
        }

        // PINTAR IMÁGENES ACTUALES
        divImagenesActuales.innerHTML = '';
        if (anuncio.imagenes && anuncio.imagenes.length > 0) {
            anuncio.imagenes.forEach(img => {
                const imgContainer = document.createElement('div');
                imgContainer.style.display = 'inline-block';
                imgContainer.style.margin = '10px';
                imgContainer.style.textAlign = 'center';

                const imgElement = document.createElement('img');
                imgElement.src = `http://localhost:5500/storage/${img.url}`; 
                imgElement.width = 120; 
                
                const btnBorrar = document.createElement('button');
                btnBorrar.textContent = "Eliminar";
                btnBorrar.type = "button";
                btnBorrar.style.display = "block";
                btnBorrar.style.margin = "5px auto";
                
                // Evento para marcar la foto para borrar
                btnBorrar.addEventListener('click', () => {
                    if (confirm('¿Seguro que quieres borrar esta foto? Se eliminará definitivamente al guardar los cambios.')) {
                        imagenesParaBorrar.push(img.id); // Guardamos el ID en el array
                        imgContainer.remove(); // La ocultamos de la pantalla
                    }
                });

                imgContainer.appendChild(imgElement);
                imgContainer.appendChild(btnBorrar);
                divImagenesActuales.appendChild(imgContainer);
            });
        } else {
            divImagenesActuales.textContent = 'No hay imágenes subidas en este anuncio.';
        }

    } catch (error) {
        alert("No se pudo cargar el anuncio. ¿Seguro que existe o es tuyo?");
        window.location.href = '/index.html';
        return;
    }

    // CAMBIO DE CATEGORÍA
    selectCategoria.addEventListener('change', async (e) => {
        await cargarSubcategorias(e.target.value);
    });

    // GUARDAR LOS CAMBIOS
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        limpiarErrores();
        cargando(true);

        try {
            // Creamos la caja FormData para enviarlo todo junto
            const formData = new FormData();
            
            // Truco de Laravel: Enviamos POST pero le decimos que internamente actúe como PUT
            formData.append('_method', 'PUT');

            // Textos
            formData.append('titulo', document.getElementById('titulo').value);
            formData.append('descripcion', document.getElementById('descripcion').value);
            formData.append('precio', document.getElementById('precio').value);
            formData.append('subcategoria_id', document.getElementById('subcategoria_id').value);
            formData.append('localidad_id', document.getElementById('localidad_id').value);

            // Añadimos la lista de imágenes a borrar
            imagenesParaBorrar.forEach(id => {
                formData.append('imagenes_a_borrar[]', id);
            });

            // Si hay fotos nuevas añadimos
            if (inputNuevasFotos && inputNuevasFotos.files.length > 0) {
                for (let i = 0; i < inputNuevasFotos.files.length; i++) {
                    formData.append('nuevas_imagenes[]', inputNuevasFotos.files[i]);
                }
            }

            // Enviamos todo a tu nueva función en servicios
            await updateAnuncioCompleto(anuncioId, formData);

            window.location.href = '/perfil.html';

        } catch (error) {
            mostrarError(error.message || 'Error al actualizar el anuncio. Revisa los datos.');
        } finally {
            cargando(false);
        }
    });

    // FUNCIONES PARA LLENAR DESPLEGABLES
    async function cargarSelectCategorias() {
        try {
            const categorias = await getCategorias();
            selectCategoria.innerHTML = '<option value="" disabled selected>Selecciona una categoría...</option>';
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.nombre;
                selectCategoria.appendChild(option);
            });
        } catch (error) {
            selectCategoria.innerHTML = '<option value="" disabled>Error al cargar categorías</option>';
        }
    }

    async function cargarSubcategorias(categoriaId) {
        selectSubcategoria.innerHTML = '<option value="" disabled selected>Cargando subcategorías...</option>';
        selectSubcategoria.disabled = true;

        try {
            const subcategoriasFiltradas = await getSubcategoriasPorCategoria(categoriaId);
            selectSubcategoria.innerHTML = '<option value="" disabled selected>Selecciona una subcategoría...</option>';
            
            if (subcategoriasFiltradas.length === 0) {
                selectSubcategoria.innerHTML = '<option value="" disabled>No hay subcategorías</option>';
                return;
            }

            subcategoriasFiltradas.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.id;
                option.textContent = sub.nombre;
                selectSubcategoria.appendChild(option);
            });

            selectSubcategoria.disabled = false;
        } catch (error) {
            selectSubcategoria.innerHTML = '<option value="" disabled>Error al cargar subcategorías</option>';
        }
    }

    async function cargarSelectLocalidades() {
        try {
            const localidades = await getLocalidades();
            selectLocalidad.innerHTML = '<option value="" disabled selected>Selecciona una localidad...</option>';
            localidades.forEach(localidad => {
                const option = document.createElement('option');
                option.value = localidad.id;
                const nombreMuni = localidad.municipio ? localidad.municipio.nombre : '';
                option.textContent = nombreMuni ? `${localidad.nombre} (${nombreMuni})` : localidad.nombre;
                selectLocalidad.appendChild(option);
            });
        } catch (error) {
            selectLocalidad.innerHTML = '<option value="" disabled>Error al cargar localidades</option>';
        }
    }

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
            submitButton.textContent = isLoading ? 'Guardando...' : 'Guardar Cambios';
            submitButton.style.opacity = isLoading ? '0.7' : '1';
        }
    }
});