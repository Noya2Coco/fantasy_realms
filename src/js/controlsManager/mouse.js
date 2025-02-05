import { Quaternion, Vector3 } from 'babylonjs';

export class Mouse {
    constructor(canvas, document, ship) {
        this.ship = ship;
        this.rotationSpeed = 0.002; // Vitesse de rotation

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
        // Calcul des vecteurs locaux du vaisseau
        const right = new Vector3(1, 0, 0); 
        const up = new Vector3(0, 1, 0); 

        // Calcul des forces de rotation en fonction des mouvements de la souris
        const pitchForce = event.movementY * this.rotationSpeed; // haut/bas
        const yawForce = event.movementX * this.rotationSpeed;   // gauche/droite

        // Appliquer les forces de rotation relatives au référentiel du vaisseau
        const pitchQuaternion = Quaternion.RotationAxis(right, pitchForce);
        const yawQuaternion = Quaternion.RotationAxis(up, yawForce);

        // Combiner les quaternions pour appliquer les rotations
        const currentRotation = this.ship.mesh.rotationQuaternion || Quaternion.FromEulerAngles(
            this.ship.mesh.rotation.x,
            this.ship.mesh.rotation.y,
            this.ship.mesh.rotation.z
        );
        const combinedRotation = currentRotation.multiply(pitchQuaternion).multiply(yawQuaternion); // Combine les quaternions pour obtenir la rotation finale

        // Appliquer la nouvelle rotation au vaisseau
        this.ship.mesh.rotationQuaternion = combinedRotation;
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