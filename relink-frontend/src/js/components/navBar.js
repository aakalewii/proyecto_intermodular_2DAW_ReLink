export function renderNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) return;

    const token = localStorage.getItem('relink_token');
    const userString = localStorage.getItem('relink_user');
    const user = userString ? JSON.parse(userString) : null;

    if (token && user) {
        // Comprobamos el enum del rol
        const esAdmin = user.rol === 'admin';
        
        let logoHtml = esAdmin ? '<h2>ReLink <span>(Admin)</span></h2>' : '<h2>ReLink</h2>';
        
        let enlacesHtml = ''; 

        // --- LÓGICA DE ROLES ---
        if (esAdmin) {
            enlacesHtml += `
                <a href="/index.html" class="nav-link">Inicio</a>
                <a href="/admin/panel.html" class="nav-link">Panel Administrativo</a>
            `;
        } else {
            enlacesHtml += `
                <a href="/crear-anuncio.html" class="btn-nuevo-anuncio">
                    <i class="fa-solid fa-plus"></i> Crear Anuncio
                </a>
                <a href="/perfil.html" class="nav-link">Hola, <strong>${user.name}</strong></a>
                <a href="/index.html" class="nav-link">Inicio</a>
                <a href="/favoritos.html" class="nav-link"><i class="fa-regular fa-heart"></i> Favoritos</a>
            `;
        }

        // --- BUSCADOR ---
        const buscadorHtml = `
            <div class="navbar-search">
            <button id="navbarSearchBtn" aria-label="Buscar"><i class="fa-solid fa-magnifying-glass"></i></button>
                <input type="text" id="navbarSearchInput" placeholder="Buscar en Todas las categorías...">
                <button id="navbarCancelBtn" aria-label="Buscar" style="display: none;"><i class="fa-solid fa-x"></i></button>
            </div>
        `;

        navbarContainer.innerHTML = `
            <nav class="navbar-relink">
                ${logoHtml}
                ${buscadorHtml}
                <div class="nav-menu">
                    ${enlacesHtml}
                    <button id="btnLogout" class="btn-logout">Cerrar Sesión</button>
                </div>
            </nav>
        `;

        const btnLogout = document.getElementById('btnLogout');
        btnLogout.addEventListener('click', async () => {
            btnLogout.textContent = "Saliendo...";
            btnLogout.disabled = true;
            try {
                await logoutUser();
            } catch (error) {
                console.warn("Logout en servidor falló, limpiando local...");
            } finally {
                localStorage.removeItem('relink_token');
                localStorage.removeItem('relink_user');
                window.location.href = '/index.html';
            }
        });

        const searchInput = document.getElementById('navbarSearchInput');

        const ejecutarBusqueda = () => {
            const termino = searchInput.value.trim();
            // Redirigimos a la página de inicio pasándole la búsqueda por la URL
            window.location.href = `/index.html?search=${encodeURIComponent(termino)}`;
        };

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') ejecutarBusqueda();
        });

    } else {
        // Navbar para invitados (sin sesión) - También con sus clases CSS
        navbarContainer.innerHTML = `
            <nav class="navbar-relink">
                <h2>ReLink</h2>
                <div class="nav-menu">
                    <a href="/login.html" class="nav-link">Iniciar Sesión</a>
                    <a href="/register.html" class="btn-primary-outline">Registrarse</a>
                </div>
            </nav>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderNavbar();
});