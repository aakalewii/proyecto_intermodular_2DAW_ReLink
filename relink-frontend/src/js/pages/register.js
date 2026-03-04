import { registerUser } from '../services/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    
    const registerForm = document.getElementById('registerForm');
    const errorMessageDiv = document.getElementById('errorMessage');
    const submitButton = registerForm.querySelector('button[type="submit"]');

    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        limpiarErrores();

        const nameValue = document.getElementById('name').value;
        const emailValue = document.getElementById('email').value;
        const passwordValue = document.getElementById('password').value;
        const password_confirmationValue = document.getElementById('password_confirmation').value;
        
        const userData = {
            name: nameValue,
            email: emailValue,
            password: passwordValue,
            password_confirmation: password_confirmationValue
        };

        if (userData.password !== userData.password_confirmation) {
            mostrarError('Las contraseñas no coinciden. Revísalas.');
            return;
        }

        if (userData.password.length < 8) {
            mostrarError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        cargando(true);

        try {
            const response = await registerUser(userData);

            alert('¡Cuenta creada con éxito en ReLink!');
            window.location.href = '/login.html';

        } catch (error) {
            mostrarError(error.message || 'Ocurrió un error al intentar registrarte.');
        } finally {
            cargando(false);
        }
    });

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