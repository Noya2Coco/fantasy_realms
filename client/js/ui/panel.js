export class Panel {
    constructor() {
        this.fpsInfos = {
            fps: 0,
            data: [],
            canvas: document.getElementById('fpsCanvas'),
            context: document.getElementById('fpsCanvas').getContext('2d'),
            display: document.getElementById('fps')
        };
        this.positionsInfos = {
            coordinatesDisplay: document.getElementById('coordinates'),
            orientationDisplay: document.getElementById('orientation'),
            shipForcesDisplay: document.getElementById('shipForces'),
            shipForcesDisplay: document.getElementById('ship-forces')
        };
    }

    updatePositionsDisplays(ship) {
        this.positionsInfos.coordinatesDisplay.textContent = `Coordinates: (${ship.mesh.position.x.toFixed(2)}, ${ship.mesh.position.y.toFixed(2)}, ${ship.mesh.position.z.toFixed(2)})`;
        const rotation = ship.mesh.rotationQuaternion.toEulerAngles();
        this.positionsInfos.orientationDisplay.textContent = `Orientation: (${rotation.x.toFixed(2)}, ${rotation.y.toFixed(2)}, ${rotation.z.toFixed(2)})`;
        this.positionsInfos.shipForcesDisplay.textContent = `Ship Forces: (${ship.mesh.velocity.x.toFixed(2)}, ${ship.mesh.velocity.y.toFixed(2)}, ${ship.mesh.velocity.z.toFixed(2)})`;
    }

    drawFpsGraph() {
        const infos = this.fpsInfos;
        infos.data.push(infos.fps);
        if (infos.data.length > infos.canvas.width) {
            infos.data.shift();
        }

        infos.context.clearRect(0, 0, infos.canvas.width, infos.canvas.height);
        
        infos.context.beginPath();
        infos.data.forEach((fpsValue, index) => {
            const x = index;
            const y = infos.canvas.height - (fpsValue / 60) * infos.canvas.height;

            const green = Math.min(255, Math.max(0, (fpsValue / 60) * 255));
            const red = 255 - green;
            infos.context.strokeStyle = `rgb(${red},${green},0)`;

            if (index === 0) {
                infos.context.moveTo(x, y);
            } else {
                infos.context.lineTo(x, y);
            }
            infos.context.stroke();
        });

        infos.display.textContent = `FPS: ${infos.fps}`;
    }
}
