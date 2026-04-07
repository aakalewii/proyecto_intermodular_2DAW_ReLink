import { misDatos } from '../services/auth.js';
import { logoutUser } from '../services/auth.js';

// Esta función se encarga de pintar dinámicamente la barra de navegación en cualquier página de la aplicación.
// En lugar de copiar y pegar el HTML de la barra en cada archivo (.html), tenemos un contenedor vacío (<header id="navbar-container">)
// y esta función lo rellena dependiendo de si el usuario es un visitante, un cliente registrado o un administrador.
export async function renderNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    // Recuperamos los datos de la "sesión" del usuario almacenados en el navegador (localStorage).
    // Como el user se guardó como texto plano, usamos JSON.parse() para volver a convertirlo en un objeto de JavaScript.
    const token = localStorage.getItem('relink_token');
    

    // Si tenemos token y usuario, significa que hay alguien logueado.
    if (token) {
        try {
            
            // Comprobamos los datos del usuario
            const user = await misDatos();

            // Comprobamos el rol del usuario para decidir qué botones enseñarle.
            const esAdmin = user.rol === 'admin';
            
            const logoUrl = '/src/assets/LogoReLink.png';

            const logo = `
                <div class="nav-logo-container">
                    <a href="/index.html">
                        <img src="${logoUrl}" alt="ReLink Logo" class="nav-logo" style="width: 140px; height: auto;">
                    </a>
                    ${esAdmin ? '<span class="admin-badge">(Admin)</span>' : ''}
                </div>
            `;
            
            let enlacesHtml = '';

            // --- LÓGICA DE ROLES ---
            // Generamos el HTML de los enlaces de forma condicional.
            // Si es administrador, le damos acceso a su Panel Exclusivo y quitamos cosas que no necesita (como Crear Anuncio).
            if (esAdmin) {
                enlacesHtml += `
                    <a href="/index.html" class="nav-link">Inicio</a>
                    <a href="/admin/panel.html" class="nav-link">Panel Administrativo</a>
                `;
            } else {
                // Si es un cliente normal, le damos acceso a Crear Anuncio, su Perfil (saludándole por su nombre) y Favoritos.
                enlacesHtml += `
                    <a href="/crear-anuncio.html" class="btn-nuevo-anuncio">
                        <i class="fa-solid fa-plus"></i> Crear Anuncio
                    </a>
                    <a href="/perfil.html" class="nav-link">Hola, <strong>${user.name}</strong></a>
                    <a href="/index.html" class="nav-link">Inicio</a>
                    <a href="/favoritos.html" class="nav-link"><i class="fa-regular fa-heart"></i> Favoritos</a>
                `;
            }

            // Inyectamos todo el HTML generado (el logo dinámico y los enlaces correctos) dentro del contenedor.
            navbarContainer.innerHTML = `
                <nav class="navbar-relink">
                    ${logo}
                    <div class="nav-menu">
                        ${enlacesHtml}
                        <button id="btnLogout" class="btn-logout">Cerrar Sesión</button>
                    </div>
                </nav>
            `;

            // Una vez que el botón de Cerrar Sesión existe en el HTML, le añadimos su "escuchador de eventos" (EventListener).
            const btnLogout = document.getElementById('btnLogout');
            btnLogout.addEventListener('click', async () => {
                
                // Damos feedback visual al usuario deshabilitando el botón mientras el servidor procesa la petición.
                btnLogout.textContent = "Saliendo...";
                btnLogout.disabled = true;
                
                try {
                    // Llamamos a la API de Laravel para que destruya el token en el servidor.
                    await logoutUser();
                } catch (error) {
                    // Si el servidor falla capturamos el error
                    // con un console.warn para que la aplicación no se cuelgue.
                    console.warn("Logout en servidor falló, limpiando local...");
                } finally {
                    // Borramos los datos del localStorage por seguridad y redirigimos a la portada. 
                    localStorage.removeItem('relink_token');
                    window.location.href = '/index.html';
                }
            });

        } catch (error) {
            // 3. ¡SÚPER IMPORTANTE! Si el token era falso o caducó, misDatos() falla.
            // Borramos esa basura del storage y pintamos la barra de visitante.
            localStorage.removeItem('relink_token');
            window.location.href = '/index.html';
        }

    } else {
        // Si no hay token (es un visitante anónimo), pintamos la barra de navegación básica.
        // Solo mostramos opciones públicas: Iniciar Sesión y Registrarse.
        navbarContainer.innerHTML = `
            <nav class="navbar-relink">
                <div class="nav-logo-container">
                    <a href="/index.html">
                        <img src="./src/assets/LogoReLink.png" alt="ReLink Logo" class="nav-logo" style="width: 140px; height: auto;">
                    </a>
                </div>
                <div class="nav-menu">
                    <a href="/login.html" class="nav-link">Iniciar Sesión</a>
                    <a href="/register.html" class="btn-primary-outline">Registrarse</a>
                </div>
            </nav>
        `;
    }
}

// Escuchamos el evento 'DOMContentLoaded' para asegurarnos de que el HTML base de la página 
// ha cargado completamente antes de intentar buscar el id="navbar-container" y pintarlo.
document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
});