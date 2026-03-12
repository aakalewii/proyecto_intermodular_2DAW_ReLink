import { renderNavbar } from '../components/Navbar.js';
import { getAnuncioDetalle, updateAnuncio } from '../services/anuncios.js';
import { getLocalidades } from '../services/ubicaciones.js';
import { getCategorias, getSubcategoriasPorCategoria } from '../services/categorias.js';

document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar();

    // 1. Obtener el ID del anuncio de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const anuncioId = urlParams.get('id');

    if (!anuncioId) {
        window.location.href = '/index.html';
        return;
    }

    const form = document.getElementById('formEditarAnuncio');
    const selectCat = document.getElementById('categoria_id');
    const selectSub = document.getElementById('subcategoria_id');
    const selectLoc = document.getElementById('localidad_id');

    // 2. Cargar datos iniciales (Localidades y Categorías)
    try {
        const [localidades, categorias, anuncioRespuesta] = await Promise.all([
            getLocalidades(),
            getCategorias(),
            getAnuncioDetalle(anuncioId)
        ]);

        // Sacamos el objeto anuncio real de la respuesta del servidor
        const anuncio = anuncioRespuesta.datos; 

        // Rellenar Localidades
        localidades.forEach(loc => {
            const opt = new Option(loc.nombre, loc.id);
            if(loc.id == anuncio.localidad_id) opt.selected = true;
            selectLoc.add(opt);
        });

        // Rellenar Categorías
        categorias.forEach(cat => {
            const opt = new Option(cat.nombre, cat.id);
            // Comprobamos si el anuncio tiene subcategoría para marcar la categoría padre
            if(anuncio.subcategoria && cat.id == anuncio.subcategoria.categoria_id) opt.selected = true;
            selectCat.add(opt);
        });

        // Cargar Subcategorías de la categoría actual y seleccionar la del anuncio
        await cargarSubcategorias(selectCat.value, anuncio.subcategoria_id);

        // Rellenar campos de texto
        document.getElementById('titulo').value = anuncio.titulo;
        document.getElementById('descripcion').value = anuncio.descripcion;
        document.getElementById('precio').value = anuncio.precio;

        // Mostrar fotos actuales
        const listaFotos = document.getElementById('listaFotosActuales');
        listaFotos.innerHTML = ''; // Limpiar por si acaso
        if (anuncio.imagenes && anuncio.imagenes.length > 0) {
            anuncio.imagenes.forEach(img => {
                const imgContainer = document.createElement('div');
                imgContainer.style.position = 'relative';
                
                const imgEl = document.createElement('img');
                imgEl.src = `http://localhost:5500/storage/${img.url}`;
                imgEl.style.width = '80px';
                imgEl.style.height = '80px';
                imgEl.style.objectFit = 'cover';
                imgEl.style.borderRadius = '5px';
                
                imgContainer.appendChild(imgEl);
                listaFotos.appendChild(imgContainer);
            });
        }

    } catch (error) {
        console.error("Error al cargar datos:", error);
    }

    // Evento para cambiar subcategorías al cambiar categoría
    selectCat.addEventListener('change', (e) => cargarSubcategorias(e.target.value));

    async function cargarSubcategorias(catId, selectedId = null) {
    if (!catId) return;

    try {
        const subs = await getSubcategoriasPorCategoria(catId);
        selectSub.innerHTML = '';
        
        const listaSubs = subs.datos || subs;

        listaSubs.forEach(s => {
            const opt = new Option(s.nombre, s.id);
            if(s.id == selectedId) opt.selected = true;
            selectSub.add(opt);
        });
        selectSub.disabled = false;
    } catch (error) {
        console.error("Error al cargar subcategorías:", error);
    }
}

    // 3. Enviar el formulario actualizado
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnGuardar = document.getElementById('btnGuardar');
        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Guardando...';

        const formData = new FormData();
        
        // TRUCO PARA LARAVEL: Multipart/form-data no funciona bien con PUT puro
        // Enviamos como POST pero simulamos PUT
        formData.append('_method', 'PUT'); 

        formData.append('titulo', document.getElementById('titulo').value);
        formData.append('descripcion', document.getElementById('descripcion').value);
        formData.append('precio', document.getElementById('precio').value);
        formData.append('subcategoria_id', selectSub.value);
        formData.append('localidad_id', selectLoc.value);

        const inputImg = document.getElementById('imagenes');
        if (inputImg.files.length > 0) {
            for (let i = 0; i < inputImg.files.length; i++) {
                formData.append('imagenes[]', inputImg.files[i]);
            }
        }

        try {
            // Pasamos el formData con el _method PUT dentro
            await updateAnuncio(anuncioId, formData);
            
            document.getElementById('successMsg').style.display = 'block';
            setTimeout(() => window.location.href = '/mis-anuncios.html', 2000);
        } catch (err) {
            console.error(err);
            const errorDiv = document.getElementById('errorMsg');
            errorDiv.textContent = "Error al actualizar el anuncio.";
            errorDiv.style.display = 'block';
            btnGuardar.disabled = false;
            btnGuardar.textContent = 'Guardar Cambios';
        }
    });
});