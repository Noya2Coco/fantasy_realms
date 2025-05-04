document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const formTitle = document.getElementById('form-title');
    const loginContainer = document.querySelector('.login-container');

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

    function switchForm(showForm, hideForm, title) {
        formTitle.textContent = title;
        showForm.style.display = 'flex';
        hideForm.style.transform = 'translateY(100%)';
        hideForm.style.opacity = 0;
        setTimeout(() => {
            hideForm.classList.remove('active');
            showForm.classList.add('active');
            showForm.style.transform = 'translateY(0)';
            showForm.style.opacity = 1;
            loginContainer.style.height = `${showForm.scrollHeight + 175}px`;
        }, 300);
        setTimeout(() => {
            hideForm.style.display = 'none';
            hideForm.style.transform = 'translateY(-100%)';
        }, 600);
    }

    loginBtn.addEventListener('click', () => {
        loginBtn.classList.add('active');
        signupBtn.classList.remove('active');
        switchForm(loginForm, signupForm, 'Se connecter');
    });

    signupBtn.addEventListener('click', () => {
        signupBtn.classList.add('active');
        loginBtn.classList.remove('active');
        switchForm(signupForm, loginForm, 'Créer un compte');
    });

    // Ensure the correct form is displayed based on the URL hash
    if (window.location.hash === '#signup') {
        signupBtn.click();
    } else {
        loginBtn.click();
    }

    // Redirect if user is already logged in
    if (checkSession()) {
        window.location.href = 'index.html';
    }
});