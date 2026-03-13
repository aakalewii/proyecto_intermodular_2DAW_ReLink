import { renderNavbar } from '../../components/navBar.js';
import { getMunicipios, getLocalidades, createLocalidad, updateLocalidad, deleteLocalidad } from '../../services/ubicaciones.js';
import { verificarAccesoAdmin } from '../../services/auth.js';

let localidadIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {

    if (!verificarAccesoAdmin()) {
        return; 
    }

    renderNavbar(); // Pintamos el menú superior
    cargarSelectMunicipios(); // Select de municipios
    cargarTablaLocalidades(); // Pedimos los datos al backend

    // --- LÓGICA DEL FORMULARIO DE AÑADIR ---
    const formAddLocalidad = document.getElementById('formAddLocalidad');
    const errorMsg = document.getElementById('errorMsg');
    const inputNombre = document.getElementById('nombreLocalidad');
    const selectMunicipio = document.getElementById('municipioLocalidad');
    const btnSubmit = formAddLocalidad.querySelector('button');
    const btnCancelar = document.getElementById('btnCancelar');

    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    formAddLocalidad.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        const nombre = inputNombre.value;
        const municipio_id = parseInt(selectMunicipio.value);

        try {
            if (localidadIdEditando === null) {
                // MODO CREAR: Si no hay ID, creamos uno nuevo
                await createLocalidad({ nombre: nombre, municipio_id: municipio_id });
            } else {
                // MODO EDITAR: Si hay un ID guardado, actualizamos
                await updateLocalidad(localidadIdEditando, { nombre: nombre, municipio_id: municipio_id });
            }
            
            resetFormulario();
            cargarTablaLocalidades();
        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        }
    });

    function resetFormulario() {
        localidadIdEditando = null;
        inputNombre.value = '';
        selectMunicipio.value = '';
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
async function cargarSelectMunicipios() {
    const selectMunicipio = document.getElementById('municipioLocalidad');
    try {
        const municipios = await getMunicipios();
        selectMunicipio.innerHTML = '<option value="" disabled selected>Selecciona un municipio...</option>';
        
        municipios.forEach(municipio => {
            const option = document.createElement('option');
            option.value = municipio.id;
            option.textContent = municipio.nombre;
            selectMunicipio.appendChild(option);
        });
    } catch (error) {
        selectMunicipio.innerHTML = '<option value="" disabled>Error al cargar municipios</option>';
    }
}

async function cargarTablaLocalidades() {
    const tbody = document.getElementById('tablaLocalidades');
    
    try {
        const localidades = await getLocalidades();
        tbody.innerHTML = ''; 

        if (localidades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No hay localidades registradas.</td></tr>';
            return;
        }

        localidades.forEach(localidad => {
            const tr = document.createElement('tr');
            // Aquí sacamos el nombre del municipio gracias al "with('municipio')" de tu Laravel
            const nombreDelMunicipio = localidad.municipio ? localidad.municipio.nombre : 'Sin municipio';
            tr.innerHTML = `
                <td>${localidad.nombre}</td>
                <td>${nombreDelMunicipio}</td>
                <td>
                    <button class="btn-edit" data-id="${localidad.id}" data-nombre="${localidad.nombre}" data-muni-id="${localidad.municipio_id}">Editar</button>
                    <button class="btn-delete" data-id="${localidad.id}">Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Darle vida a los botones de BORRAR
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Seguro que quieres borrar esta localidad?')) {
                    await deleteLocalidad(id);
                    cargarTablaLocalidades(); 
                }
            });
        });

        // Darle vida a los botones de EDITAR
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const nombreActual = e.target.getAttribute('data-nombre');
                const muniIdActual = e.target.getAttribute('data-muni-id');
                
                const inputNombre = document.getElementById('nombreLocalidad');
                const selectMunicipio = document.getElementById('municipioLocalidad');
                
                inputNombre.value = nombreActual;
                selectMunicipio.value = muniIdActual;

                localidadIdEditando = id;

                const btnSubmit = document.querySelector('#formAddLocalidad button[type="submit"]');
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