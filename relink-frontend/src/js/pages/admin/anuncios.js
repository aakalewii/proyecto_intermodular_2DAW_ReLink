import { renderNavbar } from '../../components/navbar.js';
import { getAnuncios, getAnuncioStats, suspenderAnuncio, activarAnuncio } from '../../services/anunciosAdmin.js';
import { verificarAccesoAdmin } from '../../services/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!verificarAccesoAdmin()) return;

    renderNavbar();
    cargarEstadisticas();
    cargarTablaAnuncios();
});

// --- CARGAR ESTADÍSTICAS ---
async function cargarEstadisticas() {
    try {
        const stats = await getAnuncioStats();
        document.getElementById('stat-total-anuncios').textContent = stats.total_anuncios || '0';
        document.getElementById('stat-publicados').textContent = stats.total_publicos || '0'; 
        document.getElementById('stat-suspendidos').textContent = stats.total_suspendidos || '0';
    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
    }
}

// --- CARGAR Y PINTAR LA TABLA ---
async function cargarTablaAnuncios() {
    const tbody = document.getElementById('tablaAnuncios');
    
    try {
        const anuncios = await getAnuncios();
        tbody.innerHTML = '';

        if (anuncios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay anuncios registrados.</td></tr>';
            return;
        }

        anuncios.forEach(anuncio => {
            const tr = document.createElement('tr');

            const nombreUser = anuncio.user ? `${anuncio.user.name} ${anuncio.user.apellidos || ''}` : 'Usuario Borrado';
            const emailUser = anuncio.user ? anuncio.user.email : 'Sin email';

            let botonAccion = '';

            const estiloBase = "padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; color: white;";

            if (anuncio.estado === 'publicado') { 
                botonAccion = `<button class="btn-suspender" data-id="${anuncio.id}" style="${estiloBase} background-color: #e87c10;"><i class="fa-solid fa-ban"></i> Suspender</button>`;
            } else {
                botonAccion = `<button class="btn-activar" data-id="${anuncio.id}" style="${estiloBase} background-color: #28993d;"><i class="fa-solid fa-check"></i> Activar</button>`;
            }

            tr.innerHTML = `
                <td>${anuncio.titulo}</td>
                <td>${nombreUser}</td>
                <td>${emailUser}</td>
                <td style="text-transform: uppercase; font-size: 0.85em;"><b>${anuncio.estado}</b></td>
                <td>${botonAccion}</td>
            `;
            tbody.appendChild(tr);
        });

        asignarEventosBotones();

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
    }
}

// --- DAR FUNCIONALIDAD A LOS BOTONES ---
function asignarEventosBotones() {
    
    // SUSPENDER
    document.querySelectorAll('.btn-suspender').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            
            if(confirm('¿Seguro que quieres SUSPENDER este anuncio?')) {
                try {
                    await suspenderAnuncio(id);
                    cargarTablaAnuncios();
                    cargarEstadisticas();
                } catch(error) {
                    alert(error.message);
                }
            }
        });
    });

    // ACTIVAR
    document.querySelectorAll('.btn-activar').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            
            if(confirm('¿Seguro que quieres volver a ACTIVAR este anuncio?')) {
                try {
                    await activarAnuncio(id);
                    cargarTablaAnuncios();
                    cargarEstadisticas();
                } catch(error) {
                    alert(error.message);
                }
            }
        });
    });
}