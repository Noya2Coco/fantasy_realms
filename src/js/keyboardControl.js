import { Vector3, MeshBuilder, Quaternion } from '@babylonjs/core';

export function handleKeyPress(event, keysPressed) {
    keysPressed[event.key] = true;
}

export function handleKeyRelease(event, keysPressed) {
    keysPressed[event.key] = false;
}

export function updateShipMovement(canvas, scene, ship, keysPressed, acceleration, velocity, maxAcceleration, damping, projectiles, isCockpitView, cameras, setIsCockpitView) {
    const forward = new Vector3(0, 0, 1); // Vecteur avant dans le repère local du vaisseau

    // Appliquer les forces en fonction des touches enfoncées
    if (keysPressed['e'] || keysPressed['E']) {
        const forwardWorld = Vector3.TransformCoordinates(forward, ship.getWorldMatrix());
        acceleration.addInPlace(forwardWorld.subtract(ship.position).normalize().scale(maxAcceleration));
    }

    // Tir de projectiles
    if (keysPressed[' ']) {
        const bullet = MeshBuilder.CreateSphere('bullet', { diameter: 0.2 }, scene);
        bullet.position.copyFrom(ship.position);
        const forwardWorld = Vector3.TransformCoordinates(forward, ship.getWorldMatrix());
        bullet.position.addInPlace(forwardWorld.subtract(ship.position).normalize().scale(1)); // Départ devant le vaisseau
        bullet.direction = forwardWorld.subtract(ship.position).normalize();
        projectiles.push(bullet);
    }

    // Changement de vue (cockpit / 3e personne)
    if (keysPressed['v'] || keysPressed['V']) {
        scene.activeCamera.detachControl(canvas); // Détache les contrôles de la caméra actuelle
        isCockpitView = !isCockpitView;
        setIsCockpitView(isCockpitView);
        scene.activeCamera = isCockpitView ? cameras.cockpitCamera : cameras.thirdPersonCamera;
    }

    // Mise à jour de la vitesse et de la position du vaisseau
    velocity.addInPlace(acceleration);
    velocity.scaleInPlace(damping); // Appliquer le facteur de réduction de la vitesse
    ship.position.addInPlace(velocity);
    acceleration.scaleInPlace(0); // Réinitialiser l'accélération
}
