// Importamos la función que hace la llamada real a la API (fetch/axios)
import { loginUser } from '../services/auth.js';

/*
   PANTALLA: LOGIN DE USUARIO
   Este script captura el email y la contraseña, los envía al backend para verificarlos,
   y si son correctos, recibe y almacena el Token de acceso y los datos del usuario.
*/

document.addEventListener('DOMContentLoaded', () => {
    
    // CAPTURAMOS ELEMENTOS DEL DOM
    const loginForm = document.getElementById('loginForm');
    const errorMessageDiv = document.getElementById('errorMessage');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    // Si el formulario no existe en la página, abortamos para no dar errores en consola.
    if (!loginForm) return;

    // EVENTO: EL USUARIO INTENTA ENTRAR
    loginForm.addEventListener('submit', async (e) => {
        // Bloqueamos que la página se recargue
        e.preventDefault();
        limpiarErrores();

        // Extraemos lo que el usuario ha escrito
        const emailValue = document.getElementById('email').value;
        const passwordValue = document.getElementById('password').value;
        
        // Empaquetamos los datos en un objeto JSON normal.
        const credenciales = {
            email: emailValue,
            password: passwordValue,
        };

        // Damos feedback visual deshabilitando el botón mientras esperamos al servidor
        cargando(true);

        try {
            // Llamamos al servicio para que hable con el controlador de Laravel
            const data = await loginUser(credenciales);

            // Recibiendo el token
            // Extraemos el token.
            const token = data.token;
            
            if (token) {
                // Guardamos el token en la memoria persistente del navegador
                localStorage.setItem('relink_token', token);
                
                // Guardamos también los datos del usuario (nombre, rol, id) para no tener que
                // pedírselos al servidor cada vez que queramos pintar su nombre en el Navbar.
                // Como localStorage solo guarda texto, lo convertimos con JSON.stringify.
                if (data.user) {
                    localStorage.setItem('relink_user', JSON.stringify(data.user));
                }

                // Redirigimos al usuario a la página principal ya logueado
                window.location.href = '/index.html';
            } else {
                // Si el backend dijo "200 OK" pero no mandó token
                throw new Error("El servidor no devolvió ningún token de acceso.");
            }

        } catch (error) {
            // Si Laravel nos dio un error 401 (Credenciales inválidas) o 403 (Usuario inactivo),
            // lo capturamos aquí y lo pintamos de rojo en la pantalla.
            mostrarError(error.message || 'Error al iniciar sesión.');
        } finally {
            // Haya funcionado o fallado, volvemos a habilitar el botón
            cargando(false);
        }
    });

    // --- FUNCIONES AUXILIARES (Para mostrar/ocultar errores y cambiar el texto del botón) ---
    function mostrarError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }

    function limpiarErrores() {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    }

    function cargando(isLoading) {
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? 'Entrando...' : 'Entrar';
    }
});