import { loginUser } from '../services/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');
    const errorMessageDiv = document.getElementById('errorMessage');
    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        limpiarErrores();

        const emailValue = document.getElementById('email').value;
        const passwordValue = document.getElementById('password').value;
        
        const credenciales = {
            email: emailValue,
            password: passwordValue,
        };

        cargando(true);

        try {
            const data = await loginUser(credenciales);

            const token = data.token || data.access_token; 
            
            if (token) {
                localStorage.setItem('relink_token', token);
                
                if (data.user) {
                    localStorage.setItem('relink_user', JSON.stringify(data.user));
                }

                window.location.href = '/index.html'; 
            } else {
                throw new Error("El servidor no devolvió ningún token de acceso.");
            }

        } catch (error) {
            mostrarError(error.message || 'Error al iniciar sesión.');
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
        submitButton.textContent = isLoading ? 'Entrando...' : 'Entrar';
    }
});