export function drawFpsGraph(fpsInfos) {
    const fps = fpsInfos.fps; // Assurez-vous que fps est défini
    fpsInfos.data.push(fps);
    if (fpsInfos.data.length > fpsInfos.canvas.width) {
        fpsInfos.data.shift();
    }

    fpsInfos.context.clearRect(0, 0, fpsInfos.canvas.width, fpsInfos.canvas.height);
    fpsInfos.context.beginPath();
    fpsInfos.data.forEach((fps, index) => {
        const x = index;
        const y = fpsInfos.canvas.height - (fps / 60) * fpsInfos.canvas.height;
        const green = Math.min(255, Math.max(0, (fps / 60) * 255));
        const red = 255 - green;
        fpsInfos.context.strokeStyle = `rgb(${red},${green},0)`;
        if (index === 0) {
            fpsInfos.context.moveTo(x, y);
        } else {
            fpsInfos.context.lineTo(x, y);
        }
        fpsInfos.context.stroke();
    });
}