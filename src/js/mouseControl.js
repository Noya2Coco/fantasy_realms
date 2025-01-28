import { Quaternion, Vector3 } from '@babylonjs/core';

export function handleMouseMovement(event, ship) {
    const rotationSpeed = 0.002; // Vitesse de rotation

    // Calcul des vecteurs locaux du vaisseau
    const forward = new Vector3(0, 0, 1);
    const right = new Vector3(1, 0, 0); 
    const up = new Vector3(0, 1, 0); 

    // Calcul des forces de rotation en fonction des mouvements de la souris
    const pitchForce = event.movementY * rotationSpeed; // haut/bas
    const yawForce = event.movementX * rotationSpeed;   // gauche/droite

    // Appliquer les forces de rotation relatives au référentiel du vaisseau
    const pitchQuaternion = Quaternion.RotationAxis(right, pitchForce);
    const yawQuaternion = Quaternion.RotationAxis(up, yawForce);

    // Combiner les quaternions pour appliquer les rotations
    const currentRotation = ship.rotationQuaternion || Quaternion.FromEulerAngles(
        ship.rotation.x,
        ship.rotation.y,
        ship.rotation.z
    );
    const combinedRotation = currentRotation.multiply(pitchQuaternion).multiply(yawQuaternion); // Combine les quaternions pour obtenir la rotation finale

    // Appliquer la nouvelle rotation au vaisseau
    ship.rotationQuaternion = combinedRotation;
}

// Enter immersive mode
export function enterImmersiveMode(canvas) {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
    if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
    }
}

// Exit immersive mode
export function exitImmersiveMode() {
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
    if (document.exitPointerLock) {
        document.exitPointerLock();
    }
}