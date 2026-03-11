import { renderNavbar } from '../../components/Navbar.js';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../services/categorias.js';
import { verificarAccesoAdmin } from '../../services/auth.js';

let categoriaIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {

    if (!verificarAccesoAdmin()) {
        return; 
    }

    renderNavbar();
    cargarTablaCategorias();

    const formAddCategoria = document.getElementById('formAddCategoria');
    const errorMsg = document.getElementById('errorMsg');
    const inputNombre = document.getElementById('nombreCategoria');
    const inputDesc = document.getElementById('descCategoria');
    const btnSubmit = formAddCategoria.querySelector('button[type="submit"]');
    const btnCancelar = document.getElementById('btnCancelar');

    // --- BOTÓN CANCELAR ---
    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    // --- ENVIAR EL FORMULARIO ---
    formAddCategoria.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        
        const nombre = inputNombre.value;
        const desc = inputDesc.value;

        try {
            if (categoriaIdEditando === null) {
                // MODO CREAR
                await createCategoria({ nombre: nombre, descripcion: desc });
            } else {
                // MODO EDITAR
                await updateCategoria(categoriaIdEditando, { nombre: nombre, descripcion: desc });
            }

            resetFormulario();
            cargarTablaCategorias();

        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        }
    });

    // --- FUNCIÓN PARA LIMPIAR EL FORMULARIO ---
    function resetFormulario() {
        categoriaIdEditando = null;
        inputNombre.value = '';
        inputDesc.value = '';
        btnSubmit.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
        errorMsg.style.display = 'none';

        // Reactivar los botones de la tabla
        let botonesTabla = document.querySelectorAll('.btn-editar, .btn-borrar');
        botonesTabla.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
});

// --- FUNCIÓN PARA PINTAR LA TABLA ---
async function cargarTablaCategorias() {
    const tbody = document.getElementById('tablaCategorias');
    
    try {
        const categorias = await getCategorias();
        tbody.innerHTML = ''; 

        if (categorias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No hay categorías registradas.</td></tr>';
            return;
        }

        // Pintamos las filas
        categorias.forEach(categoria => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${categoria.nombre}</td>
                <td>${categoria.descripcion || ''}</td>
                <td>
                    <button class="btn-editar" data-id="${categoria.id}" data-nombre="${categoria.nombre}" data-desc="${categoria.descripcion}">Editar</button>
                    <button class="btn-borrar" data-id="${categoria.id}">Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Botones de BORRAR
        let botonesBorrar = document.querySelectorAll('.btn-borrar');
        botonesBorrar.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Seguro que quieres borrar esta categoría?')) {
                    await deleteCategoria(id);
                    cargarTablaCategorias(); 
                }
            });
        });

        // Botones de EDITAR
        let botonesEditar = document.querySelectorAll('.btn-editar');
        botonesEditar.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const nombreActual = e.target.getAttribute('data-nombre');
                const descActual = e.target.getAttribute('data-desc');

                const inputNombre = document.getElementById('nombreCategoria');
                const inputDesc = document.getElementById('descCategoria');
                inputNombre.value = nombreActual;
                inputDesc.value = descActual;

                categoriaIdEditando = id;

                const btnSubmit = document.querySelector('#formAddCategoria button[type="submit"]');
                btnSubmit.textContent = 'Actualizar';
                document.getElementById('btnCancelar').style.display = 'inline-block';
                
                // Bloquear los demás botones de la tabla
                let botonesTabla = document.querySelectorAll('.btn-editar, .btn-borrar');
                
                botonesTabla.forEach(botonTabla => {
                    botonTabla.disabled = true;
                    botonTabla.style.opacity = '0.5';
                });

                inputNombre.focus();
            });
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3">Error al cargar: ${error.message}</td></tr>`;
    }
}