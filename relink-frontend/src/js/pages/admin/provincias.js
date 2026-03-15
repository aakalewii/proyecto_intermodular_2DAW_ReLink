import { renderNavbar } from '../../components/navBar.js';
import { getPaises, getProvincias, createProvincia, updateProvincia, deleteProvincia } from '../../services/ubicaciones.js';
import { verificarAccesoAdmin } from '../../services/auth.js';

/*
   PANEL DE ADMINISTRACIÓN: PROVINCIAS

   Este script controla la vista de gestión de Provincias. Sigue el mismo patrón 
   que el de Países, pero añade cargar una lista de los países disponibles en un menú desplegable (select).
*/

// Variable de estado: Guarda el ID si estamos editando, o 'null' si estamos creando.
let provinciaIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Control de seguridad: Expulsar a quien no sea administrador
    if (!verificarAccesoAdmin()) {
        return; 
    }

    renderNavbar(); // Pintamos el menú superior
    cargarSelectPaises(); // Select de países
    cargarTablaProvincias(); // Pedimos los datos al backend

  // --- CAPTURA DE ELEMENTOS DEL FORMULARIO ---
    const formAddProvincia = document.getElementById('formAddProvincia');
    const errorMsg = document.getElementById('errorMsg');
    const inputNombre = document.getElementById('nombreProvincia');
    const selectPais = document.getElementById('paisProvincia');
    const btnSubmit = formAddProvincia.querySelector('button');
    const btnCancelar = document.getElementById('btnCancelar');

    // Botón para cancelar la edición y volver al modo de creación
    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    // --- PROCESAMIENTO DEL FORMULARIO ---
    formAddProvincia.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        // Capturamos el texto y convertimos el ID del select a número entero
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
            
            // Limpiamos la pantalla y refrescamos la tabla con el nuevo dato
            resetFormulario();
            cargarTablaProvincias();
        } catch (error) {
            // Error devuelto por la API
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        }
    });

    // FUNCIÓN AUXILIAR: Devuelve el formulario a su estado por defecto
    function resetFormulario() {
        provinciaIdEditando = null;
        inputNombre.value = '';
        selectPais.value = '';
        btnSubmit.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
        errorMsg.style.display = 'none';

        document.querySelectorAll('.btn-edit, .btn-delete').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
});

// --- FUNCIÓN PARA LLENAR EL DESPLEGABLE DE PAÍSES ---
// Pide a la API la lista de países y crea dinámicamente 
// etiquetas <option> para inyectarlas en el select del formulario HTML.
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

// --- FUNCIÓN PARA RENDERIZAR LA TABLA DE PROVINCIAS ---
async function cargarTablaProvincias() {
    const tbody = document.getElementById('tablaProvincias');
    
    try {
        const provincias = await getProvincias();
        tbody.innerHTML = ''; 

        if (provincias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No hay provincias registradas.</td></tr>';
            return;
        }

        provincias.forEach(provincia => {
            const tr = document.createElement('tr');
            // Leemos el objeto anidado 'pais' que nos mandó Laravel.
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

        // ASIGNACIÓN DE EVENTO: BORRAR
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Seguro que quieres borrar esta provincia?')) {
                    await deleteProvincia(id);
                    cargarTablaProvincias(); 
                }
            });
        });

        // ASIGNACIÓN DE EVENTO: EDITAR
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // Leemos los tres datos guardados en el botón
                const id = e.target.getAttribute('data-id');
                const nombreActual = e.target.getAttribute('data-nombre');
                const paisIdActual = e.target.getAttribute('data-pais-id');

                // Rellenamos el formulario
                const inputNombre = document.getElementById('nombreProvincia');
                const selectPais = document.getElementById('paisProvincia');
                
                inputNombre.value = nombreActual;
                selectPais.value = paisIdActual;

                // Activamos el modo Edición
                provinciaIdEditando = id;

                const btnSubmit = document.querySelector('#formAddProvincia button[type="submit"]');
                btnSubmit.textContent = 'Actualizar';
                document.getElementById('btnCancelar').style.display = 'inline-block';
                
                // Bloqueamos el resto de botones de la tabla por seguridad
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