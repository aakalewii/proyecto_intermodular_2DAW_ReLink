import { renderNavbar } from '../../components/navBar.js';
// Importamos las funciones que hablan con el backend
import { getUsuarios, updateUsuarioComoAdmin, getDashboardStats } from '../../services/usuarios.js';
import { verificarAccesoAdmin } from '../../services/auth.js';

/*
   PANTALLA: GESTIÓN DE USUARIOS (ADMIN)
   Este script controla la lista de usuarios, las estadísticas y la edición.
   El formulario está oculto por defecto y solo aparece al pulsar "Editar" en una fila.
*/

// VARIABLE DE ESTADO GLOBAL:
// Guarda el ID del usuario que estamos modificando actualmente.
let usuarioIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {

    if (!verificarAccesoAdmin()) {
        return; 
    }

    renderNavbar();
    cargarEstadisticas(); // Cargamos los números del resumen superior
    cargarTablaUsuarios(); // Pintamos la tabla nada más entrar

    // CAPTURA DEL DOM
    const seccionEditar = document.getElementById('seccion-editar-usuario');
    const formEditarUsuario = document.getElementById('form-editar-usuario');
    const errorMsg = document.getElementById('edit-error-message');
    
    // Inputs del formulario
    const inputName = document.getElementById('edit-name');
    const inputApellidos = document.getElementById('edit-apellidos');
    const inputEmail = document.getElementById('edit-email');
    const inputTelefono = document.getElementById('edit-telefono');
    const selectRol = document.getElementById('edit-rol');
    const selectEstado = document.getElementById('edit-estado');
    
    const btnSubmit = document.getElementById('btn-guardar-usuario');
    const btnCancelar = document.getElementById('btnCancelar');

    // --- BOTÓN CANCELAR ---
    // Oculta el formulario y reactiva la tabla
    btnCancelar.addEventListener('click', () => {
        resetFormulario();
    });

    // --- ENVIAR EL FORMULARIO (Submit) ---
    formEditarUsuario.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        
        // Empaquetamos los datos leyendo los inputs y selects
        const userData = {
            name: inputName.value,
            apellidos: inputApellidos.value,
            email: inputEmail.value,
            telefono: inputTelefono.value,
            rol: selectRol.value,
            estado: selectEstado.value
        };

        // Cambiamos el texto del botón para dar feedback de carga
        const textoOriginal = btnSubmit.textContent;
        btnSubmit.textContent = 'Guardando...';
        btnSubmit.disabled = true;

        try {
            // MODO EDITAR: Llamamos a la API por PUT pasando el ID global
            await updateUsuarioComoAdmin(usuarioIdEditando, userData);

            // Si el backend da el OK, limpiamos todo y repintamos
            resetFormulario();
            cargarTablaUsuarios();
            cargarEstadisticas(); // Recargamos por si hemos cambiado a alguien a 'baneado' o 'pro'

        } catch (error) {
            // Si el backend falla (ej: formato de email inválido), pintamos el error
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        } finally {
            // Restauramos el botón
            btnSubmit.textContent = textoOriginal;
            btnSubmit.disabled = false;
        }
    });

    // --- FUNCIÓN PARA LIMPIAR Y OCULTAR EL FORMULARIO ---
    function resetFormulario() {
        usuarioIdEditando = null;
        formEditarUsuario.reset(); // Vacía todos los inputs y selects de golpe
        errorMsg.style.display = 'none';
        seccionEditar.style.display = 'none'; // Escondemos el bloque entero

        // Reactivamos los botones de editar/borrar de la tabla
        let botonesTabla = document.querySelectorAll('.btn-edit, .btn-delete');
        botonesTabla.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
});


// --- FUNCIÓN PARA CARGAR LAS TARJETAS DE ESTADÍSTICAS ---
async function cargarEstadisticas() {
    try {
        const stats = await getDashboardStats();
        
        // Mapeamos cada ID del HTML con la clave exacta que devuelve tu backend de Laravel
        document.getElementById('stat-total-usuarios').textContent = stats.total_usuarios || '0';
        document.getElementById('stat-clientes').textContent = stats.total_clientes || '0';
        document.getElementById('stat-admins').textContent = stats.total_admins || '0';
        document.getElementById('stat-online').textContent = stats.online || '0';
        document.getElementById('stat-activos').textContent = stats.activos || '0';
        document.getElementById('stat-bloqueados').textContent = stats.bloqueados || '0';
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}


// --- FUNCIÓN PARA PINTAR LA TABLA DINÁMICAMENTE ---
async function cargarTablaUsuarios() {
    const tbody = document.getElementById('tablaUsuarios');
    
    try {
        // Pedimos los datos frescos al backend
        const usuarios = await getUsuarios();
        tbody.innerHTML = ''; // Vaciamos la tabla vieja

        // Si la tabla está vacía
        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay usuarios registrados.</td></tr>';
            return;
        }

        // BUCLE: Pintamos fila por fila
        usuarios.forEach(user => {
            const tr = document.createElement('tr');
            
            // Inyectamos todos los datos necesarios en atributos `data-*` para recuperarlos al pulsar Editar
            tr.innerHTML = `
                <td>${user.name} ${user.apellidos || ''}</td>
                <td>${user.email}</td>
                <td style="text-transform: uppercase; font-size: 0.85em;"><b>${user.rol}</b></td>
                <td style="text-transform: uppercase; font-size: 0.85em;"><b>${user.estado}</b></td>
                <td>
                    <button class="btn-edit" 
                        data-id="${user.id}" 
                        data-name="${user.name}" 
                        data-apellidos="${user.apellidos || ''}" 
                        data-email="${user.email}" 
                        data-telefono="${user.telefono || ''}" 
                        data-rol="${user.rol}" 
                        data-estado="${user.estado}">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // --- EVENTOS PARA LOS BOTONES DE LA TABLA ---

        // Botones de EDITAR
        let botonesEditar = document.querySelectorAll('.btn-edit');
        botonesEditar.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const boton = e.currentTarget;
                
                // Extraemos todos los datos de la fila
                usuarioIdEditando = boton.getAttribute('data-id');
                const name = boton.getAttribute('data-name');
                const apellidos = boton.getAttribute('data-apellidos');
                const email = boton.getAttribute('data-email');
                const telefono = boton.getAttribute('data-telefono');
                const rol = boton.getAttribute('data-rol');
                const estado = boton.getAttribute('data-estado');
                
                // Rellenamos el formulario superior
                document.getElementById('edit-name').value = name;
                document.getElementById('edit-apellidos').value = apellidos;
                document.getElementById('edit-email').value = email;
                document.getElementById('edit-telefono').value = telefono;
                document.getElementById('edit-rol').value = rol;
                document.getElementById('edit-estado').value = estado;

                // Mostramos el formulario de edición
                document.getElementById('seccion-editar-usuario').style.display = 'block';
                
                // Bloqueamos la tabla para evitar que pinchen en otro sitio
                let botonesTabla = document.querySelectorAll('.btn-edit, .btn-delete');
                botonesTabla.forEach(botonTabla => {
                    botonTabla.disabled = true;
                    botonTabla.style.opacity = '0.5';
                });

                // Llevamos el foco al primer input y hacemos un scroll suave hacia el formulario
                document.getElementById('edit-name').focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error al cargar usuarios: ${error.message}</td></tr>`;
    }
}