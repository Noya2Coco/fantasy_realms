const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const restartButton = document.getElementById("restart-button");

function updateScore(newScore, message = "") {
    scoreDisplay.textContent = `${newScore} ${message}`;
    setTimeout(() => {
        scoreDisplay.textContent = newScore;
    }, 750);
}

function updateTime(newTime) {
    timeDisplay.textContent = newTime;
}
