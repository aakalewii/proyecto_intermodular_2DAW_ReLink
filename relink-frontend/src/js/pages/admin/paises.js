import { renderNavbar } from '../../components/navBar.js';
import { getPaises, createPais, updatePais, deletePais } from '../../services/ubicaciones.js';

// Variable para saber si estamos creando o editando
let paisIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar(); // Pintamos el menú superior
    cargarTablaPaises(); // Pedimos los datos al backend

    // --- LÓGICA DEL FORMULARIO DE AÑADIR ---
    const formAddPais = document.getElementById('formAddPais');
    const errorMsg = document.getElementById('errorMsg');
    const inputNombre = document.getElementById('nombrePais');
    const btnSubmit = formAddPais.querySelector('button');
    const btnCancelar = document.getElementById('btnCancelar');

    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    formAddPais.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        const nombre = inputNombre.value;

        try {
            if (paisIdEditando === null) {
                // MODO CREAR: Si no hay ID, creamos uno nuevo
                await createPais({ nombre: nombre });
            } else {
                // MODO EDITAR: Si hay un ID guardado, actualizamos
                await updatePais(paisIdEditando, { nombre: nombre });
            }
            
                resetFormulario();
                cargarTablaPaises();
        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        }
    });

    function resetFormulario() {
        paisIdEditando = null;
        inputNombre.value = '';
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

async function cargarTablaPaises() {
    const tbody = document.getElementById('tablaPaises');
    
    try {
        const paises = await getPaises();
        tbody.innerHTML = ''; 

        if (paises.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No hay países registrados.</td></tr>';
            return;
        }

        paises.forEach(pais => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pais.nombre}</td>
                <td>
                    <button class="btn-editar" data-id="${pais.id}" data-nombre="${pais.nombre}">Editar</button>
                    <button class="btn-borrar" data-id="${pais.id}">Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // 3A. Darle vida a los botones de BORRAR
        document.querySelectorAll('.btn-borrar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Seguro que quieres borrar este país?')) {
                    await deletePais(id);
                    cargarTablaPaises(); 
                }
            });
        });

        // Darle vida a los botones de EDITAR
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                const nombreActual = e.target.getAttribute('data-nombre');
                
                const inputNombre = document.getElementById('nombrePais');
                inputNombre.value = nombreActual;

                paisIdEditando = id;


                const btnSubmit = document.querySelector('#formAddPais button[type="submit"]');
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