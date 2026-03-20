import { renderNavbar } from '../components/navBar.js';
import { getMiPerfil, updatePerfil } from '../services/perfil.js';
import { getLocalidades } from '../services/ubicaciones.js'; 
import { deleteAnuncio } from '../services/anuncios.js';
import { forzarCierreSesion } from '../services/auth.js';


/*
   PANTALLA: MI PERFIL
   Este script se encarga de mostrar los datos personales del usuario, permitirle editarlos,
   y listar todos los anuncios que tiene activos, dándole la opción de borrarlos o ir a editarlos.
*/

document.addEventListener('DOMContentLoaded', async () => {
    
    // CARGA INICIAL Y SEGURIDAD
    renderNavbar();

    // Comprobamos si hay un token. Si un visitante anónimo intenta entrar tecleando /perfil.html, lo echamos.
    const token = localStorage.getItem('relink_token');
    if (!token) {
        window.location.href = '/login.html';
        return; 
    }

    // VARIABLE DE ESTADO GLOBAL:
    // Aquí guardaremos todo lo que nos devuelva la base de datos para no tener que estar
    // pidiendo los mismos datos al servidor cada vez que el usuario le dé a "Cancelar" o "Editar".
    let datosUsuarioActual = null;

    // Referencias a los dos "modos" visuales de la pantalla (Lectura vs Edición)
    const bloqueLectura = document.getElementById('bloque-lectura');
    const formEditar = document.getElementById('form-editar');

    // --- CARGA INICIAL DE LA PÁGINA ---
    try {
        // Llamamos al ProfileController del backend (que usa Eager Loading para traer los anuncios)
        const respuesta = await getMiPerfil();

        if (respuesta.status === 401) {
            forzarCierreSesion();
            return; 
        }

        if (respuesta.status === 403) {
            // Lo mandamos a la pantalla amistosa SIN borrarle el token de su navegador
            window.location.href = '/email-revisar-bandeja.html';
            return;
        }

        datosUsuarioActual = respuesta.datos;
        
        // Enviamos los datos a las funciones que se encargan de inyectar el HTML
        pintarDatosLectura(datosUsuarioActual);
        pintarMisAnuncios(datosUsuarioActual.anuncios);

    } catch (error) {
        console.error("Error al cargar perfil:", error);
        
        forzarCierreSesion(); 
    }

    // --- LÓGICA DE LOS BOTONES DE INTERFAZ ---

    // Evento: Al darle al botón "Editar Perfil"
    document.getElementById('btn-editar').addEventListener('click', async () => {
        
        // Cambiamos las "vistas": ocultamos el texto estático y mostramos el formulario
        bloqueLectura.style.display = 'none';
        formEditar.style.display = 'flex';

        // Rellenamos las cajas de texto con los datos que ya teníamos guardados en memoria
        document.getElementById('edit-nombre').value = datosUsuarioActual.nombre;

        // Comprobamos los nulos para no pintar la palabra "null" literalmente en el input
        if (datosUsuarioActual.apellidos !== null) {
            document.getElementById('edit-apellidos').value = datosUsuarioActual.apellidos;
        } else {
            document.getElementById('edit-apellidos').value = "";
        }

        if (datosUsuarioActual.telefono !== null) {
            document.getElementById('edit-telefono').value = datosUsuarioActual.telefono;
        } else {
            document.getElementById('edit-telefono').value = "";
        }

        // Cargar el desplegable de localidades dinámicamente
        try {
            const resLocalidades = await getLocalidades();
            const selectLocalidad = document.getElementById('edit-localidad');
            
            selectLocalidad.innerHTML = '<option value="">Selecciona una localidad...</option>';
            
            // Recorremos las localidades y, si coincide con la del usuario, le añadimos 'selected'
            // para que el desplegable ya aparezca marcado en su pueblo actual.
            resLocalidades.forEach(loc => {
                let opcionSeleccionada = "";
                
                if (loc.id === datosUsuarioActual.localidad_id) {
                    opcionSeleccionada = "selected";
                }

                selectLocalidad.innerHTML += `<option value="${loc.id}" ${opcionSeleccionada}>${loc.nombre}</option>`;
            });
            
        } catch (e) {
            console.error("No se pudieron cargar las localidades", e);
        }
    });

    // Evento: Al darle a "Cancelar" devolvemos todo a la vista de lectura sin guardar nada
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        formEditar.style.display = 'none';
        bloqueLectura.style.display = 'block';
    });


    // --- EVENTO PRINCIPAL: GUARDAR LOS CAMBIOS DEL PERFIL ---
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        // Leer la localidad elegida
        const localidadValue = document.getElementById('edit-localidad').value;

        // Empaquetamos los datos en formato JSON para mandarlos a Laravel
        const nuevosDatos = {
            name: document.getElementById('edit-nombre').value,
            apellidos: document.getElementById('edit-apellidos').value,
            telefono: document.getElementById('edit-telefono').value,
            localidad_id: localidadValue
        };

        try {
            // Llamamos a la API para hacer el UPDATE en la base de datos
            const respuestaActualizacion = await updatePerfil(nuevosDatos);
            
            // El backend nos devuelve el usuario ya actualizado
            const userActualizado = respuestaActualizacion.data;
            
            // Actualizamos nuestra variable local para que no se quede desfasada
            datosUsuarioActual.nombre = userActualizado.name;
            datosUsuarioActual.apellidos = userActualizado.apellidos;
            
            // Reconstruimos el nombre completo
            if (userActualizado.apellidos !== null) {
                datosUsuarioActual.nombre_completo = userActualizado.name + ' ' + userActualizado.apellidos;
            } else {
                datosUsuarioActual.nombre_completo = userActualizado.name;
            }
            
            datosUsuarioActual.telefono = userActualizado.telefono;
            
            // Si Laravel nos devolvió la relación de la localidad, la guardamos
            if (userActualizado.localidad) {
                datosUsuarioActual.localidad_nombre = userActualizado.localidad.nombre;
                datosUsuarioActual.localidad_id = userActualizado.localidad.id;
            }

            // Ocultamos el formulario y volvemos a pintar los textos estáticos, ahora con los datos nuevos
            pintarDatosLectura(datosUsuarioActual);
            formEditar.style.display = 'none';
            bloqueLectura.style.display = 'block';

            // Actualizamos la "sesión" del navegador y repintamos la barra de arriba.
            localStorage.setItem('relink_user', JSON.stringify(userActualizado));
            renderNavbar();

        } catch (error) {
            if (error.message.includes('401')) {
                forzarCierreSesion();
                return;
            } else {
                alert("Hubo un error al guardar los datos: " + error.message);
            }
        }
    });


    // --- FUNCIONES PARA PINTAR EN PANTALLA ---

    // Esta función inyecta los datos de texto en los <span> del bloque de lectura
    function pintarDatosLectura(user) {
        document.getElementById('perf-nombre').textContent = user.nombre_completo;
        document.getElementById('perf-email').textContent = user.email;
        
        if (user.telefono !== null) {
            document.getElementById('perf-telefono').textContent = user.telefono;
        } else {
            document.getElementById('perf-telefono').textContent = "No especificado";
        }

        if (user.localidad_nombre) {
            document.getElementById('perf-localidad').textContent = user.localidad_nombre;
        } else {
            document.getElementById('perf-localidad').textContent = "No definida";
        }
    }

    // Esta función genera las "tarjetas" (cards) de los anuncios del usuario
    function pintarMisAnuncios(anuncios) {
        const listaAnuncios = document.getElementById('mis-anuncios-lista');
        listaAnuncios.innerHTML = ''; 

        if (anuncios.length === 0) {
            listaAnuncios.innerHTML = '<p>Aún no has publicado ningún anuncio.</p>';
            return; 
        }

        anuncios.forEach(anuncio => {
            // Creamos la caja del anuncio dinámicamente
            const card = document.createElement('div');
            card.style.border = "1px solid #eee";
            card.style.padding = "10px";
            card.style.borderRadius = "5px";

            // Inyectamos el HTML interno con los enlaces dinámicos (pasando la ID por la URL)
            card.innerHTML = `
                <h4 style="margin: 0 0 5px 0;">${anuncio.titulo}</h4>
                <p style="margin: 0 0 10px 0;">Precio: <strong>${anuncio.precio}€</strong></p>
                
                <div style="display: flex; gap: 15px; align-items: center;">
                    <a href="/ver-anuncio.html?id=${anuncio.id}" style="color: #007bff; text-decoration: none;">Ver detalle</a>
                    
                    <a href="/editar-anuncio.html?id=${anuncio.id}" style="color: #28a745; text-decoration: none;">
                        <i class="fa-solid fa-pen"></i> Editar Anuncio
                    </a>
                    
                    <button class="btn-borrar" style="color: red; cursor: pointer; background: none; border: none; padding: 0; font-size: 16px;">
                        <i class="fa-solid fa-trash"></i> Borrar
                    </button>
                </div>
            `;
            
            // --- LÓGICA DEL BOTÓN DE BORRAR ANUNCIO ---
            // Le añadimos el escuchador de eventos al botón de la basura específico de esta tarjeta
            const btnBorrar = card.querySelector('.btn-borrar'); 
            
            btnBorrar.addEventListener('click', async () => {
                // Confirmación nativa de seguridad
                if (confirm(`¿Seguro que quieres borrar el anuncio "${anuncio.titulo}"?`)) {
                    try {
                        // Feedback visual mientras contactamos con la API
                        btnBorrar.innerHTML = "Borrando...";
                        btnBorrar.disabled = true;

                        // Llamada de borrado al backend
                        await deleteAnuncio(anuncio.id);
                        
                        // Si el backend borra con éxito (HTTP 200), destruimos la tarjeta del DOM
                        // sin tener que recargar la página entera.
                        card.remove();

                        // Si al borrar esta tarjeta, la lista se queda vacía, mostramos el mensaje de "No hay anuncios"
                        if (listaAnuncios.children.length === 0) {
                            listaAnuncios.innerHTML = '<p>Aún no has publicado ningún anuncio.</p>';
                        }

                    } catch (error) {

                        if (error.message.includes('401')) {
                            forzarCierreSesion();
                            return;
                        }

                        alert("No se pudo borrar el anuncio: " + error.message);
                        // Si falla, restauramos el botón a la normalidad
                        btnBorrar.innerHTML = `<i class="fa-solid fa-trash"></i> Borrar`;
                        btnBorrar.disabled = false;
                    }
                }
            });

            listaAnuncios.appendChild(card);
        });
    }
});