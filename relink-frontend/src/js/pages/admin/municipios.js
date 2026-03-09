import { renderNavbar } from '../../components/navBar.js';
import { getProvincias, getMunicipios, createMunicipio, updateMunicipio, deleteMunicipio } from '../../services/ubicaciones.js';

let municipioIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar(); // Pintamos el menú superior
    cargarSelectProvincias(); // Select de provincias
    cargarTablaMunicipios(); // Pedimos los datos al backend

    // --- LÓGICA DEL FORMULARIO DE AÑADIR ---
    const formAddMunicipio = document.getElementById('formAddMunicipio');
    const errorMsg = document.getElementById('errorMsg');
    const inputNombre = document.getElementById('nombreMunicipio');
    const selectProvincia = document.getElementById('provinciaMunicipio');
    const btnSubmit = formAddMunicipio.querySelector('button');
    const btnCancelar = document.getElementById('btnCancelar');

    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    formAddMunicipio.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        const nombre = inputNombre.value;
        const provincia_id = parseInt(selectProvincia.value);

        try {
            if (municipioIdEditando === null) {
                // MODO CREAR: Si no hay ID, creamos uno nuevo
                await createMunicipio({ nombre: nombre, provincia_id: provincia_id });
            } else {
                // MODO EDITAR: Si hay un ID guardado, actualizamos
                await updateMunicipio(municipioIdEditando, { nombre: nombre, provincia_id: provincia_id });
            }
            
            resetFormulario();
            cargarTablaMunicipios();
        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        }
    });

    function resetFormulario() {
        municipioIdEditando = null;
        inputNombre.value = '';
        selectProvincia.value = '';
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
async function cargarSelectProvincias() {
    const selectProvincia = document.getElementById('provinciaMunicipio');
    try {
        const provincias = await getProvincias();
        selectProvincia.innerHTML = '<option value="" disabled selected>Selecciona una provincia...</option>';
        
        provincias.forEach(provincia => {
            const option = document.createElement('option');
            option.value = provincia.id;
            option.textContent = provincia.nombre;
            selectProvincia.appendChild(option);
        });
    } catch (error) {
        selectProvincia.innerHTML = '<option value="" disabled>Error al cargar provincias</option>';
    }
}

async function cargarTablaMunicipios() {
    const tbody = document.getElementById('tablaMunicipios');
    
    try {
        const municipios = await getMunicipios();
        tbody.innerHTML = ''; 

        if (municipios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No hay municipios registrados.</td></tr>';
            return;
        }

        municipios.forEach(municipio => {
            const tr = document.createElement('tr');
            // Aquí sacamos el nombre de la provincia gracias al "with('provincia')"
            const nombreDeLaProvincia = municipio.provincia ? municipio.provincia.nombre : 'Sin provincia';
            tr.innerHTML = `
                <td>${municipio.nombre}</td>
                <td>${nombreDeLaProvincia}</td>
                <td>
                    <button class="btn-editar" data-id="${municipio.id}" data-nombre="${municipio.nombre}" data-prov-id="${municipio.provincia_id}">Editar</button>
                    <button class="btn-borrar" data-id="${municipio.id}">Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Darle vida a los botones de BORRAR
        document.querySelectorAll('.btn-borrar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Seguro que quieres borrar este municipio?')) {
                    await deleteMunicipio(id);
                    cargarTablaMunicipios(); 
                }
            });
        });

        // Darle vida a los botones de EDITAR
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const nombreActual = e.target.getAttribute('data-nombre');
                const provIdActual = e.target.getAttribute('data-prov-id');
                
                const inputNombre = document.getElementById('nombreMunicipio');
                const selectProvincia = document.getElementById('provinciaMunicipio');
                
                inputNombre.value = nombreActual;
                selectProvincia.value = provIdActual;

                municipioIdEditando = id;

                const btnSubmit = document.querySelector('#formAddMunicipio button[type="submit"]');
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
        tbody.innerHTML = `<tr><td colspan="3">Error al cargar: ${error.message}</td></tr>`;
    }
}