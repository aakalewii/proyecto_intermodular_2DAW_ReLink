import { renderNavbar } from '../../components/Navbar.js';
import { getCategorias, getSubcategorias, createSubcategoria, updateSubcategoria, deleteSubcategoria } from '../../services/categorias.js';
import { verificarAccesoAdmin } from '../../services/auth.js';

let subcategoriaIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {

    if (!verificarAccesoAdmin()) {
        return; 
    }

    renderNavbar(); // Pintamos el menú superior
    cargarSelectCategorias(); // Select de categorías
    cargarTablaSubcategorias(); // Pedimos los datos al backend

    // --- LÓGICA DEL FORMULARIO DE AÑADIR ---
    const formAddSubcategoria = document.getElementById('formAddSubcategoria');
    const errorMsg = document.getElementById('errorMsg');
    const inputNombre = document.getElementById('nombreSubcategoria');
    const inputDesc = document.getElementById('descSubcategoria');
    const selectCategoria = document.getElementById('categoriaId');
    const btnSubmit = formAddSubcategoria.querySelector('button');
    const btnCancelar = document.getElementById('btnCancelar');

    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    formAddSubcategoria.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        const nombre = inputNombre.value;
        // Mantenemos el truco de la descripción vacía (null)
        const descripcion = inputDesc.value.trim() === '' ? null : inputDesc.value;
        const categoria_id = parseInt(selectCategoria.value);

        try {
            if (subcategoriaIdEditando === null) {
                // MODO CREAR: Si no hay ID, creamos uno nuevo
                await createSubcategoria({ nombre: nombre, descripcion: descripcion, categoria_id: categoria_id });
            } else {
                // MODO EDITAR: Si hay un ID guardado, actualizamos
                await updateSubcategoria(subcategoriaIdEditando, { nombre: nombre, descripcion: descripcion, categoria_id: categoria_id });
            }
            
            resetFormulario();
            cargarTablaSubcategorias();
        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        }
    });

    function resetFormulario() {
        subcategoriaIdEditando = null;
        inputNombre.value = '';
        inputDesc.value = '';
        selectCategoria.value = '';
        btnSubmit.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
        errorMsg.style.display = 'none';

        // Reactivamos TODOS los botones de la tabla
        document.querySelectorAll('.btn-editar, .btn-borrar').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1'; // Les devolvemos su color normal
        });
    }
});

// --- FUNCIÓN PARA LLENAR EL DESPLEGABLE ---
async function cargarSelectCategorias() {
    const selectCategoria = document.getElementById('categoriaId');
    try {
        const categorias = await getCategorias();
        selectCategoria.innerHTML = '<option value="" disabled selected>Selecciona una categoría...</option>';
        
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

async function cargarTablaSubcategorias() {
    const tbody = document.getElementById('tablaSubcategorias');
    
    try {
        const subcategorias = await getSubcategorias();
        tbody.innerHTML = ''; 

        if (subcategorias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No hay subcategorías registradas.</td></tr>';
            return;
        }

        subcategorias.forEach(subcategoria => {
            const tr = document.createElement('tr');
            const nombreDeLaCategoria = subcategoria.categoria ? subcategoria.categoria.nombre : 'Sin categoría';
            
            tr.innerHTML = `
                <td>${subcategoria.nombre}</td>
                <td>${subcategoria.descripcion || ''}</td>
                <td>${nombreDeLaCategoria}</td>
                <td>
                    <button class="btn-editar" data-id="${subcategoria.id}" data-nombre="${subcategoria.nombre}" data-desc="${subcategoria.descripcion || ''}" data-categoria-id="${subcategoria.categoria_id}">Editar</button>
                    <button class="btn-borrar" data-id="${subcategoria.id}">Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Botones de BORRAR
        document.querySelectorAll('.btn-borrar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Seguro que quieres borrar esta subcategoría?')) {
                    await deleteSubcategoria(id);
                    cargarTablaSubcategorias(); 
                }
            });
        });

        // Botones de EDITAR
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const nombreActual = e.target.getAttribute('data-nombre');
                const descActual = e.target.getAttribute('data-desc');
                const categoriaIdActual = e.target.getAttribute('data-categoria-id');
                
                const inputNombre = document.getElementById('nombreSubcategoria');
                const inputDesc = document.getElementById('descSubcategoria');
                const selectCategoria = document.getElementById('categoriaId');
                
                inputNombre.value = nombreActual;
                inputDesc.value = descActual;
                selectCategoria.value = categoriaIdActual;

                subcategoriaIdEditando = id;

                const btnSubmit = document.querySelector('#formAddSubcategoria button[type="submit"]');
                btnSubmit.textContent = 'Actualizar';
                document.getElementById('btnCancelar').style.display = 'inline-block';
                
                document.querySelectorAll('.btn-editar, .btn-borrar').forEach(botonTabla => {
                    botonTabla.disabled = true;
                    botonTabla.style.opacity = '0.5';
                });

                inputNombre.focus();
            });
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4">Error al cargar: ${error.message}</td></tr>`;
    }
}