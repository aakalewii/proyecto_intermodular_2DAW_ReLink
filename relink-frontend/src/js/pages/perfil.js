import { renderNavbar } from '../components/navBar.js';
import { getMiPerfil, updatePerfil } from '../services/perfil.js';
import { getLocalidades } from '../services/ubicaciones.js'; 
import { deleteAnuncio, marcarComoVendido } from '../services/anuncios.js';
import { forzarCierreSesion, verificarAccesoUsuario } from '../services/auth.js';


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

    const tabPublicados = document.getElementById('tab-publicados');
    const tabVendidos = document.getElementById('tab-vendidos');
    const tabHistorial = document.getElementById('tab-historial');

    const puedePasar = await verificarAccesoUsuario();

    // --- CARGA INICIAL DE LA PÁGINA ---
    if (puedePasar) {
        
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
            
            console.log(datosUsuarioActual.anuncios)
            // Enviamos los datos a las funciones que se encargan de inyectar el HTML
            pintarDatosLectura(datosUsuarioActual);
            filtrarYPintarPestana('publicados');

        } catch (error) {
            console.error("Error al cargar perfil:", error);
            
            forzarCierreSesion(); 
        }
    }

    // --- LÓGICA DE LOS BOTONES DE INTERFAZ ---

    // Evento: Al darle al botón "Editar Perfil"
    document.getElementById('btn-editar').addEventListener('click', async () => {
        
        // Cambiamos las "vistas": ocultamos el texto estático y mostramos el formulario
        bloqueLectura.style.display = 'none';
        formEditar.style.display = 'block';

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

        // Recuperamos la ruta base de las imágenes igual que en el index
        const URL_BACKEND_STORAGE = 'http://localhost:5500/storage/';

        anuncios.forEach(anuncio => {
            const card = document.createElement('div');
            
            // Usamos la misma clase en línea que en el index
            card.className = 'anuncio-card';

            // Comprobamos si el anuncio ya está vendido
            const estaVendido = anuncio.estado === 'vendido';
            const backgroundStyle = estaVendido ? 'background-color: #f8f9fa; opacity: 0.8;' : '';

            card.style = `border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 8px; display: flex; flex-direction: column; justify-content: space-between; ${backgroundStyle}`;

            // Lógica de fallback de la imagen
            let rutaImagen;
            if (anuncio.imagenes && anuncio.imagenes.length > 0) {
                rutaImagen = `${URL_BACKEND_STORAGE}${anuncio.imagenes[0].url}`;
            } else {
                rutaImagen = `${URL_BACKEND_STORAGE}anuncios/default1.jpg`;
            }

            // Si la fecha viene nula por algún motivo, usamos un fallback a la fecha de creación
            const fecha = anuncio.fecha_publi ? anuncio.fecha_publi : anuncio.created_at;

            // Preparamos el HTML del botón de vendido o el texto si ya está vendido
            const htmlBotonVendido = estaVendido
            ? `<span style="
                display: inline-flex; align-items: center; gap: 5px;
                padding: 5px 12px;
                background: #e8f5ee; color: #1a6647;
                border: 1px solid #b6dece;
                border-radius: 8px;
                font-size: 12px; font-weight: 500;
                margin-left: auto;
               ">
                <i class="fa-solid fa-circle-check"></i> Vendido
               </span>`
            : `<button class="btn-vendido" style="
                display: inline-flex; align-items: center; gap: 5px;
                padding: 5px 12px;
                background: #fff8ee; color: #92580a;
                border: 1px solid #f5d9a8;
                border-radius: 8px;
                font-family: 'DM Sans', sans-serif;
                font-size: 12px; font-weight: 500;
                cursor: pointer; margin-left: auto;
                transition: opacity 0.2s;
               ">
                <i class="fa-solid fa-handshake"></i> Marcar como vendido
               </button>`;


               let htmlBotones = '';

            if (anuncio.estado === 'publicado') {
                htmlBotones = `
                    <a href="/editar-anuncio.html?id=${anuncio.id}" style="color: #28a745; text-decoration: none;">
                        <i class="fa-solid fa-pen"></i> Editar
                    </a>
                    
                    <button class="btn-borrar" style="color: red; cursor: pointer; background: none; border: none; padding: 0; font-size: 16px;">
                        <i class="fa-solid fa-trash"></i> Borrar
                    </button>

                    ${htmlBotonVendido}
                `;
            } else if (anuncio.estado === 'vendido') {
                // Si está vendido, NO hay botón de borrar ni editar. Solo la etiqueta.
                htmlBotones = `
                    ${htmlBotonVendido}
                `;
            } else if (anuncio.estado === 'eliminado') {
                // Si está eliminado, le ponemos una etiqueta roja (o lo que tú prefieras aquí)
                htmlBotones = `
                    <span style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; background: #ffe6e6; color: #cc0000; border: 1px solid #ffb3b3; border-radius: 8px; font-size: 12px; font-weight: 500; margin-left: auto;">
                        <i class="fa-solid fa-trash-can"></i> Eliminado
                    </span>
                `;
            }

            // Inyectamos el diseño
            card.innerHTML = `
                <div style="cursor: pointer;" onclick="window.location.href='/ver-anuncio.html?id=${anuncio.id}'">
                    <div>
                        <img src="${rutaImagen}" alt="${anuncio.titulo}" style="max-width: 100%; border-radius: 4px;"/>
                    </div>
                    <h3 style="margin: 10px 0 5px 0;">${anuncio.titulo}</h3>
                    <p style="margin: 0 0 5px 0;"><strong>${anuncio.precio} €</strong></p>
                    <small>Publicado el: ${new Date(fecha).toLocaleDateString()}</small>
                </div>
                
                <div class="contenedor-acciones" style="display: flex; gap: 15px; align-items: center; margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px;">
                    ${htmlBotones}
                </div>
            `;
            
            // --- LÓGICA DEL BOTÓN DE BORRAR ANUNCIO ---
            const btnBorrar = card.querySelector('.btn-borrar'); 
            
            if (btnBorrar) {
                btnBorrar.addEventListener('click', async (e) => {

                if (confirm(`¿Seguro que quieres borrar el anuncio "${anuncio.titulo}"?`)) {
                    try {
                        btnBorrar.innerHTML = "Borrando...";
                        btnBorrar.disabled = true;

                        await deleteAnuncio(anuncio.id);
                        
                        card.remove();

                        if (listaAnuncios.children.length === 0) {
                            listaAnuncios.innerHTML = '<p>Aún no has publicado ningún anuncio.</p>';
                        }

                    } catch (error) {
                        if (error.message.includes('401')) {
                            forzarCierreSesion();
                            return;
                        }

                        alert("No se pudo borrar el anuncio: " + error.message);
                        btnBorrar.innerHTML = `<i class="fa-solid fa-trash"></i> Borrar`;
                        btnBorrar.disabled = false;
                    }
                }
            });
            }

            const btnVendido = card.querySelector('.btn-vendido');
            if (btnVendido) {
                btnVendido.addEventListener('click', async (e) => {
                    e.stopPropagation(); 

                    if (confirm(`¡Enhorabuena! ¿Seguro que quieres marcar "${anuncio.titulo}" como vendido? Esta acción no se puede deshacer.`)) {
                        try {
                            btnVendido.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Procesando...`;
                            btnVendido.disabled = true;

                            // Llamamos a la base de datos
                            await marcarComoVendido(anuncio.id);
                            
                            // Efectos visuales de que ya está vendido
                            card.style.backgroundColor = '#f8f9fa';
                            card.style.opacity = '0.8';
                            
                            // Buscamos el contenedor, borramos el botón y ponemos tu NUEVO span verde
                            const contenedorAcciones = card.querySelector('.contenedor-acciones');
                            btnVendido.remove();
                            
                            contenedorAcciones.innerHTML += `
                                <span style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; background: #e8f5ee; color: #1a6647; border: 1px solid #b6dece; border-radius: 8px; font-size: 12px; font-weight: 500; margin-left: auto;">
                                    <i class="fa-solid fa-circle-check"></i> Vendido
                                </span>
                            `;

                        } catch (error) {
                            if (error.message.includes('401')) {
                                forzarCierreSesion();
                                return;
                            }
                            alert("Hubo un error al vender: " + error.message);
                            btnVendido.innerHTML = `<i class="fa-solid fa-handshake"></i> Marcar como vendido`;
                            btnVendido.disabled = false;
                        }
                    }
                });
            }

            listaAnuncios.appendChild(card);
        });
    }

    // Función que filtra el array de anuncios y lo manda a la funcionde pintar
    function filtrarYPintarPestana(filtro) {
        // Le quitamos el color verde a todos los botones
        tabPublicados.classList.remove('activo');
        tabVendidos.classList.remove('activo');
        tabHistorial.classList.remove('activo');

        let anunciosFiltrados = [];

        // Filtramos y pintamos el botón seleccionado
        if (filtro === 'publicados') {
            tabPublicados.classList.add('activo');
            // Nos quedamos con los publicados
            anunciosFiltrados = datosUsuarioActual.anuncios.filter(a => a.estado ==='publicado');
        
        } else if (filtro === 'vendidos') {
            tabVendidos.classList.add('activo');
            // Nos quedamos solo con los vendidos
            anunciosFiltrados = datosUsuarioActual.anuncios.filter(a => a.estado === 'vendido');
        
        } else if (filtro === 'historial') {
            tabHistorial.classList.add('activo');
            // Nos quedamos con los eliminados
            anunciosFiltrados = datosUsuarioActual.anuncios.filter(a => a.estado === 'eliminado');
        }

        // Llamamos a tu función de siempre, pero pasándole un parámetro extra ("filtro")
        // para que sepa qué botones tiene que ocultar.
        pintarMisAnuncios(anunciosFiltrados, filtro);
    }

    tabPublicados.addEventListener('click', () => filtrarYPintarPestana('publicados'));
    tabVendidos.addEventListener('click', () => filtrarYPintarPestana('vendidos'));
    tabHistorial.addEventListener('click', () => filtrarYPintarPestana('historial'));
});