import { Quaternion, Vector3 } from '@babylonjs/core';

export function handleMouseMovement(event, ship) {
    const rotationSpeed = 0.002; // Vitesse de rotation

    // Calcul des vecteurs locaux du vaisseau
    const forward = new Vector3(0, 0, 1); // Vecteur avant dans le repère local du vaisseau
    const right = new Vector3(1, 0, 0); // Vecteur droite dans le repère local du vaisseau
    const up = new Vector3(0, 1, 0); // Vecteur haut dans le repère local du vaisseau

    // Calcul des forces de rotation en fonction des mouvements de la souris
    const pitchForce = event.movementY * rotationSpeed; // Force de tangage (haut/bas) proportionnelle au mouvement vertical de la souris
    const yawForce = event.movementX * rotationSpeed;   // Force de lacet (gauche/droite) proportionnelle au mouvement horizontal de la souris

    // Appliquer les forces de rotation relatives au référentiel du vaisseau
    const pitchQuaternion = Quaternion.RotationAxis(right, pitchForce); // Crée un quaternion pour la rotation autour de l'axe droite
    const yawQuaternion = Quaternion.RotationAxis(up, yawForce); // Crée un quaternion pour la rotation autour de l'axe Y (haut)

    // Combiner les quaternions pour appliquer les rotations
    const currentRotation = ship.rotationQuaternion || Quaternion.FromEulerAngles(
        ship.rotation.x, // Angle de rotation autour de l'axe X
        ship.rotation.y, // Angle de rotation autour de l'axe Y
        ship.rotation.z  // Angle de rotation autour de l'axe Z
    );
    const combinedRotation = currentRotation.multiply(pitchQuaternion).multiply(yawQuaternion); // Combine les quaternions pour obtenir la rotation finale

    // Appliquer la nouvelle rotation au vaisseau
    ship.rotationQuaternion = combinedRotation;
}
