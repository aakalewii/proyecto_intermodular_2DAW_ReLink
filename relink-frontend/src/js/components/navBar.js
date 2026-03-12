import { logoutUser } from '../services/auth.js';

export function renderNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    const token = localStorage.getItem('relink_token');
    const userString = localStorage.getItem('relink_user');
    const user = userString ? JSON.parse(userString) : null;

    if (token && user) {

        // Verificamos si es admin
        let esAdmin = false;
        if (user.rol === 'admin') {
            esAdmin = true;
        }

        // Preparamos el texto del logo
        let logoHtml = '<h2>ReLink</h2>';
        if (esAdmin) {
            logoHtml = '<h2>ReLink (Admin)</h2>';
        }

        // --- EL ESTILO Y EL BOTÓN (Apunta a crear-anuncio.html) ---
        let enlacesHtml = `
            <style>
                .btn-nuevo-anuncio {
                    background-color: #28a745; 
                    color: white; 
                    border: 2px solid #28a745; 
                    padding: 6px 12px; 
                    border-radius: 5px; 
                    text-decoration: none; 
                    margin-right: 15px; 
                    transition: all 0.3s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px; /* Espacio entre el icono y el texto */
                }
                .btn-nuevo-anuncio:hover {
                    background-color: white;
                    color: #28a745;
                }
            </style>
            <a href="/crear-anuncio.html" class="btn-nuevo-anuncio">
                <i class="fa-solid fa-plus"></i> Crear Anuncio
            </a>
            <a href="/perfil.html">Hola, <strong>${user.name}</strong></a>
            <a href="/index.html" style="margin-left: 15px;">Inicio</a>
        `;

        // Si es admin, le sumamos los enlaces extra
        if (esAdmin) {
            enlacesHtml = enlacesHtml + `
                <a href="/admin/paises.html" style="margin-left: 15px;">Países</a>
                <a href="/admin/provincias.html" style="margin-left: 15px;">Provincias</a>
                <a href="/admin/municipios.html" style="margin-left: 15px;">Municipios</a>
                <a href="/admin/localidades.html" style="margin-left: 15px;">Localidades</a>
            `;
        }

        navbarContainer.innerHTML = `
            <nav style="display: flex; justify-content: space-between; padding: 1rem; align-items: center;">
                ${logoHtml}
                <div style="display: flex; align-items: center;">
                    ${enlacesHtml}
                    <button id="btnLogout" style="margin-left: 15px;">Cerrar Sesión</button>
                </div>
            </nav>
        `;

        // Actualizamos el evento del clic
        const btnLogout = document.getElementById('btnLogout');
        
        btnLogout.addEventListener('click', async () => {
            // Cambiamos el texto para que el usuario vea que está cargando
            btnLogout.textContent = "Saliendo...";
            btnLogout.disabled = true;

            try {
                // Avisamos a Laravel para que destruya el token en la Base de Datos
                await logoutUser();
            } catch (error) {
                console.warn("No se pudo conectar con Laravel para el logout, pero cerraremos en el navegador.");
            } finally {
                // Pase lo que pase, borramos el rastro en el navegador
                localStorage.removeItem('relink_token');
                localStorage.removeItem('relink_user');
                
                alert('Sesión cerrada correctamente');
                window.location.href = '/login.html';
            }
        });

    } else {
        navbarContainer.innerHTML = `
            <nav style="display: flex; justify-content: space-between; padding: 1rem; align-items: center;">
                <h2>ReLink</h2>
                <div>
                    <a href="/login.html">Iniciar Sesión</a>
                    <a href="/register.html" style="margin-left: 10px;">Registrarse</a>
                </div>
            </nav>
        `;
    }
}