import { renderNavbar } from '../components/navBar.js';
import { getLocalidades } from '../services/ubicaciones.js';
import { getCategorias, getSubcategoriasPorCategoria } from '../services/categorias.js';
import { getAnuncioById, updateAnuncioCompleto } from '../services/anuncios.js';
import { forzarCierreSesion, verificarAccesoUsuario, misDatos } from '../services/auth.js';

/*
   PANTALLA: EDITAR ANUNCIO
   
   La misión de este script es:
   1. Leer la base de datos para rellenar el formulario con los datos que ya tenía el anuncio.
   2. Recoger los cambios (textos nuevos, fotos a borrar y fotos a subir) y empaquetarlos
      todos en una única petición al backend.
*/

document.addEventListener('DOMContentLoaded', async () => {
    // Cargamos la barra de arriba
    renderNavbar();

    const puedePasar = await verificarAccesoUsuario();

    if (puedePasar) {

    // Miramos el localStorage. Si no hay token, acabamos la operación.
    const token = localStorage.getItem('relink_token');
    if (!token) {
        forzarCierreSesion();
        return;
    }

    // RECUPERAR EL ID DEL ANUNCIO DE LA URL
    // Usamos URLSearchParams. Si la URL es "/editar-anuncio.html?id=5", esto saca el "5".
    const urlParams = new URLSearchParams(window.location.search);
    const anuncioId = urlParams.get('id');

    if (!anuncioId) {
        alert("No se ha especificado ningún anuncio para editar.");
        window.location.href = '/index.html';
        return;
    }

    // CAZAR LOS ELEMENTOS DEL HTML (DOM)
    // Guardamos las cajas del formulario en variables para manejarlas luego.
    const form = document.getElementById('formEditarAnuncio');
    const errorMessageDiv = document.getElementById('errorMsg');
    const submitButton = form.querySelector('button[type="submit"]');

    const selectCategoria = document.getElementById('categoria_id');
    const selectSubcategoria = document.getElementById('subcategoria_id');
    const selectLocalidad = document.getElementById('localidad_id');
    const divImagenesActuales = document.getElementById('contenedorImagenesActuales');
    const inputNuevasFotos = document.getElementById('nuevas_imagenes');

    // Aquí iremos metiendo los IDs de las fotos que el usuario pinche en "Eliminar".
    // No las borramos al momento de la BD, solo apuntamos su id para borrarlas al darle a Guardar.
    let imagenesParaBorrar = [];

    if(submitButton) submitButton.textContent = 'Guardar Cambios';

    // Rellenamos los combos de los selects ANTES de traer los datos del anuncio
    await cargarSelectCategorias();
    await cargarSelectLocalidades();

    // TRAER LOS DATOS DEL ANUNCIO VIEJO Y PINTARLOS
    try {
        const response = await getAnuncioById(anuncioId);
        const anuncio = response.datos; 

        // Recuperamos el usuario que está navegando para compararlo
        const miUsuario = await misDatos();

        // SEGURIDAD: ¿El anuncio es tuyo?
        // Si el user_id del anuncio no coincide con su ID, lo echamos.
        if (anuncio.user_id != miUsuario.id) {
            alert("No tienes permiso para editar un anuncio que no es tuyo.");
            window.location.href = '/index.html'; 
            return;
        }

        // Si es suyo, empezamos a rellenar las cajas de texto con la información de la BD
        document.getElementById('titulo').value = anuncio.titulo;
        document.getElementById('descripcion').value = anuncio.descripcion;
        document.getElementById('precio').value = anuncio.precio;
        selectLocalidad.value = anuncio.localidad_id;

        // SELECTS EN CASCADA:
        // Si el anuncio ya tenía una subcategoría, primero seleccionamos la Categoría Padre.
        // Luego hacemos la petición a la API para cargar las opciones de ese hijo, y finalmente seleccionamos el hijo.
        if (anuncio.subcategoria_id && anuncio.subcategoria && anuncio.subcategoria.categoria_id) {
            selectCategoria.value = anuncio.subcategoria.categoria_id;
            await cargarSubcategorias(anuncio.subcategoria.categoria_id);
            selectSubcategoria.value = anuncio.subcategoria_id;
        }

        // GESTIÓN VISUAL DE LAS FOTOS
        divImagenesActuales.innerHTML = '';
        if (anuncio.imagenes && anuncio.imagenes.length > 0) {
            // Si tiene fotos, creamos un mini-contenedor para cada una con JavaScript
            anuncio.imagenes.forEach(img => {
                const imgContainer = document.createElement('div');
                imgContainer.style.display = 'inline-block';
                imgContainer.style.margin = '10px';
                imgContainer.style.textAlign = 'center';

                // Creamos la etiqueta de la imagen para que se vea
                const imgElement = document.createElement('img');
                imgElement.src = `http://localhost:5500/storage/${img.url}`; 
                imgElement.width = 120; 
                
                // Creamos un botón "Eliminar" debajo de la foto
                const btnBorrar = document.createElement('button');
                btnBorrar.textContent = "Eliminar";
                btnBorrar.type = "button";
                btnBorrar.style.display = "block";
                btnBorrar.style.margin = "5px auto";
                
                // ¿Qué pasa al darle a Eliminar?
                btnBorrar.addEventListener('click', () => {
                    if (confirm('¿Seguro que quieres borrar esta foto? Se eliminará definitivamente al guardar los cambios.')) {
                        // metemos la ID de la foto en nuestro array
                        imagenesParaBorrar.push(img.id); 
                        // Y borramos el DIV entero del HTML para que el usuario sepa que se ha borrado
                        imgContainer.remove(); 
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
            // 4. ¡AÑADIMOS ESTO PARA NO VOLVER A TENER ERRORES SILENCIOSOS!
            console.error("Error al cargar la vista de edición:", error);

            if (error.message.includes('401') || error.message.includes('Unauthenticated')) {
                forzarCierreSesion();
                return;
            }
        }

    // EVENTO: CAMBIAR DE CATEGORÍA
    // Si el usuario decide cambiar el anuncio de categoría a mitad de la edición,
    // recargamos el select de las subcategorías.
    selectCategoria.addEventListener('change', async (e) => {
        await cargarSubcategorias(e.target.value);
    });

    // EVENTO BOTÓN DE GUARDAR
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos que la página se recargue a lo loco
        limpiarErrores();
        cargando(true);

        try {
            // Como vamos a enviar fotos, usamos FormData en vez de un JSON
            const formData = new FormData();
            
            // Metemos los textos actualizados en el paquete
            formData.append('titulo', document.getElementById('titulo').value);
            formData.append('descripcion', document.getElementById('descripcion').value);
            formData.append('precio', document.getElementById('precio').value);
            formData.append('subcategoria_id', document.getElementById('subcategoria_id').value);
            formData.append('localidad_id', document.getElementById('localidad_id').value);

            // Metemos EL ARRAY de las fotos que queremos eliminar en el backend
            // El backend iterará sobre esto y las borrará de su carpeta.
            imagenesParaBorrar.forEach(id => {
                formData.append('imagenes_a_borrar[]', id);
            });

            // Procesamos las fotos nuevas si el usuario ha seleccionado alguna en el explorador de archivos
            if (inputNuevasFotos && inputNuevasFotos.files.length > 0) {
                for (let i = 0; i < inputNuevasFotos.files.length; i++) {
                    // Metemos cada archivo físico en el FormData usando [] para indicarle a Laravel que es un array
                    formData.append('nuevas_imagenes[]', inputNuevasFotos.files[i]);
                }
            }

            // Enviamos el paquete al backend a través del servicio
            await updateAnuncioCompleto(anuncioId, formData);

            // Si todo ha ido bien, le devolvemos a su perfil
            window.location.href = '/perfil.html';

        } catch (error) {

            if (error.message.includes('401')) {
                forzarCierreSesion();
                return;
            }

            mostrarError(error.message || 'Error al actualizar el anuncio. Revisa los datos.');
        } finally {
            cargando(false);
        }
    });

    // --- FUNCIONES AUXILIARES (Para cargar selects) ---
    // (Iguales que en crear-anuncio, piden a la API y pintan <options>)
    
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

}
});