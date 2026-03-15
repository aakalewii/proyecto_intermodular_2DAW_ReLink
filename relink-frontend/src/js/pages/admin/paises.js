import { renderNavbar } from '../../components/navBar.js';
import { getPaises, createPais, updatePais, deletePais } from '../../services/ubicaciones.js';
import { verificarAccesoAdmin } from '../../services/auth.js';

/*
   PANEL DE ADMINISTRACIÓN: PAÍSES

   Este script controla la vista donde el administrador gestiona los países.
   La pantalla tiene dos partes conectadas: una tabla con la lista de países 
   y un único formulario que usamos tanto para crear países nuevos como para 
   editar los existentes.
*/

// Usamos esta variable como "interruptor" de estado.
// Si es 'null', el formulario sabe que debe crear un país nuevo.
// Si tiene un número (un ID), el formulario sabe que estamos editando un país existente.
let paisIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. SEGURIDAD: Comprobamos si el usuario es administrador. Si no lo es, 
    // la función 'verificarAccesoAdmin' lo echará de la página, y este 'return' 
    // detiene la ejecución del código para que no se pinte nada de la tabla.
    if (!verificarAccesoAdmin()) {
            return; 
    }

    renderNavbar(); // Pintamos el menú superior
    cargarTablaPaises(); // Pedimos los datos al backend

    // --- LÓGICA DEL FORMULARIO DE AÑADIR / EDITAR ---

    // Capturamos los elementos del formulario (inputs, botones y la caja de errores)
    const formAddPais = document.getElementById('formAddPais');
    const errorMsg = document.getElementById('errorMsg');
    const inputNombre = document.getElementById('nombrePais');
    const btnSubmit = formAddPais.querySelector('button');
    const btnCancelar = document.getElementById('btnCancelar');

    // Botón Cancelar: Solo aparece cuando estamos en modo "Editar". 
    // Si lo pulsamos, limpia el formulario y lo devuelve al modo "Crear".
    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    // EVENTO PRINCIPAL DEL FORMULARIO
    // Se dispara cuando el admin le da al botón "Guardar" o "Actualizar"
    formAddPais.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';

        const nombre = inputNombre.value;

        try {
            // Evaluamos nuestro "interruptor" de estado
            if (paisIdEditando === null) {
                // MODO CREAR: Si no hay ID, creamos uno nuevo
                await createPais({ nombre: nombre });
            } else {
                // MODO EDITAR: Enviamos el ID y el nuevo nombre para actualizarlo
                await updatePais(paisIdEditando, { nombre: nombre });
            }
            
            // Si todo fue bien, vaciamos el formulario y refrescamos la tabla 
            // para que aparezcan los cambios inmediatamente.
            resetFormulario();
            cargarTablaPaises();

        } catch (error) {
            // Si el backend nos da un error (ej. "El nombre ya existe"), lo mostramos
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        }
    });

    // FUNCIÓN AUXILIAR: Devuelve el formulario a su estado original
    function resetFormulario() {
        paisIdEditando = null;
        inputNombre.value = '';
        btnSubmit.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
        errorMsg.style.display = 'none';

        // Reactivamos TODOS los botones de Editar/Borrar de la tabla que 
        // habíamos bloqueado temporalmente.
        document.querySelectorAll('.btn-edit, .btn-delete').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
});

// FUNCIÓN DE RENDERIZADO DE LA TABLA
async function cargarTablaPaises() {
    const tbody = document.getElementById('tablaPaises');
    
    try {
        // Pedimos la lista al servidor usando nuestro servicio 'fetch'
        const paises = await getPaises();
        tbody.innerHTML = ''; // Limpiamos la tabla vieja antes de pintar la nueva

        if (paises.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No hay países registrados.</td></tr>';
            return;
        }

        // Recorremos el array de países e inyectamos el HTML de cada fila.
        // Los atributos 'data-id' y 'data-nombre': son vitales para 
        // que los botones sepan a qué país pertenecen.
        paises.forEach(pais => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pais.nombre}</td>
                <td>
                    <button class="btn-edit" data-id="${pais.id}" data-nombre="${pais.nombre}">Editar</button>
                    <button class="btn-delete" data-id="${pais.id}">Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // ASIGNACIÓN DE EVENTOS: BOTONES BORRAR
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id'); // Leemos el ID oculto en el botón

                // Pedimos confirmación antes de lanzar el DELETE por seguridad
                if (confirm('¿Seguro que quieres borrar este país?')) {
                    await deletePais(id);
                    cargarTablaPaises(); // Refrescamos la tabla tras el borrado
                }
            });
        });

        // ASIGNACIÓN DE EVENTOS: BOTONES EDITAR
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // 1. Extraemos los datos ocultos en el botón que hemos pulsado
                const id = e.target.getAttribute('data-id');
                const nombreActual = e.target.getAttribute('data-nombre');
                
                // 2. Rellenamos el input del formulario superior con el nombre del país
                const inputNombre = document.getElementById('nombrePais');
                inputNombre.value = nombreActual;

                // 3. Activamos el modo edición guardando el ID
                paisIdEditando = id;

                // 4. Transformamos la interfaz (cambiamos el botón a "Actualizar" y mostramos "Cancelar")
                const btnSubmit = document.querySelector('#formAddPais button[type="submit"]');
                btnSubmit.textContent = 'Actualizar';
                document.getElementById('btnCancelar').style.display = 'inline-block';
                
                // 5. Bloqueamos el resto de botones de la tabla para evitar 
                // que el usuario pulse "Editar" en dos países a la vez y rompa el formulario.
                document.querySelectorAll('.btn-edit, .btn-delete').forEach(botonTabla => {
                    botonTabla.disabled = true;
                    botonTabla.style.opacity = '0.5';
                });

                inputNombre.focus(); // Ponemos el cursor en el input automáticamente
            });
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3">Error al cargar: ${error.message}</td></tr>`;
    }
}