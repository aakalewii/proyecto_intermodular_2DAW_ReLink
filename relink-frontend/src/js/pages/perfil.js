import { renderNavbar } from '../components/Navbar.js'; // Revisa que sea Navbar.js o navBar.js según tu proyecto
import { getMiPerfil, updatePerfil } from '../services/perfil.js';
import { getLocalidades } from '../services/ubicaciones.js'; 
// AÑADIDO: Importamos la función para borrar anuncios de tu servicio
import { deleteAnuncio } from '../services/anuncios.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // Cargamos el navbar
    renderNavbar();

    // Comprobamos seguridad
    const token = localStorage.getItem('relink_token');
    if (!token) {
        window.location.href = '/login.html';
        return; 
    }

    // Variable global para guardar los datos que vienen de la base de datos
    let datosUsuarioActual = null; 

    // Referencias a los bloques de lectura y edicion
    const bloqueLectura = document.getElementById('bloque-lectura');
    const formEditar = document.getElementById('form-editar');

    // --- CARGA INICIAL DE LA PÁGINA ---
    try {
        const respuesta = await getMiPerfil();
        datosUsuarioActual = respuesta.datos;
        
        // Pintamos la información
        pintarDatosLectura(datosUsuarioActual);
        pintarMisAnuncios(datosUsuarioActual.anuncios);

    } catch (error) {
        console.error("Error al cargar perfil:", error);
        alert("Hubo un problema al cargar tu perfil. Revisa la consola.");
    }

    // --- LÓGICA DE LOS BOTONES ---

    // Al darle a "Editar Perfil"
    document.getElementById('btn-editar').addEventListener('click', async () => {
        
        // Escondemos textos, mostramos formulario
        bloqueLectura.style.display = 'none';
        formEditar.style.display = 'flex';

        // Rellenar Nombre
        document.getElementById('edit-nombre').value = datosUsuarioActual.nombre;

        // Rellenar Apellidos
        if (datosUsuarioActual.apellidos !== null) {
            document.getElementById('edit-apellidos').value = datosUsuarioActual.apellidos;
        } else {
            document.getElementById('edit-apellidos').value = "";
        }

        // Rellenar Teléfono
        if (datosUsuarioActual.telefono !== null) {
            document.getElementById('edit-telefono').value = datosUsuarioActual.telefono;
        } else {
            document.getElementById('edit-telefono').value = "";
        }

        // Cargar el desplegable de localidades
        try {
            const resLocalidades = await getLocalidades();
            const selectLocalidad = document.getElementById('edit-localidad');
            
            // Empezamos con la opción vacía
            selectLocalidad.innerHTML = '<option value="">Selecciona una localidad...</option>';
            
            // Llenamos el desplegable usando un IF normal para marcar la seleccionada
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

    // Al darle a "Cancelar"
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        formEditar.style.display = 'none';
        bloqueLectura.style.display = 'block';
    });


    // --- GUARDAR LOS CAMBIOS ---
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        // Leer la localidad elegida
        const localidadValue = document.getElementById('edit-localidad').value;
        let idLocalidadEnviar;
        
        // Si no eligió nada, mandamos null, si no, mandamos el número
        if (localidadValue === "") {
            idLocalidadEnviar = null;
        } else {
            idLocalidadEnviar = localidadValue;
        }

        // Preparar el paquete para Laravel
        const nuevosDatos = {
            name: document.getElementById('edit-nombre').value,
            apellidos: document.getElementById('edit-apellidos').value,
            telefono: document.getElementById('edit-telefono').value,
            localidad_id: idLocalidadEnviar
        };

        try {
            // Enviar los datos
            const respuestaActualizacion = await updatePerfil(nuevosDatos);
            const userActualizado = respuestaActualizacion.data;
            
            // Guardar los datos nuevos en nuestra variable local
            datosUsuarioActual.nombre = userActualizado.name;
            datosUsuarioActual.apellidos = userActualizado.apellidos;
            
            // Para el nombre completo, revisamos si hay apellidos
            if (userActualizado.apellidos !== null) {
                datosUsuarioActual.nombre_completo = userActualizado.name + ' ' + userActualizado.apellidos;
            } else {
                datosUsuarioActual.nombre_completo = userActualizado.name;
            }
            
            datosUsuarioActual.telefono = userActualizado.telefono;
            
            // Si Laravel nos devolvió la ciudad, la guardamos
            if (userActualizado.localidad) {
                datosUsuarioActual.localidad_nombre = userActualizado.localidad.nombre;
                datosUsuarioActual.localidad_id = userActualizado.localidad.id;
            }

            // Repintar textos y ocultar formulario
            pintarDatosLectura(datosUsuarioActual);
            formEditar.style.display = 'none';
            bloqueLectura.style.display = 'block';

            // Actualizar el navbar
            localStorage.setItem('relink_user', JSON.stringify(userActualizado));
            renderNavbar();

        } catch (error) {
            alert("Hubo un error al guardar los datos: " + error.message);
        }
    });


    // --- FUNCIONES PARA PINTAR ---

    function pintarDatosLectura(user) {
        document.getElementById('perf-nombre').textContent = user.nombre_completo;
        document.getElementById('perf-email').textContent = user.email;
        
        // Pintar teléfono
        if (user.telefono !== null) {
            document.getElementById('perf-telefono').textContent = user.telefono;
        } else {
            document.getElementById('perf-telefono').textContent = "No especificado";
        }

        // Pintar localidad
        if (user.localidad_nombre) {
            document.getElementById('perf-localidad').textContent = user.localidad_nombre;
        } else {
            document.getElementById('perf-localidad').textContent = "No definida";
        }
    }

    function pintarMisAnuncios(anuncios) {
        const listaAnuncios = document.getElementById('mis-anuncios-lista');
        listaAnuncios.innerHTML = ''; 

        if (anuncios.length === 0) {
            listaAnuncios.innerHTML = '<p>Aún no has publicado ningún anuncio.</p>';
            return; 
        }

        anuncios.forEach(anuncio => {
            const card = document.createElement('div');
            card.style.border = "1px solid #eee";
            card.style.padding = "10px";
            card.style.borderRadius = "5px";

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
            
            // --- LÓGICA DEL BOTÓN DE BORRAR ---
            const btnBorrar = card.querySelector('.btn-borrar'); 
            
            btnBorrar.addEventListener('click', async () => {
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
                        alert("No se pudo borrar el anuncio: " + error.message);
                        btnBorrar.innerHTML = `<i class="fa-solid fa-trash"></i> Borrar`;
                        btnBorrar.disabled = false;
                    }
                }
            });
            // ----------------------------------

            listaAnuncios.appendChild(card);
        });
    }
});