let score = 0;
let timeLeft = 30;
let timer;

function startGame() {
    clearInterval(timer);
    gameContainer.innerHTML = "";
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
    clearInterval(timer);
    startGame();
}

restartButton.addEventListener("click", restartGame);
