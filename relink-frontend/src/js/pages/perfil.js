import { renderNavbar } from '../components/Navbar.js';
import { getMiPerfil, updatePerfil } from '../services/perfil.js';
import { getLocalidades } from '../services/ubicaciones.js'; 

document.addEventListener('DOMContentLoaded', async () => {
    // Cargamos el navbar y comprobamos seguridad
    renderNavbar();

    const token = localStorage.getItem('relink_token');
    if (!token) {
        window.location.href = '/login.html';
        return; 
    }

    // Guardamos los datos globales para reutilizarlos en el formulario
    let datosUsuarioActual = null; 

    // --- CARGA INICIAL DE LA PÁGINA ---
    try {
        const respuesta = await getMiPerfil();
        datosUsuarioActual = respuesta.datos;
        
        // Pintamos los textos del perfil
        pintarDatosLectura(datosUsuarioActual);
        
        // Pintamos las tarjetas de los anuncios
        pintarMisAnuncios(datosUsuarioActual.anuncios);

    } catch (error) {
        console.error("Error al cargar perfil:", error);
        alert("Hubo un problema al cargar tu perfil. Revisa la consola.");
    }

    // --- LÓGICA DE EDICIÓN DE PERFIL ---
    const bloqueLectura = document.getElementById('bloque-lectura');
    const formEditar = document.getElementById('form-editar');

    // Botón "Editar Perfil"
    document.getElementById('btn-editar').addEventListener('click', async () => {
        bloqueLectura.style.display = 'none';
        formEditar.style.display = 'flex';

        // Rellenamos los inputs con lo que ya sabemos
        document.getElementById('edit-nombre').value = datosUsuarioActual.name;
        document.getElementById('edit-apellidos').value = datosUsuarioActual.apellidos || '';
        document.getElementById('edit-telefono').value = datosUsuarioActual.telefono || '';

        // Cargamos el desplegable de localidades
        try {
            const resLocalidades = await getLocalidades();
            const selectLocalidad = document.getElementById('edit-localidad');
            selectLocalidad.innerHTML = '<option value="">Selecciona una localidad...</option>';
            
            resLocalidades.forEach(loc => {
                const isSelected = loc.id === datosUsuarioActual.localidad_id ? 'selected' : '';
                selectLocalidad.innerHTML += `<option value="${loc.id}" ${isSelected}>${loc.nombre}</option>`;
            });
        } catch (e) {
            console.error("No se pudieron cargar las localidades", e);
        }
    });

    // Botón "Cancelar"
    document.getElementById('btn-cancelar').addEventListener('click', () => {
        formEditar.style.display = 'none';
        bloqueLectura.style.display = 'block';
    });

    // Guardar los cambios (Submit del formulario)
    formEditar.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        // Capturamos el valor de la localidad
        const localidadValue = document.getElementById('edit-localidad').value;

        const nuevosDatos = {
            name: document.getElementById('edit-nombre').value,
            apellidos: document.getElementById('edit-apellidos').value,
            telefono: document.getElementById('edit-telefono').value,
            // Si está vacío, mandamos null. Si tiene número, mandamos el número.
            localidad_id: localidadValue === "" ? null : localidadValue
        };

        try {
            const respuestaActualizacion = await updatePerfil(nuevosDatos);
            
            // Refrescamos nuestra variable local con lo que devuelve Laravel
            datosUsuarioActual.name = respuestaActualizacion.data.name;
            datosUsuarioActual.apellidos = respuestaActualizacion.data.apellidos;
            datosUsuarioActual.nombre_completo = respuestaActualizacion.data.name + ' ' + (respuestaActualizacion.data.apellidos || '');
            datosUsuarioActual.telefono = respuestaActualizacion.data.telefono;
            
            if(respuestaActualizacion.data.localidad) {
                datosUsuarioActual.localidad_nombre = respuestaActualizacion.data.localidad.nombre;
                datosUsuarioActual.localidad_id = respuestaActualizacion.data.localidad.id;
            }

            // Repintamos y cerramos
            pintarDatosLectura(datosUsuarioActual);
            formEditar.style.display = 'none';
            bloqueLectura.style.display = 'block';

            // Actualizamos también el nombre en el navbar para que coincida
            localStorage.setItem('relink_user', JSON.stringify(respuestaActualizacion.data));
            renderNavbar();

            alert("¡Perfil actualizado correctamente!");

        } catch (error) {
            alert("Hubo un error al guardar los datos: " + error.message);
        }
    });

    // --- BLOQUE 3: FUNCIONES AUXILIARES ---

    function pintarDatosLectura(user) {
        document.getElementById('perf-nombre').textContent = user.nombre_completo;
        document.getElementById('perf-email').textContent = user.email;
        document.getElementById('perf-telefono').textContent = user.telefono || 'No especificado';
        document.getElementById('perf-localidad').textContent = user.localidad_nombre || 'No definida';
    }

    function pintarMisAnuncios(anuncios) {
        const listaAnuncios = document.getElementById('mis-anuncios-lista');
        listaAnuncios.innerHTML = ''; 

        if (!anuncios || anuncios.length === 0) {
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
                <a href="/ver-anuncio.html?id=${anuncio.id}" style="margin-right: 10px;">Ver detalle</a>
                <button style="color: red; cursor: pointer;">Borrar Anuncio</button>
            `;
            
            listaAnuncios.appendChild(card);
        });
    }
});