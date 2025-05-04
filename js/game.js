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

restartButton.addEventListener("click", restartGame);
