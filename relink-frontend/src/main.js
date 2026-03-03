// URL de tu API de Laravel (asegúrate de que el servidor esté encendido con php artisan serve)
const API_URL = 'http://localhost:5500/api/categorias';

async function comprobarConexion() {
    const statusElement = document.getElementById('status');
    const resultadoElement = document.getElementById('resultado');

    try {
        // 1. Intentamos hacer la petición
        const respuesta = await fetch(API_URL);

        // 2. Si la respuesta no es "ok" (ej. un 404 o 500)
        if (!respuesta.ok) {
            throw new Error(`Error en el servidor: ${respuesta.status}`);
        }

        // 3. Convertimos los datos a JSON
        const datos = await respuesta.json();

        // 4. Si llegamos aquí, ¡éxito!
        statusElement.innerText = "✅ ¡Conectado!";
        statusElement.style.color = "green";

        // Pintamos las categorías para confirmar que recibimos datos reales
        resultadoElement.innerHTML = `
            <h3>Categorías encontradas:</h3>
            <ul>
                ${datos.map(cat => `<li><strong>${cat.nombre}</strong>: ${cat.descripcion}</li>`).join('')}
            </ul>
        `;

    } catch (error) {
        // 5. Si hay un error (CORS, servidor apagado, etc.)
        statusElement.innerText = "❌ Error de conexión";
        statusElement.style.color = "red";
        resultadoElement.innerHTML = `<p style="color: grey;">Detalle: ${error.message}</p>`;
        console.error("Error completo:", error);
    }
}

// Ejecutamos la función al cargar la página
comprobarConexion();