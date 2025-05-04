document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const messageContainer = document.getElementById('message-container');

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
        return passwordRegex.test(password);
    }

    function displayMessage(message, isSuccess) {
        messageContainer.textContent = message;
        messageContainer.style.backgroundColor = isSuccess ? 'green' : 'red';
        messageContainer.style.top = '10%';

        setTimeout(() => {
            messageContainer.style.top = '-100px';
        }, 3000);
    }

    function setSession(email) {
        const now = new Date();
        const expiryTime = now.getTime() + 24 * 60 * 60 * 1000; // 24 hours
        const sessionData = { email, expiryTime };
        sessionStorage.setItem('userSession', JSON.stringify(sessionData));
    }

    function checkSession() {
        const sessionData = JSON.parse(sessionStorage.getItem('userSession'));
        if (sessionData) {
            const now = new Date();
            if (now.getTime() > sessionData.expiryTime) {
                sessionStorage.removeItem('userSession');
                return null;
            }
            return sessionData.email;
        }
        return null;
    }

    function updateLoginButtons() {
        const userEmail = checkSession();
        const loginButtons = document.querySelectorAll('.btn-se-connecter, .btn-se-connecter-horizontal');
        if (userEmail) {
            loginButtons.forEach(button => {
                button.textContent = 'Se déconnecter';
                button.onclick = () => {
                    sessionStorage.removeItem('userSession');
                    location.reload();
                };
            });
        } else {
            loginButtons.forEach(button => {
                button.textContent = 'Se connecter';
                button.onclick = () => {
                    location.href = 'login.html';
                };
            });
        }
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!isValidEmail(email)) {
            displayMessage('Veuillez entrer un email valide.', false);
            return;
        }

        const storedUser = JSON.parse(localStorage.getItem(email));

        if (storedUser && storedUser.password === password) {
            displayMessage('Connexion réussie!', true);
            setSession(email);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            displayMessage('Email ou mot de passe incorrect.', false);
        }
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!isValidEmail(email)) {
            displayMessage('Veuillez entrer un email valide.', false);
            return;
        }

        if (!isValidPassword(password)) {
            displayMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.', false);
            return;
        }

        if (password !== confirmPassword) {
            displayMessage('Les mots de passe ne correspondent pas.', false);
            return;
        }

        if (localStorage.getItem(email)) {
            displayMessage('Un compte avec cet email existe déjà.', false);
            return;
        }

        const user = { email, password };
        localStorage.setItem(email, JSON.stringify(user));
        displayMessage('Compte créé avec succès!', true);
        setTimeout(() => {
            document.getElementById('login-btn').click();
        }, 1000);
    });

    updateLoginButtons();
});
