import { renderNavbar } from '../components/Navbar.js';
import { getLocalidades } from '../services/ubicaciones.js';
import { getCategorias, getSubcategoriasPorCategoria } from '../services/categorias.js';
import { createAnuncio } from '../services/anuncios.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Renderizar el Navbar
    renderNavbar();

    // 2. Comprobar si el usuario está logueado
    const token = localStorage.getItem('relink_token');
    if (!token) {
        alert("Debes iniciar sesión para publicar un anuncio.");
        window.location.href = '/login.html';
        return;
    }

    const form = document.getElementById('formCrearAnuncio');
    const selectCategoria = document.getElementById('categoria_id');
    const selectSubcategoria = document.getElementById('subcategoria_id');
    const selectLocalidad = document.getElementById('localidad_id');
    const btnPublicar = document.getElementById('btnPublicar');
    const errorMsg = document.getElementById('errorMsg');
    const successMsg = document.getElementById('successMsg');

    // --- CARGA INICIAL DE DATOS ---

    // Cargar Categorías
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
        console.error("Error cargando categorías:", error);
    }

    // Cargar Localidades
    try {
        const localidades = await getLocalidades();
        selectLocalidad.innerHTML = '<option value="" disabled selected>Selecciona una localidad...</option>';
        localidades.forEach(loc => {
            const option = document.createElement('option');
            option.value = loc.id;
            // Mostramos el nombre de la localidad y el municipio si existe
            const nombreMuni = loc.municipio ? loc.municipio.nombre : '';
            option.textContent = nombreMuni ? `${loc.nombre} (${nombreMuni})` : loc.nombre;
            selectLocalidad.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando localidades:", error);
    }

    // --- EVENTOS ---

    // Cambio de categoría -> Cargar subcategorías
    selectCategoria.addEventListener('change', async (e) => {
        const categoriaId = e.target.value;
        selectSubcategoria.innerHTML = '<option value="" disabled selected>Cargando subcategorías...</option>';
        selectSubcategoria.disabled = true;

        try {
            const subcategorias = await getSubcategoriasPorCategoria(categoriaId);
            selectSubcategoria.innerHTML = '<option value="" disabled selected>Selecciona una subcategoría...</option>';
            
            if (subcategorias.length === 0) {
                selectSubcategoria.innerHTML = '<option value="" disabled>No hay subcategorías disponibles</option>';
            } else {
                subcategorias.forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub.id;
                    option.textContent = sub.nombre;
                    selectSubcategoria.appendChild(option);
                });
                selectSubcategoria.disabled = false;
            }
        } catch (error) {
            console.error("Error cargando subcategorías:", error);
        }
    });

    // Envío del Formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset de mensajes y estado de carga
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
        btnPublicar.disabled = true;
        btnPublicar.textContent = 'Publicando...';

        // Creamos el FormData para poder enviar archivos
        const formData = new FormData();
        formData.append('titulo', document.getElementById('titulo').value);
        formData.append('descripcion', document.getElementById('descripcion').value);
        formData.append('precio', document.getElementById('precio').value);
        formData.append('subcategoria_id', selectSubcategoria.value);
        formData.append('localidad_id', selectLocalidad.value);

        // Añadimos las imágenes si existen
        const inputImagenes = document.getElementById('imagenes');
        if (inputImagenes.files.length > 0) {
            for (let i = 0; i < inputImagenes.files.length; i++) {
                formData.append('imagenes[]', inputImagenes.files[i]);
            }
        }

        try {
            await createAnuncio(formData);
            
            // Éxito
            successMsg.style.display = 'block';
            form.reset();
            
            // Redirigir tras un breve tiempo
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 2000);

        } catch (error) {
            console.error("Error al crear el anuncio:", error);
            errorMsg.textContent = error.message || "Hubo un error al publicar el anuncio.";
            errorMsg.style.display = 'block';
            btnPublicar.disabled = false;
            btnPublicar.textContent = 'Publicar Anuncio';
        }
    });
});