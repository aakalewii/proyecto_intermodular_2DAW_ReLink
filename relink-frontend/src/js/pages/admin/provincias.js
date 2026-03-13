import { renderNavbar } from '../../components/navBar.js';
import { getPaises, getProvincias, createProvincia, updateProvincia, deleteProvincia } from '../../services/ubicaciones.js';
import { verificarAccesoAdmin } from '../../services/auth.js';

let provinciaIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    
    if (!verificarAccesoAdmin()) {
        return; 
    }

    renderNavbar(); // Pintamos el menú superior
    cargarSelectPaises(); // Select de países
    cargarTablaProvincias(); // Pedimos los datos al backend

    // --- LÓGICA DEL FORMULARIO DE AÑADIR ---
    const formAddProvincia = document.getElementById('formAddProvincia');
    const errorMsg = document.getElementById('errorMsg');
    const inputNombre = document.getElementById('nombreProvincia');
    const selectPais = document.getElementById('paisProvincia');
    const btnSubmit = formAddProvincia.querySelector('button');
    const btnCancelar = document.getElementById('btnCancelar');

    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    formAddProvincia.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        const nombre = inputNombre.value;
        const pais_id = parseInt(selectPais.value);

        try {
            if (provinciaIdEditando === null) {
                // MODO CREAR: Si no hay ID, creamos uno nuevo
                await createProvincia({ nombre: nombre, pais_id: pais_id });
            } else {
                // MODO EDITAR: Si hay un ID guardado, actualizamos
                await updateProvincia(provinciaIdEditando, { nombre: nombre, pais_id: pais_id });
            }
            
            resetFormulario();
            cargarTablaProvincias();
        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        }
    });

    function resetFormulario() {
        provinciaIdEditando = null;
        inputNombre.value = '';
        selectPais.value = '';
        btnSubmit.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
        errorMsg.style.display = 'none';

        // Reactivamos TODOS los botones de la tabla
        document.querySelectorAll('.btn-edit, .btn-delete').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1'; // Les devolvemos su color normal
        });
    }
});

// --- FUNCIÓN PARA LLENAR EL DESPLEGABLE ---
async function cargarSelectPaises() {
    const selectPais = document.getElementById('paisProvincia');
    try {
        const paises = await getPaises();
        selectPais.innerHTML = '<option value="" disabled selected>Selecciona un país...</option>';
        
        paises.forEach(pais => {
            const option = document.createElement('option');
            option.value = pais.id;
            option.textContent = pais.nombre;
            selectPais.appendChild(option);
        });
    } catch (error) {
        selectPais.innerHTML = '<option value="" disabled>Error al cargar países</option>';
    }
}

async function cargarTablaProvincias() {
    const tbody = document.getElementById('tablaProvincias');
    
    try {
        const provincias = await getProvincias();
        const paises = await getPaises();
        tbody.innerHTML = ''; 

        if (provincias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No hay provincias registradas.</td></tr>';
            return;
        }

        provincias.forEach(provincia => {
            const tr = document.createElement('tr');
            const nombreDelPais = provincia.pais ? provincia.pais.nombre : 'Sin país';
            tr.innerHTML = `
                <td>${provincia.nombre}</td>
                <td>${nombreDelPais}</td>
                <td>
                    <button class="btn-edit" data-id="${provincia.id}" data-nombre="${provincia.nombre}" data-pais-id="${provincia.pais_id}">Editar</button>
                    <button class="btn-delete" data-id="${provincia.id}">Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Darle vida a los botones de BORRAR
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Seguro que quieres borrar esta provincia?')) {
                    await deleteProvincia(id);
                    cargarTablaProvincias(); 
                }
            });
        });

        // Darle vida a los botones de EDITAR
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const nombreActual = e.target.getAttribute('data-nombre');
                const paisIdActual = e.target.getAttribute('data-pais-id');
                
                const inputNombre = document.getElementById('nombreProvincia');
                const selectPais = document.getElementById('paisProvincia');
                
                inputNombre.value = nombreActual;
                selectPais.value = paisIdActual;

                provinciaIdEditando = id;

                const btnSubmit = document.querySelector('#formAddProvincia button[type="submit"]');
                btnSubmit.textContent = 'Actualizar';
                document.getElementById('btnCancelar').style.display = 'inline-block';
                
                document.querySelectorAll('.btn-edit, .btn-delete').forEach(botonTabla => {
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