// Importamos la función que se comunica con la API de Laravel
import { registerUser } from '../services/auth.js';

/*
   PANTALLA: REGISTRO DE USUARIO
   Este script captura los datos del formulario, realiza validaciones rápidas
   directamente en el navegador y los envía al backend para crear la cuenta.
*/

document.addEventListener('DOMContentLoaded', () => {

    localStorage.removeItem('relink_token');
    
    // CAPTURAMOS ELEMENTOS DEL DOM
    const registerForm = document.getElementById('registerForm');
    const errorMessageDiv = document.getElementById('errorMessage');
    const submitButton = registerForm.querySelector('button[type="submit"]');

    if (!registerForm) return;

    // EVENTO PRINCIPAL: EL USUARIO LE DA A REGISTRAR
    registerForm.addEventListener('submit', async (e) => {
        // Bloqueamos la recarga de la página para gestionar la petición con JavaScript
        e.preventDefault();

        limpiarErrores();

        // Extraemos los valores de los inputs
        const nameValue = document.getElementById('name').value;
        const emailValue = document.getElementById('email').value;
        const passwordValue = document.getElementById('password').value;
        const password_confirmationValue = document.getElementById('password_confirmation').value;
        
        // Empaquetamos los datos en un objeto JSON. 
        const userData = {
            name: nameValue,
            email: emailValue,
            password: passwordValue,
            password_confirmation: password_confirmationValue
        };

        // --- VALIDACIÓN FRONTEND (Client-Side) ---
        
        // Comprobamos si las contraseñas coinciden ANTES de molestar al servidor.
        if (userData.password !== userData.password_confirmation) {
            mostrarError('Las contraseñas no coinciden. Revísalas.');
            return;
        }

        // Comprobamos la longitud mínima de seguridad
        if (userData.password.length < 8) {
            mostrarError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        // Damos feedback visual al usuario deshabilitando el botón
        cargando(true);

        try {
            // Mandamos los datos a la API
            const response = await registerUser(userData);

            // Si Laravel nos devuelve un 201 (Creado), le mostramos una alerta de éxito
            // y lo mandamos directamente a la pantalla de Login para que entre.
            window.location.href = '/email-revisar-bandeja.html';

        } catch (error) {
            // Si Laravel se queja (por ejemplo, si el email ya existe en la base de datos,
            // saltará la validación 'unique:users' del backend y caeremos aquí).
            mostrarError(error.message || 'Ocurrió un error al intentar registrarte.');
        } finally {
            // Restauramos el botón
            cargando(false);
        }
    });

    // --- FUNCIONES AUXILIARES ---
    // Muestran y ocultan el cajón rojo de errores y cambian el estado del botón
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
        submitButton.textContent = isLoading ? 'Registrando...' : 'Registrar';
    }
});