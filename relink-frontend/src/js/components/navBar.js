import { logoutUser } from '../services/auth.js';

export function renderNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    const token = localStorage.getItem('relink_token');
    const userString = localStorage.getItem('relink_user');
    const user = userString ? JSON.parse(userString) : null;

    if (token && user) {

        // 1. Verificamos si es admin
        let esAdmin = false;
        if (user.rol === 'admin') {
            esAdmin = true;
        }

        // 2. Preparamos el texto del logo
        let logoHtml = '<h2>ReLink</h2>';
        if (esAdmin) {
            logoHtml = '<h2>ReLink (Admin)</h2>';
        }

        let enlacesHtml = `
            <span>Hola, <strong>${user.name}</strong></span>
            <a href="/index.html" style="margin-left: 15px;">Inicio</a>
        `;

        // 4. Si es admin, le sumamos los enlaces extra
        if (esAdmin) {
            enlacesHtml = enlacesHtml + `
                <a href="/admin/paises.html" style="margin-left: 15px;">Países</a>
                <a href="/admin/provincias.html" style="margin-left: 15px;">Provincias</a>
            `;
        }

        navbarContainer.innerHTML = `
            <nav style="display: flex; justify-content: space-between; padding: 1rem;">
                ${logoHtml}
                <div>
                    ${enlacesHtml}
                    <button id="btnLogout" style="margin-left: 15px;">Cerrar Sesión</button>
                </div>
            </nav>
        `;

        // 2. Actualizamos el evento del clic
        const btnLogout = document.getElementById('btnLogout');
        
        btnLogout.addEventListener('click', async () => {
            // Cambiamos el texto para que el usuario vea que está cargando
            btnLogout.textContent = "Saliendo...";
            btnLogout.disabled = true;

            try {
                // A. Avisamos a Laravel para que destruya el token en la Base de Datos
                await logoutUser();
            } catch (error) {
                console.warn("No se pudo conectar con Laravel para el logout, pero cerraremos en el navegador.");
            } finally {
                // B. Pase lo que pase, borramos el rastro en el navegador
                localStorage.removeItem('relink_token');
                localStorage.removeItem('relink_user');
                
                alert('Sesión cerrada correctamente');
                window.location.href = '/login.html';
            }
        });

    } else {
        navbarContainer.innerHTML = `
            <nav style="display: flex; justify-content: space-between; padding: 1rem;">
                <h2>ReLink</h2>
                <div>
                    <a href="/login.html">Iniciar Sesión</a>
                    <a href="/register.html" style="margin-left: 10px;">Registrarse</a>
                </div>
            </nav>
        `;
    }
}