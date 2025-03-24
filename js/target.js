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

            target.remove();
        }
    });

    let baseTime = 3000;
    let minTime = 500;
    let speedFactor = 1000;
    let targetDuration = Math.max(baseTime - (score / speedFactor) * 1000, minTime);

    // Shrink the target over time toward its center
    let shrinkInterval = setInterval(() => {
        let currentWidth = parseFloat(getComputedStyle(target).width);
        let currentHeight = parseFloat(getComputedStyle(target).height);

        if (currentWidth <= 10 || currentHeight <= 10) { // Stop shrinking at a minimum size
            clearInterval(shrinkInterval);
        } else {
            let shrinkAmount = 1; // Amount to shrink per interval
            target.style.width = `${currentWidth - shrinkAmount}px`;
            target.style.height = `${currentHeight - shrinkAmount}px`;

            // Adjust position to keep shrinking toward the center
            target.style.left = `${parseFloat(target.style.left) + shrinkAmount / 2}px`;
            target.style.top = `${parseFloat(target.style.top) + shrinkAmount / 2}px`;

            // Apply zoom-out effect
            let scaleFactor = currentWidth / (currentWidth - shrinkAmount);
            target.style.transformOrigin = "center";
            target.style.transform = `scale(${scaleFactor})`;
        }
    }, targetDuration / 70); // Adjust shrinking speed based on duration

    gameContainer.appendChild(target);
}
