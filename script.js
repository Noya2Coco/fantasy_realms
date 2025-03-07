let score = 0;
let timeLeft = 30;
let timer; // Stocker l'intervalle pour pouvoir l'arrêter
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const restartButton = document.getElementById("restart-button");
const crosshair = document.getElementById("crosshair");

function createTarget() {
    let target = document.createElement("div");
    target.classList.add("target");
    
    let maxX = gameContainer.clientWidth - 70;
    let maxY = gameContainer.clientHeight - 70;
    let randomX = Math.floor(Math.random() * maxX);
    let randomY = Math.floor(Math.random() * maxY);
    
    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;

    target.addEventListener("click", (event) => {
        if (timeLeft > 0) {
            const rect = target.getBoundingClientRect();
            const targetCenterX = rect.left + rect.width / 2;
            const targetCenterY = rect.top + rect.height / 2;
            const distance = Math.sqrt(
                Math.pow(event.clientX - targetCenterX, 2) + Math.pow(event.clientY - targetCenterY, 2)
            );

            let message = "";
            if (distance < 10) {
                score += 300;
                timeLeft += 3;
                message = "Perfect +3s";
            } else if (distance < 30) {
                score += 100;
                timeLeft += 1;
                message = "Nice +1s";
            } 
            scoreDisplay.textContent = `${score} (${message})`;

            setTimeout(() => {
                scoreDisplay.textContent = score;
            }, 750);

        }
    });

    // 🟢 Calcul de la durée d'affichage des cibles en fonction du score
    let baseTime = 3000; // Temps de base en millisecondes (3s)
    let minTime = 500; // Temps minimum (0.5s)
    let speedFactor = 1000; // Plus ce nombre est petit, plus la difficulté augmente rapidement
    let targetDuration = Math.max(baseTime - (score / speedFactor) * 1000, minTime);

    // 🟢 Supprimer la cible après le temps calculé
    setTimeout(() => {
        target.remove();
    }, targetDuration);

    gameContainer.appendChild(target);
}

function startGame() {
    clearInterval(timer); // Éviter de créer plusieurs timers
    gameContainer.innerHTML = ""; // Vider la zone de jeu au démarrage
    scoreDisplay.textContent = "0";
    timeDisplay.textContent = "30";
    
    timer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            createTarget();
        } else {
            clearInterval(timer);
            alert("Temps écoulé ! Score final : " + score);
        }
    }, 1000);
}

function restartGame() {
    score = 0;
    timeLeft = 30;
    clearInterval(timer); // Arrêter le timer en cours
    startGame(); // Relancer le jeu proprement
}

restartButton.addEventListener("click", restartGame);

// Déplacement du viseur
document.addEventListener("mousemove", (event) => {
    crosshair.style.left = `${event.clientX}px`;
    crosshair.style.top = `${event.clientY}px`;
});

// Masquer le viseur en dehors de la zone de jeu
gameContainer.addEventListener("mouseenter", () => {
    crosshair.classList.remove("hidden");
});

gameContainer.addEventListener("mouseleave", () => {
    crosshair.classList.add("hidden");
});

// Démarrer le jeu au chargement
startGame();

function updateFPS() {
    const now = performance.now();
    const deltaTime = now - (this.lastFrameTime || now);
    this.lastFrameTime = now;

    if (deltaTime > 0) {
        this.fps = Math.min(60, Math.round(1000 / deltaTime)); // Limite à 60 FPS max
    } else {
        this.fps = 60; // Sécurité en cas de division par zéro
    }

    // Affichage des FPS
    document.getElementById('fpsCounter').textContent = `FPS: ${this.fps}`;
}

setInterval(updateFPS, 1000 / 60); // Appeler updateFPS 60 fois par seconde