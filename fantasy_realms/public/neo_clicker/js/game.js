let score = 0;
let timeLeft = 30;
let timer;

function startGame() {
    clearInterval(timer);
    gameContainer.innerHTML = "";
    score = 0;
    timeLeft = 30;
    scoreDisplay.textContent = "0";
    timeDisplay.textContent = "30";

    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            createTarget();
        } else {
            clearInterval(timer);

            // Sauvegarder le score au serveur
            sendScoreToServer('aim_miaw', score);

            // Fin de partie : affiche uniquement menu fin
            const gameUI = document.getElementById("game-ui");
            const endMenu = document.getElementById("end-menu");

            gameUI.classList.add("hidden");
            endMenu.classList.remove("hidden");
            document.getElementById("final-score").textContent = `Score final : ${score}`;
        }
    }, 1000);
}

function restartGame() {
    score = 0;
    timeLeft = 30;
    clearInterval(timer);
    startGame();
}

function sendScoreToServer(game, score) {
    if (!window.accountManager || typeof window.accountManager.checkSession !== 'function') {
        console.error("AccountManager non initialisé ou méthode checkSession manquante");
        return;
    }

    const userEmail = window.accountManager.checkSession();
    if (!userEmail) {
        console.error("Utilisateur non connecté");
        return;
    }

    // Sauvegarder le score localement via AccountManager
    const success = window.accountManager.saveUserScore(userEmail, game, score);
    if (success) {
        console.log(`Score sauvegardé localement pour ${userEmail} au jeu ${game}: ${score}`);
    } else {
        console.warn(`Le score n'a pas été mis à jour car il n'est pas supérieur au score existant.`);
    }

    // Envoyer le score au serveur
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
            console.log("Score sauvegardé avec succès sur le serveur :", data);
        } else {
            console.error("Erreur lors de la sauvegarde du score sur le serveur :", data.message);
        }
    })
    .catch(error => {
        console.error('Erreur réseau lors de la sauvegarde du score :', error);
    });
}

restartButton.addEventListener("click", restartGame);
