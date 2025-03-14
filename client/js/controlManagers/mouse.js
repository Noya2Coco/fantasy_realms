import { Quaternion, Vector3 } from '@babylonjs/core';

export class Mouse {
    constructor(canvas, document, ship) {
        this.ship = ship;
        this.rotationSpeed = 0.002; // Augmenté pour plus de réactivité
        this.updateInterval = 100; // Fréquence d'envoi des données au serveur (ms)
        this.rotationForce = new Vector3(0, 0, 0);
        this.lastUpdateTime = Date.now();
        this.smoothFactor = 0.15; // Facteur d'interpolation pour lisser la rotation

        // Bind event listeners to canvas and document
        this.bindEventListeners(canvas, document);
    }

    bindEventListeners(canvas, document) {
        // Enter immersive mode on canvas click
        canvas.addEventListener('click', () => this.enterImmersiveMode(canvas));
        // Exit immersive mode on Escape key press
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.exitImmersiveMode();
            }
        });
        // Handle mouse movement
        canvas.addEventListener('mousemove', (event) => this.handleMouseMovement(event));
    }

    handleMouseMovement(event) {
        // Update rotation force based on mouse movement
        this.rotationForce.x += event.movementY * this.rotationSpeed; // Haut/Bas
        this.rotationForce.y += event.movementX * this.rotationSpeed; // Gauche/Droite
    }

    applyRotationForce() {
        // Ignore small variations to avoid jitter
        if (Math.abs(this.rotationForce.x) < 0.0001 && Math.abs(this.rotationForce.y) < 0.0001) {
            return;
        }

        const right = new Vector3(1, 0, 0);
        const up = new Vector3(0, 1, 0);

        // Create quaternions for pitch and yaw rotations
        const pitchQuaternion = Quaternion.RotationAxis(right, this.rotationForce.x);
        const yawQuaternion = Quaternion.RotationAxis(up, this.rotationForce.y);

        const currentRotation = this.ship.mesh.rotationQuaternion || Quaternion.Identity();

        // Smoothly interpolate to the new rotation
        const targetRotation = currentRotation.multiply(pitchQuaternion).multiply(yawQuaternion);
        this.ship.mesh.rotationQuaternion = Quaternion.Slerp(currentRotation, targetRotation, this.smoothFactor);

        // Gradually reduce the rotation force
        this.rotationForce.scaleInPlace(0.85);

        // Send update to server at regular intervals
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime > this.updateInterval) {
            this.sendUpdateToServer();
            this.lastUpdateTime = currentTime;
        }
    }

    sendUpdateToServer() {
        if (!this.ship.socket) return;

        const rotation = this.ship.mesh.rotationQuaternion;
        const position = this.ship.mesh.position;
        
        // Prepare data to send to the server
        const data = {
            type: 'updateShip',
            id: this.ship.id,
            position: { x: position.x, y: position.y, z: position.z },
            rotationQuaternion: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w }
        };

        // Send data to the server
        this.ship.socket.send(JSON.stringify(data));
    }

    enterImmersiveMode(canvas) {
        // Request pointer lock for immersive mode
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    }

    exitImmersiveMode() {
        // Exit pointer lock to leave immersive mode
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }
}
