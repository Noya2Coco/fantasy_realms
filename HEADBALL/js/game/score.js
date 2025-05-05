// Classe pour gérer le score et le chronomètre du jeu
export class ScoreManager {
    constructor(uiManager) {
        this.score1 = 0; // Score du joueur 1
        this.score2 = 0; // Score du joueur 2
        this.timeLeft = 90; // Temps restant en secondes
        this.interval = null; // Intervalle du chronomètre
        this.goalSound = new Audio("../sounds/goal.mp3"); // Son de but
        this.uiManager = uiManager; // Gestion de l'interface utilisateur
        this.isPaused = false; // Indicateur de pause
    }

    // Démarre le chronomètre
    startTimer() {
        const timerElement = document.getElementById("timeRemaining");
        if (timerElement) {
            timerElement.style.display = "block"; // Affiche le temps restant
        }
        
        this.timeLeft = 90; // Réinitialise le temps
        this.updateTimerDisplay(); // Met à jour l'affichage du temps
        this.interval = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--; // Décrémente le temps
                this.updateTimerDisplay(); // Met à jour l'affichage
                if (this.timeLeft <= 0) {
                    this.endGame(); // Fin du jeu lorsque le temps est écoulé
                }
            }
        }, 1000);
    }

    // Alterne entre pause et reprise du chronomètre
    togglePause() {
        this.isPaused = !this.isPaused;
    }

    // Arrête le chronomètre
    stopTimer() {
        if (this.interval) {
            clearInterval(this.interval); // Efface l'intervalle
            this.interval = null;
        }
    }

    // Met à jour le score du joueur après un but
    updateScore(team) {
        if (team === 'left') {
            this.score1++; // But pour le joueur 1
        } else {
            this.score2++; // But pour le joueur 2
        }
        this.updateScoreDisplay(); // Met à jour l'affichage du score
        this.playGoalSound(); // Joue le son de but
    }

    // Affiche le score mis à jour
    updateScoreDisplay() {
        document.getElementById("player1Score").textContent = this.score1;
        document.getElementById("player2Score").textContent = this.score2;
    }

    // Affiche le temps restant
    updateTimerDisplay() {
        const timerElement = document.getElementById("timeRemaining");
        if (timerElement) {
            timerElement.textContent = `${this.timeLeft}s`; // Affiche le temps
            timerElement.style.display = "block";
        }
    }

    // Joue le son lorsqu'un but est marqué
    playGoalSound() {
        this.goalSound.play();
    }

    // Affiche un message indiquant un but
    showGoalMessage() {
        const msg = document.getElementById("message");
        if (msg) {
            msg.textContent = "⚽ BUUUUT ! ⚽"; // Message de but
            msg.style.display = "block"; // Affiche le message
            msg.style.textShadow = "0 0 10px rgba(255, 0, 0, 0.7), 0 0 20px rgba(255, 0, 0, 0.6), 0 0 30px rgba(255, 0, 0, 0.5)";
            msg.style.zIndex = "1000"; // Assure que le message est au-dessus des autres éléments

            // Masque le message après 1.5 secondes
            setTimeout(() => {
                msg.style.display = "none";
            }, 1500);
        }
    }

    // Fin du jeu
    endGame() {
        this.stopTimer(); // Arrête le chronomètre
        document.getElementById("restartButton").style.display = "block"; // Affiche le bouton de redémarrage
        document.getElementById("gameCanvas").style.display = "none"; // Masque le canvas de jeu
        document.getElementById("pauseButton").style.display = "none"; // Masque le bouton de pause

        // Masque les images des buts
        const leftGoal = document.getElementById("leftGoalImage");
        const rightGoal = document.getElementById("rightGoalImage");
        if (leftGoal) leftGoal.classList.add("hidden");
        if (rightGoal) rightGoal.classList.add("hidden");
        this.uiManager.hideGoals(); // Masque les buts à l'UI

        // Affiche un message de fin de match
        const endMessage = document.getElementById("endMessage");
        if (this.score1 > this.score2) {
            endMessage.textContent = "🎉 L'hôte a gagné ! 🎉"; // Si joueur 1 gagne
            endMessage.style.textShadow =
                "0 0 10px rgba(0, 0, 255, 0.7), 0 0 20px rgba(0, 0, 255, 0.6), 0 0 30px rgba(0, 0, 255, 0.5)";
        } else if (this.score2 > this.score1) {
            endMessage.textContent = "🎉 L'invité a gagné ! 🎉"; // Si joueur 2 gagne
            endMessage.style.textShadow =
                "0 0 10px rgba(255, 255, 0, 0.7),0 0 20px rgba(255, 255, 0, 0.6),0 0 30px rgba(255, 255, 0, 0.5)";
        } else {
            endMessage.textContent = "🤝 Match nul ! 🤝"; // Si égalité
        }
        endMessage.style.display = "block"; // Affiche le message de fin

        // Remet l'image d'accueil
        document.body.style.backgroundImage = "url('../assets/acceuil.png')";
    }

    // Réinitialise le score et le chronomètre pour un nouveau jeu
    reset() {
        this.score1 = 0;
        this.score2 = 0;
        this.timeLeft = 90;
        this.updateScoreDisplay(); // Met à jour l'affichage du score
        this.updateTimerDisplay(); // Met à jour l'affichage du temps
        this.stopTimer(); // Arrête le chronomètre
        document.getElementById("endMessage").style.display = "none"; // Masque le message de fin
    }
}