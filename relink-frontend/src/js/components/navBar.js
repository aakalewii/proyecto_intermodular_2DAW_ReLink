import { logoutUser } from '../services/auth.js';

export function renderNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    const token = localStorage.getItem('relink_token');
    const userString = localStorage.getItem('relink_user');
    const user = userString ? JSON.parse(userString) : null;

    if (token && user) {
        navbarContainer.innerHTML = `
            <nav style="display: flex; justify-content: space-between; padding: 1rem; background: #eee;">
                <h2>ReLink</h2>
                <div>
                    <span>Hola, <strong>${user.name}</strong></span>
                    <button id="btnLogout" style="margin-left: 15px; color: red; cursor: pointer;">Cerrar Sesión</button>
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
                
                alert('Sesión cerrada correctamente y token destruido.');
                window.location.href = '/login.html';
            }
        });

    } else {
        navbarContainer.innerHTML = `
            <nav style="display: flex; justify-content: space-between; padding: 1rem; background: #eee;">
                <h2>ReLink</h2>
                <div>
                    <a href="/login.html">Iniciar Sesión</a>
                    <a href="/register.html" style="margin-left: 10px;">Registrarse</a>
                </div>
            </nav>
        `;
    }
}