export class Panel {
    constructor() {
        // FPS-related information
        this.fpsInfos = {
            fps: 0,
            data: [],
            canvas: document.getElementById('fpsCanvas'),
            context: document.getElementById('fpsCanvas').getContext('2d'),
            display: document.getElementById('fps')
        };

        // Position and orientation information
        this.positionsInfos = {
            coordinates: document.getElementById('coordinates'),
            orientation: document.getElementById('orientation'),
            forces: document.getElementById('ship-forces'),
            axes: document.getElementById('axesCanvas').getContext('2d')
        };

        // Element count display
        this.elementCountDisplay = {
            ships: document.getElementById('number-of-ships'),
            projectiles: document.getElementById('number-of-bullets'),
            planets: document.getElementById('number-of-planets'),
            particles: document.getElementById('number-of-particles')
        };

        const infoPanel = document.getElementById('infoPanel');
        infoPanel.appendChild(this.elementCountDisplay.ships);
        infoPanel.appendChild(this.elementCountDisplay.projectiles);
        infoPanel.appendChild(this.elementCountDisplay.planets);
        infoPanel.appendChild(this.elementCountDisplay.particles);
    }

    /** Updates position, orientation, and force displays for the ship */
    updatePositionsDisplays(ship) {
        if (!ship || !ship.mesh) return;
        this.positionsInfos.coordinates.textContent = `Coordinates: (${ship.mesh.position.x.toFixed(2)}, ${ship.mesh.position.y.toFixed(2)}, ${ship.mesh.position.z.toFixed(2)})`;
        const rotation = ship.mesh.rotationQuaternion.toEulerAngles();
        this.positionsInfos.orientation.textContent = `Orientation: (${rotation.x.toFixed(2)}, ${rotation.y.toFixed(2)}, ${rotation.z.toFixed(2)})`;
        this.positionsInfos.forces.textContent = `Forces: (${ship.mesh.velocity.x.toFixed(2)}, ${ship.mesh.velocity.y.toFixed(2)}, ${ship.mesh.velocity.z.toFixed(2)})`;
    }

    /** Draws the FPS graph on the canvas */
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

    /** Updates the element count display */
    updateElementCountDisplay(counts) {
        this.elementCountDisplay.ships.textContent = `Ships: ${counts.ships}`;
        this.elementCountDisplay.projectiles.textContent = `Bullets: ${counts.projectiles}`;
        this.elementCountDisplay.planets.textContent = `Planets: ${counts.planets}`;
        this.elementCountDisplay.particles.textContent = `Particles: ${counts.particles}`;
    }
}
