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
            let bonusTime = 0;

            if (distance < 10) {
                score += 300;
                bonusTime = 2;
                message = "Perfect +2s";
            } else if (distance < 30) {
                score += 100;
                bonusTime = 1;
                message = "Nice +1s";
            }

            timeLeft = Math.min(timeLeft + bonusTime, 60);
            timeDisplay.textContent = timeLeft;
            scoreDisplay.textContent = score;

            const scoreMsg = document.getElementById("score-message");
            if (message) {
                scoreMsg.textContent = message;
                scoreMsg.classList.remove("hidden");

                setTimeout(() => {
                    scoreMsg.classList.add("hidden");
                }, 1000);
            }

            target.remove();
        }
    });

    let baseTime = 3000;
    let minTime = 500;
    let speedFactor = 1000;
    let targetDuration = Math.max(baseTime - (score / speedFactor) * 300, minTime);

    let shrinkInterval = setInterval(() => {
        let currentWidth = parseFloat(getComputedStyle(target).width);
        let currentHeight = parseFloat(getComputedStyle(target).height);

        if (currentWidth <= 10 || currentHeight <= 0) {
            clearInterval(shrinkInterval);
        } else {
            let shrinkAmount = 1;
            target.style.width = `${currentWidth - shrinkAmount}px`;
            target.style.height = `${currentHeight - shrinkAmount}px`;

            target.style.left = `${parseFloat(target.style.left) + shrinkAmount / 2}px`;
            target.style.top = `${parseFloat(target.style.top) + shrinkAmount / 2}px`;

            let scaleFactor = currentWidth / (currentWidth - shrinkAmount);
            target.style.transformOrigin = "center";
            target.style.transform = `scale(${scaleFactor})`;
        }
    }, targetDuration / 70);

    gameContainer.appendChild(target);
}
