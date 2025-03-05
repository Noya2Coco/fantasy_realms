let score = 0;
let timeLeft = 30;
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameContainer = document.getElementById("game-container");

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
                score += 300; // Perfect hit
                message = "Perfect";
            } else if (distance < 30) {
                score += 100; // Close hit
                message = "Nice";
            } else {
                score += 0; // Miss
                message = "Miss";
            }

            scoreDisplay.textContent = `${score} (${message})`;
            target.remove();
        }
    });
    
    setTimeout(() => {
        target.remove();
    }, 1500);
    
    gameContainer.appendChild(target);
}

function startGame() {
    let timer = setInterval(() => {
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


startGame();

function restartGame() {
    score = 0;
    timeLeft = 31;
    target.remove();
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    startGame();
}

const restartButton = document.getElementById("restart-button");

restartButton.addEventListener("click", restartGame);
