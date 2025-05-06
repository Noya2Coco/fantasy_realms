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
        updateLoginButtons();
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
        const loginButtons = document.querySelectorAll('.btn-se-connecter, .btn-se-connecter-horizontal, #button');
        if (userEmail) {
            loginButtons.forEach(button => {
                button.textContent = 'Se déconnecter';
                button.onclick = () => {
                    sessionStorage.removeItem('userSession');
                    window.location.reload();
                };
            });
        } else {
            loginButtons.forEach(button => {
                button.textContent = 'Se connecter';
                button.onclick = () => {
                    window.location.href = 'login.html';
                };
            });
        }
    }

    // Fonction pour sauvegarder un score
    function saveUserScore(email, game, score) {
        // Récupérer l'utilisateur du localStorage
        const storedUser = JSON.parse(localStorage.getItem(email));
        
        if (!storedUser) {
            console.error("Utilisateur non trouvé");
            return false;
        }
        
        // Initialiser les scores si nécessaire
        if (!storedUser.scores) {
            storedUser.scores = {};
        }
        
        // Mettre à jour le score seulement s'il est meilleur que le précédent
        if (!storedUser.scores[game] || score > storedUser.scores[game]) {
            storedUser.scores[game] = score;
            localStorage.setItem(email, JSON.stringify(storedUser));
            console.log(`Nouveau meilleur score pour ${email} au jeu ${game}: ${score}`);
            return true;
        }
        
        return false;
    }

    // Fonction pour sauvegarder un score pour le jeu "headball"
    function saveHeadballScore(email, score) {
        const game = 'headball'; // Nom du jeu
        const storedUser = JSON.parse(localStorage.getItem(email));

        if (!storedUser) {
            console.error("Utilisateur non trouvé");
            return false;
        }

        // Initialiser les scores si nécessaire
        if (!storedUser.scores) {
            storedUser.scores = {};
        }

        // Mettre à jour le score seulement s'il est meilleur que le précédent
        if (!storedUser.scores[game] || score > storedUser.scores[game]) {
            storedUser.scores[game] = score;
            localStorage.setItem(email, JSON.stringify(storedUser));
            console.log(`Nouveau meilleur score pour ${email} au jeu ${game}: ${score}`);
            return true;
        }

        return false;
    }

    // Fonction pour récupérer le score d'un utilisateur
    function getUserScore(email, game) {
        const storedUser = JSON.parse(localStorage.getItem(email));
        if (storedUser && storedUser.scores && storedUser.scores[game]) {
            return storedUser.scores[game];
        }
        return 0;
    }

    // Fonction pour récupérer tous les scores d'un jeu
    function getAllScores(game) {
        const scores = [];
        
        // Parcourir tous les utilisateurs dans le localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                const storedUser = JSON.parse(localStorage.getItem(key));
                if (storedUser && storedUser.email && storedUser.scores && storedUser.scores[game]) {
                    scores.push({
                        email: storedUser.email,
                        score: storedUser.scores[game]
                    });
                }
            } catch (e) {
                // Ignorer les items qui ne sont pas des utilisateurs valides
                console.error("Erreur lors de la lecture d'un item du localStorage:", e);
            }
        }
        
        // Trier les scores du plus grand au plus petit
        return scores.sort((a, b) => b.score - a.score);
    }

    // Fonction pour envoyer un score au serveur
    function sendScore(game, score) {
        const userEmail = checkSession();
        if (!userEmail) {
            console.error("Utilisateur non connecté");
            return;
        }
        
        fetch('/newScore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                game: game,
                user: userEmail,
                score: score
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Stocker le score localement
                saveUserScore(userEmail, game, score);
            } else {
                console.error("Erreur lors de l'envoi du score:", data.message);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
        });
    }

    // Fonction pour récupérer le token utilisateur pour les jeux
    function getUserToken() {
        return checkSession();
    }

    // Rendre les fonctions accessibles globalement
    window.accountManager = {
        saveUserScore,
        saveHeadballScore,
        getUserScore,
        getAllScores,
        sendScore,
        checkSession,
        getUserToken
    };

    updateLoginButtons();

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
});
