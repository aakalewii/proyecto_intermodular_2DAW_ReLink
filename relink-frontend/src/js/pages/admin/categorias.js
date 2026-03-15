import { renderNavbar } from '../../components/navBar.js';
// Importamos las funciones que hablan con el backend (Axios/Fetch)
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../services/categorias.js';
import { verificarAccesoAdmin } from '../../services/auth.js';

/*
   PANTALLA: GESTIÓN DE CATEGORÍAS (ADMIN)
   Este script controla un CRUD completo en una sola pantalla.
   Usa un único formulario tanto para CREAR como para EDITAR, alternando
   su comportamiento dependiendo del valor de la variable 'categoriaIdEditando'.
*/

// VARIABLE DE ESTADO GLOBAL:
// Si es null, el formulario sabe que tiene que CREAR una categoría nueva.
// Si tiene un número (ej. 5), el formulario sabe que tiene que EDITAR la categoría con ID 5.
let categoriaIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {

    // SEGURIDAD FRONTAL: ¿Eres admin?
    // Si la función devuelve falso (porque eres un cliente normal o un hacker listillo), 
    // te expulsa de la página automáticamente usando return para frenar el script.
    if (!verificarAccesoAdmin()) {
        return; 
    }

    renderNavbar();
    cargarTablaCategorias(); // Pintamos la tabla nada más entrar

    // CAPTURA DEL DOM
    const formAddCategoria = document.getElementById('formAddCategoria');
    const errorMsg = document.getElementById('errorMsg');
    const inputNombre = document.getElementById('nombreCategoria');
    const inputDesc = document.getElementById('descCategoria');
    const btnSubmit = formAddCategoria.querySelector('button[type="submit"]');
    const btnCancelar = document.getElementById('btnCancelar');

    // --- BOTÓN CANCELAR ---
    // Solo aparece cuando estamos editando. Si el usuario se arrepiente,
    // limpiamos el formulario y volvemos al estado de "Crear".
    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    // --- ENVIAR EL FORMULARIO (Submit) ---
    formAddCategoria.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        
        const nombre = inputNombre.value;
        const desc = inputDesc.value;

        try {
            if (categoriaIdEditando === null) {
                // MODO CREAR: Llamamos a la API por POST
                await createCategoria({ nombre: nombre, descripcion: desc });
            } else {
                // MODO EDITAR: Llamamos a la API por PUT/PATCH pasando el ID de la variable global
                await updateCategoria(categoriaIdEditando, { nombre: nombre, descripcion: desc });
            }

            // Si el backend nos da el OK, limpiamos la pantalla y pedimos a la API
            // la lista de categorías actualizada para volver a pintar la tabla.
            resetFormulario();
            cargarTablaCategorias();

        } catch (error) {
            // Si el backend falla pintamos el mensaje de error de rojo.
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        }
    });

    // --- FUNCIÓN PARA LIMPIAR EL FORMULARIO ---
    // Devuelve la interfaz a su estado original (Modo Crear)
    function resetFormulario() {
        categoriaIdEditando = null; // Reiniciamos el estado
        inputNombre.value = '';
        inputDesc.value = '';
        btnSubmit.textContent = 'Guardar';
        btnCancelar.style.display = 'none';
        errorMsg.style.display = 'none';

        // Reactivamos los botones de editar/borrar de la tabla que bloqueamos antes
        let botonesTabla = document.querySelectorAll('.btn-edit, .btn-delete');
        botonesTabla.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
});

// --- FUNCIÓN PARA PINTAR LA TABLA DINÁMICAMENTE ---
async function cargarTablaCategorias() {
    const tbody = document.getElementById('tablaCategorias');
    
    try {
        // Pedimos los datos frescos al backend
        const categorias = await getCategorias();
        tbody.innerHTML = ''; // Vaciamos la tabla de HTML viejo

        // Si la tabla de la base de datos está vacía, mostramos un mensaje
        if (categorias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3">No hay categorías registradas.</td></tr>';
            return;
        }

        // BUCLE: Pintamos fila por fila (<tr>)
        categorias.forEach(categoria => {
            const tr = document.createElement('tr');
            // Si la descripción es null, ponemos un texto vacío
            // Además, inyectamos los datos reales dentro de atributos `data-*` en los botones para recuperarlos luego.
            tr.innerHTML = `
                <td>${categoria.nombre}</td>
                <td>${categoria.descripcion || ''}</td>
                <td>
                    <button class="btn-edit" data-id="${categoria.id}" data-nombre="${categoria.nombre}" data-desc="${categoria.descripcion || ''}"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-delete" data-id="${categoria.id}"><i class="fa-solid fa-trash"></i> Borrar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // EVENTOS PARA LOS BOTONES
        // Botones de BORRAR
        let botonesBorrar = document.querySelectorAll('.btn-delete');
        botonesBorrar.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                
                // Confirmación de seguridad estándar del navegador
                if (confirm('¿Seguro que quieres borrar esta categoría?')) {
                    await deleteCategoria(id); // API Call
                    cargarTablaCategorias();   // Repintamos la tabla
                }
            });
        });

        // Botones de EDITAR
        let botonesEditar = document.querySelectorAll('.btn-edit');
        botonesEditar.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Extraemos los datos de la fila concreta que ha pinchado el admin
                const boton = e.currentTarget;
                const id = boton.getAttribute('data-id');
                const nombreActual = boton.getAttribute('data-nombre');
                const descActual = boton.getAttribute('data-desc');
                
                // Rellenamos el formulario superior con esos datos
                const inputNombre = document.getElementById('nombreCategoria');
                const inputDesc = document.getElementById('descCategoria');
                inputNombre.value = nombreActual;
                inputDesc.value = descActual;

                // CAMBIAMOS EL ESTADO GLOBAL
                // Al poner un número aquí, el formulario sabe que ya no está creando, sino editando.
                categoriaIdEditando = id;

                // Cambiamos los textos para dar feedback visual
                const btnSubmit = document.querySelector('#formAddCategoria button[type="submit"]');
                btnSubmit.textContent = 'Actualizar';
                document.getElementById('btnCancelar').style.display = 'inline-block';
                
                // MEDIDA DE PREVENCIÓN: Bloqueamos la tabla
                // Deshabilitamos los demás botones de editar/borrar de la tabla para que el admin
                // no pulse varios a la vez y vuelva loco al formulario.
                let botonesTabla = document.querySelectorAll('.btn-edit, .btn-delete');
                botonesTabla.forEach(botonTabla => {
                    botonTabla.disabled = true;
                    botonTabla.style.opacity = '0.5';
                });

                // Llevamos el cursor al input automáticamente por usabilidad
                inputNombre.focus();
            });
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3">Error al cargar: ${error.message}</td></tr>`;
    }
}