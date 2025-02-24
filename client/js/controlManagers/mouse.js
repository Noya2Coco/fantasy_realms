import { Quaternion, Vector3 } from '@babylonjs/core';

export class Mouse {
    constructor(canvas, document, ship) {
        this.ship = ship;
        this.rotationSpeed = 0.002; // Augmenté pour plus de réactivité
        this.updateInterval = 100; // Fréquence d'envoi des données au serveur (ms)
        this.rotationForce = new Vector3(0, 0, 0);
        this.lastUpdateTime = Date.now();
        this.smoothFactor = 0.15; // Facteur d'interpolation pour lisser la rotation

        // Bind event listeners
        canvas.addEventListener('click', () => this.enterImmersiveMode(canvas));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.exitImmersiveMode();
            }
        });
        canvas.addEventListener('mousemove', (event) => this.handleMouseMovement(event));
    }

    handleMouseMovement(event) {
        // Ajout progressif de la rotation
        this.rotationForce.x += event.movementY * this.rotationSpeed; // Haut/Bas
        this.rotationForce.y += event.movementX * this.rotationSpeed; // Gauche/Droite
    }

    applyRotationForce() {
        // Vérification si un mouvement significatif est appliqué
        if (Math.abs(this.rotationForce.x) < 0.0001 && Math.abs(this.rotationForce.y) < 0.0001) {
            return; // Ignore les petites variations pour éviter l'effet de "tremblement"
        }

        const right = new Vector3(1, 0, 0);
        const up = new Vector3(0, 1, 0);

        const pitchQuaternion = Quaternion.RotationAxis(right, this.rotationForce.x);
        const yawQuaternion = Quaternion.RotationAxis(up, this.rotationForce.y);

        const currentRotation = this.ship.mesh.rotationQuaternion || Quaternion.Identity();

        // ✅ Utilisation de `Slerp` pour lisser la transition et éviter les saccades
        const targetRotation = currentRotation.multiply(pitchQuaternion).multiply(yawQuaternion);
        this.ship.mesh.rotationQuaternion = Quaternion.Slerp(currentRotation, targetRotation, this.smoothFactor);

        // Réduction progressive des forces au lieu de les remettre à zéro directement
        this.rotationForce.scaleInPlace(0.85);

        // Mise à jour serveur à intervalle régulier
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
        
        const data = {
            type: 'updateShip',
            id: this.ship.id,
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w }
        };

        this.ship.socket.send(JSON.stringify(data));
    }

    enterImmersiveMode(canvas) {
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    }

    exitImmersiveMode() {
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }
}
