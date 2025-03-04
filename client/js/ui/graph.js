export function drawFpsGraph(fpsInfos) {
    const { fps, data, context, canvas } = fpsInfos;
    
    // Ajoute la nouvelle valeur FPS et supprime la plus ancienne si nécessaire
    data.push(fps);
    if (data.length > canvas.width) {
        data.shift();
    }

    // Efface l'ancien graphique
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessine le graphique FPS
    context.beginPath();
    data.forEach((fpsValue, index) => {
        const x = index;
        const y = canvas.height - (fpsValue / 60) * canvas.height;

        const green = Math.min(255, Math.max(0, (fpsValue / 60) * 255));
        const red = 255 - green;
        context.strokeStyle = `rgb(${red},${green},0)`;

        if (index === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
        context.stroke();
    });
}
