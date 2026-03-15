import { renderNavbar } from '../../components/navBar.js';
// Importamos todas las llamadas a la API de categorías y subcategorías
import { getCategorias, getSubcategorias, createSubcategoria, updateSubcategoria, deleteSubcategoria } from '../../services/categorias.js';
import { verificarAccesoAdmin } from '../../services/auth.js';

/*
   PANTALLA: GESTIÓN DE SUBCATEGORÍAS (ADMIN)
   La principal diferencia con el de categorías es que aquí gestionamos una relación:
   cada subcategoría DEBE tener un 'categoria_id' asociado.
*/

// VARIABLE DE ESTADO GLOBAL: El "interruptor" entre Crear y Editar
let subcategoriaIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {

    // SEGURIDAD FRONTAL: Echamos a los que no sean admin
    if (!verificarAccesoAdmin()) {
        return; 
    }

    renderNavbar(); // Pintamos el menú superior
    cargarSelectCategorias(); // Llenamos el 1º desplegable con las categorías padre
    cargarTablaSubcategorias(); // Llenamos la tabla inferior con las subcategorías existentes

    // --- CAPTURAS DEL DOM PARA EL FORMULARIO ---
    const formAddSubcategoria = document.getElementById('formAddSubcategoria');
    const errorMsg = document.getElementById('errorMsg');
    const inputNombre = document.getElementById('nombreSubcategoria');
    const inputDesc = document.getElementById('descSubcategoria');
    const selectCategoria = document.getElementById('categoriaId');
    const btnSubmit = formAddSubcategoria.querySelector('button');
    const btnCancelar = document.getElementById('btnCancelar');

    // --- EVENTO: BOTÓN CANCELAR ---
    // Aborta la edición y limpia los campos
    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    // --- EVENTO: ENVÍO DEL FORMULARIO ---
    formAddSubcategoria.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        // Recogemos los valores del usuario
        const nombre = inputNombre.value;
        // Si el usuario teclea solo espacios, lo convertimos a nulo
        const descripcion = inputDesc.value.trim() === '' ? null : inputDesc.value;
        // Convertimos el valor del select (que siempre es texto) a número entero,
        // porque en la base de datos 'categoria_id' es un Integer.
        const categoria_id = parseInt(selectCategoria.value);

        try {
            // (Crear vs Actualizar)
            if (subcategoriaIdEditando === null) {
                // MODO CREAR
                await createSubcategoria({ nombre: nombre, descripcion: descripcion, categoria_id: categoria_id });
            } else {
                // MODO EDITAR
                await updateSubcategoria(subcategoriaIdEditando, { nombre: nombre, descripcion: descripcion, categoria_id: categoria_id });
            }
            
            // Si el backend responde, reseteamos la pantalla y repintamos la tabla
            resetFormulario();
            cargarTablaSubcategorias();
        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        }
    });

    // --- FUNCIÓN DE LIMPIEZA VISUAL ---
    function resetFormulario() {
        subcategoriaIdEditando = null; // Volvemos al modo "Crear"
        inputNombre.value = '';
        inputDesc.value = '';
        selectCategoria.value = ''; // Reseteamos el desplegable
        btnSubmit.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
        errorMsg.style.display = 'none';

        // Reactivamos TODOS los botones de la tabla (que bloqueamos al darle a Editar)
        document.querySelectorAll('.btn-edit, .btn-delete').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1'; 
        });
    }
});

// --- FUNCIÓN PARA LLENAR EL DESPLEGABLE ---
// Pide al backend TODAS las categorías padre para poder asignárselas a los hijos.
async function cargarSelectCategorias() {
    const selectCategoria = document.getElementById('categoriaId');
    try {
        const categorias = await getCategorias();
        selectCategoria.innerHTML = '<option value="" disabled selected>Selecciona una categoría...</option>';
        
        // Creamos una etiqueta <option> por cada categoría recibida
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            selectCategoria.appendChild(option);
        });
    } catch (error) {
        selectCategoria.innerHTML = '<option value="" disabled>Error al cargar categorías</option>';
    }
}

// --- FUNCIÓN PARA PINTAR LA TABLA DE DATOS ---
async function cargarTablaSubcategorias() {
    const tbody = document.getElementById('tablaSubcategorias');
    
    try {
        const subcategorias = await getSubcategorias();
        tbody.innerHTML = ''; 

        if (subcategorias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No hay subcategorías registradas.</td></tr>';
            return;
        }

        // BUCLE DE RENDERIZADO
        subcategorias.forEach(subcategoria => {
            const tr = document.createElement('tr');
            
            // Accedemos a la relación.
            // Como en el backend hicimos un Eloquent "with('categoria')", aquí el JSON
            // ya nos trae el objeto "padre" anidado dentro de la subcategoría.
            const nombreDeLaCategoria = subcategoria.categoria ? subcategoria.categoria.nombre : 'Sin categoría';
            
            // Inyectamos el HTML y guardamos todos los datos necesarios en atributos "data-*"
            tr.innerHTML = `
                <td>${subcategoria.nombre}</td>
                <td>${subcategoria.descripcion || ''}</td>
                <td>${nombreDeLaCategoria}</td>
                <td>
                    <button class="btn-edit" data-id="${subcategoria.id}" data-nombre="${subcategoria.nombre}" data-desc="${subcategoria.descripcion || ''}" data-categoria-id="${subcategoria.categoria_id}">Editar</button>
                    <button class="btn-delete" data-id="${subcategoria.id}">Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // --- EVENTOS DINÁMICOS (Se asignan DESPUÉS de inyectar el HTML) ---

        // Botones de BORRAR
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Seguro que quieres borrar esta subcategoría?')) {
                    await deleteSubcategoria(id);
                    cargarTablaSubcategorias(); 
                }
            });
        });

        // Botones de EDITAR
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // Extraemos los datos "escondidos" en el botón
                const id = e.target.getAttribute('data-id');
                const nombreActual = e.target.getAttribute('data-nombre');
                const descActual = e.target.getAttribute('data-desc');
                const categoriaIdActual = e.target.getAttribute('data-categoria-id');
                
                // Apuntamos a los inputs del formulario
                const inputNombre = document.getElementById('nombreSubcategoria');
                const inputDesc = document.getElementById('descSubcategoria');
                const selectCategoria = document.getElementById('categoriaId');
                
                // Rellenamos el formulario con los datos de la fila seleccionada
                inputNombre.value = nombreActual;
                inputDesc.value = descActual;
                selectCategoria.value = categoriaIdActual;

                // CAMBIO DE ESTADO
                subcategoriaIdEditando = id;

                // Cambio visual del botón y mostramos el botón de Cancelar
                const btnSubmit = document.querySelector('#formAddSubcategoria button[type="submit"]');
                btnSubmit.textContent = 'Actualizar';
                document.getElementById('btnCancelar').style.display = 'inline-block';
                
                // Bloqueo de seguridad: apagamos los demás botones de la tabla
                document.querySelectorAll('.btn-edit, .btn-delete').forEach(botonTabla => {
                    botonTabla.disabled = true;
                    botonTabla.style.opacity = '0.5';
                });

                // Auto-foco por usabilidad
                inputNombre.focus();
            });
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4">Error al cargar: ${error.message}</td></tr>`;
    }
}