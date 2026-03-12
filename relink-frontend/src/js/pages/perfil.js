import { renderNavbar } from '../components/navBar.js';
import { getAnuncios, deleteAnuncio } from '../services/anuncios.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cargamos el menú
    renderNavbar();

    // 2. Comprobamos sesión
    const token = localStorage.getItem('relink_token');
    const userString = localStorage.getItem('relink_user');

    if (!token || !userString) {
        window.location.href = '/login.html';
        return;
    }

    const usuarioActual = JSON.parse(userString);
    const contenedorAnuncios = document.getElementById('misAnunciosContainer');

    try {
        // 3. Obtener y filtrar anuncios
        const todosLosAnuncios = await getAnuncios();
        
        // Filtramos: solo los anuncios cuyo user_id coincida con el mío
        const misAnuncios = todosLosAnuncios.filter(anuncio => anuncio.user_id === usuarioActual.id);

        contenedorAnuncios.innerHTML = ''; // Limpiamos el contenedor

        if (misAnuncios.length === 0) {
            contenedorAnuncios.innerHTML = '<p>No tienes ningún anuncio publicado todavía.</p>';
            return;
        }

        // 4. Pintar los anuncios
        misAnuncios.forEach(anuncio => {
            const divAnuncio = document.createElement('div');
            divAnuncio.style = "border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";

            // Usamos enlaces <a> directos. CERO 'onclick' aquí para evitar errores de scope.
            divAnuncio.innerHTML = `
                <h3 style="margin-top: 0; color: #333;">${anuncio.titulo}</h3>
                <p style="font-size: 1.2rem; font-weight: bold; color: #28a745; margin: 10px 0;">${anuncio.precio} €</p>
                
                <div class="botones-accion" style="display: flex; gap: 10px; margin-top: 15px;">
                    <a href="/ver-anuncio.html?id=${anuncio.id}" style="padding: 8px 15px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; font-size: 0.9rem;">
                        <i class="fa-solid fa-eye"></i> Ver
                    </a>

                    <a href="/editar-anuncio.html?id=${anuncio.id}" style="padding: 8px 15px; background: #ffc107; color: black; text-decoration: none; border-radius: 4px; font-size: 0.9rem;">
                        <i class="fa-solid fa-pen"></i> Editar
                    </a>
                </div>
            `;

            // 5. Botón Eliminar (Lo creamos por separado para el evento clic)
            const btnEliminar = document.createElement('button');
            btnEliminar.innerHTML = '<i class="fa-solid fa-trash"></i> Eliminar';
            btnEliminar.style = "padding: 8px 15px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem;";

            btnEliminar.addEventListener('click', async () => {
                const confirmacion = confirm(`¿Estás seguro de eliminar "${anuncio.titulo}"?`);
                if (confirmacion) {
                    try {
                        btnEliminar.textContent = "Borrando...";
                        btnEliminar.disabled = true;
                        await deleteAnuncio(anuncio.id);
                        divAnuncio.remove();
                        
                        if (contenedorAnuncios.children.length === 0) {
                            contenedorAnuncios.innerHTML = '<p>No tienes anuncios publicados.</p>';
                        }
                    } catch (error) {
                        alert("No se pudo eliminar: " + error.message);
                        btnEliminar.innerHTML = '<i class="fa-solid fa-trash"></i> Eliminar';
                        btnEliminar.disabled = false;
                    }
                }
            });

            // Añadimos el botón de eliminar al div de botones
            divAnuncio.querySelector('.botones-accion').appendChild(btnEliminar);
            contenedorAnuncios.appendChild(divAnuncio);
        });

    } catch (error) {
        console.error("Error cargando perfil:", error);
        contenedorAnuncios.innerHTML = '<p style="color:red;">Error al cargar tus anuncios.</p>';
    }
});