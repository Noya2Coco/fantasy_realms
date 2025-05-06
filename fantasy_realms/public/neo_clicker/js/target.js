const clickSound = document.getElementById("click-sound");

function createTarget() {
    const target = document.createElement("div");
    target.classList.add("target");

    // 20% de chance d'être une mauvaise cible
    const isBad = Math.random() < 0.2;
    if (isBad) {
        target.classList.add("bad");
    }

    const maxX = gameContainer.clientWidth - 70;
    const maxY = gameContainer.clientHeight - 70;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;

    target.addEventListener("click", (event) => {
        if (timeLeft > 0) {
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play();
            }

            let message = "";
            let bonusTime = 0;

            if (isBad) {
                score = Math.max(0, score - 200);
                timeLeft = Math.max(0, timeLeft - 3);
                message = "⚠️ Piège ! -200 / -3s";
            } else {
                const rect = target.getBoundingClientRect();
                const targetCenterX = rect.left + rect.width / 2;
                const targetCenterY = rect.top + rect.height / 2;
                const distance = Math.sqrt(
                    Math.pow(event.clientX - targetCenterX, 2) +
                    Math.pow(event.clientY - targetCenterY, 2)
                );

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
            }

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

            // 💥 Impact visuel
            const effect = document.createElement("div");
            effect.className = "hit-effect";
            effect.style.left = `${event.clientX - 20}px`;
            effect.style.top = `${event.clientY - 20}px`;
            if (isBad) effect.style.borderColor = "#ff4343";
            document.body.appendChild(effect);
            setTimeout(() => effect.remove(), 500);

            target.remove();
        }
    });

    let baseTime = 3000;
    let minTime = 500;
    let speedFactor = 1000;
    let targetDuration = Math.max(baseTime - (score / speedFactor) * 300, minTime);

    const shrinkInterval = setInterval(() => {
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

function sendScoreToServer(game, score) {
    const userEmail = window.accountManager.checkSession();
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
            console.log("Score sauvegardé avec succès :", data);
        } else {
            console.error("Erreur lors de la sauvegarde du score :", data.message);
        }
    })
    .catch(error => {
        console.error('Erreur réseau lors de la sauvegarde du score :', error);
    });
}
