import { Vector3, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { toggleInfoVisibility, setAxesVisibilityFromObject } from './utils.js';
import { createVelocityVector } from './axis.js';

export function handleKeyPress(event, keysPressed) {
    keysPressed[event.key] = true;
}

export function handleKeyRelease(event, keysPressed) {
    keysPressed[event.key] = false;
}

let cameraSwitchCooldown = false;
let infoVisibleSwitchCooldown = false;

export function setupKeyboardControls(keysPressed) {
    window.addEventListener('keydown', (event) => {
        handleKeyPress(event, keysPressed);
    });

    window.addEventListener('keyup', (event) => handleKeyRelease(event, keysPressed));
}

export function updateShipMovement(canvas, scene, ship, keysPressed, acceleration, velocity, maxAcceleration, damping, projectiles, cameras, planets, gravitationalConstant, velocityVector, velocityVectorArrow, setVelocityVector) {
    const forward = new Vector3(0, 0, 1);

    // Apply forces based on pressed keys
    if (keysPressed['e'] || keysPressed['E']) {
        const forwardWorld = Vector3.TransformCoordinates(forward, ship.getWorldMatrix());
        acceleration.addInPlace(forwardWorld.subtract(ship.position).normalize().scale(maxAcceleration));
    } else {
        // Ensure the ship slows down when the key is not pressed
        acceleration.scaleInPlace(0.9);
    }

    // Apply gravitational forces from planets
    if (Array.isArray(planets)) {
        planets.forEach(planet => {
            const gravitationalForce = planet.applyGravitationalForce(ship, gravitationalConstant);
            velocity.addInPlace(gravitationalForce); // Apply gravitational force to velocity
        });
    }

    // Prevent ship from passing through planets
    planets.forEach(planet => {
        const distance = Vector3.Distance(ship.position, planet.position);
        if (distance < planet.size / 2) { // Check if ship is inside the planet
            const direction = ship.position.subtract(planet.position).normalize();
            ship.position = planet.position.add(direction.scale(planet.size / 2)); // Move ship to the surface of the planet
            velocity.scaleInPlace(0); // Stop the ship's velocity
        }
    });

    // Fire projectiles
    if (keysPressed[' ']) {
        const bullet = MeshBuilder.CreateSphere('bullet', { diameter: 0.2 }, scene);
        const bulletSpawnPosition = new Vector3(0, -1.5, 0); // Fixed position relative to the ship's local axes
        const bulletWorldPosition = Vector3.TransformCoordinates(bulletSpawnPosition, ship.getWorldMatrix());
        bullet.position.copyFrom(bulletWorldPosition);
        bullet.direction = Vector3.TransformNormal(new Vector3(0, 0, 1), ship.getWorldMatrix()).normalize();
        bullet.velocity = bullet.direction.scale(2).addInPlace(ship.velocity); // Add ship's velocity to bullet's velocity

        // Change bullet color to neon yellow
        const bulletMaterial = new StandardMaterial('bulletMaterial', scene);
        bulletMaterial.diffuseColor = new Color3(1, 1, 0);
        bullet.material = bulletMaterial;

        projectiles.push(bullet);
    }

    // Update projectiles
    projectiles.forEach((bullet, index) => {
        bullet.position.addInPlace(bullet.velocity);
        if (Vector3.Distance(bullet.position, ship.position) > 150) {
            bullet.isVisible = false;
        } else {
            bullet.isVisible = true;
        }
        if (Vector3.Distance(bullet.position, ship.position) > 200) {
            bullet.dispose();
            projectiles.splice(index, 1);
        }
    });

    if (keysPressed['x'] && !infoVisibleSwitchCooldown) {
        toggleInfoVisibility(ship, scene, velocityVector, velocityVectorArrow);
        if (scene.isCockpitView) {
            ship.axes = setAxesVisibilityFromObject(ship.axes, false);
            ship.velocityVector = setAxesVisibilityFromObject(ship.velocityVector, false);
        }
        infoVisibleSwitchCooldown = true;
    } else if (!keysPressed['x']) {
        infoVisibleSwitchCooldown = false;
    }

    // Toggle view (cockpit / third person)
    if (keysPressed['v'] && !cameraSwitchCooldown) {
        scene.activeCamera.detachControl(canvas);
        scene.isCockpitView = !scene.isCockpitView;
        if (scene.isCockpitView) {
            ship.axes = setAxesVisibilityFromObject(ship.axes, false);
            ship.velocityVector = setAxesVisibilityFromObject(ship.velocityVector, false);
        } else if (!scene.isCockpitView && scene.infoVisible) {
            ship.axes = setAxesVisibilityFromObject(ship.axes, true);
            ship.velocityVector = setAxesVisibilityFromObject(ship.velocityVector, true);
        }
        scene.activeCamera = scene.isCockpitView ? cameras.cockpitCamera : cameras.thirdPersonCamera;
        cameraSwitchCooldown = true;
    } else if (!keysPressed['v']) {
        cameraSwitchCooldown = false;
    }

    // Update ship velocity and position
    velocity.addInPlace(acceleration);
    velocity.scaleInPlace(damping);
    ship.position.addInPlace(velocity);
    acceleration.scaleInPlace(0);

    // Update velocity vector line
    if (velocity.length() > 0.003 && !scene.isCockpitView && scene.infoVisible) {
        const displacement = velocity.scale(100);
        let endPoint = ship.position.add(displacement);

        // Deform the velocity vector line if near planets
        planets.forEach(planet => {
            const distance = Vector3.Distance(ship.position, planet.position);
            if (distance < planet.gravitationalRange) { // Use planet's gravitational range
                const direction = planet.position.subtract(ship.position).normalize();
                const deformation = direction.scale(50 / distance); // Adjust the deformation factor as needed
                endPoint.addInPlace(deformation);
            }
        });

        if (velocityVector) {
            velocityVector.dispose();
        }
        velocityVector = createVelocityVector(scene, endPoint);

        // Add arrowhead at the end of the velocity vector line
        const arrowSize = Math.min(5, velocity.length() * 20); // Adjust arrow size based on vector length
        const arrowDirection = endPoint.subtract(ship.position).normalize();
        const arrowBase = endPoint.subtract(arrowDirection.scale(arrowSize));
        const arrowLeft = arrowBase.add(Vector3.Cross(arrowDirection, new Vector3(0, 1, 0)).normalize().scale(arrowSize / 2));
        const arrowRight = arrowBase.add(Vector3.Cross(arrowDirection, new Vector3(0, -1, 0)).normalize().scale(arrowSize / 2));

        if (velocityVectorArrow) {
            velocityVectorArrow.dispose();
        }
        velocityVectorArrow = MeshBuilder.CreateLines(
            "velocityVectorArrow",
            { points: [arrowLeft, endPoint, arrowRight] },
            scene
        );
        velocityVectorArrow.color = new Color3(1, 0, 1); // Pink color

        setVelocityVector(velocityVector, velocityVectorArrow);
    } else {
        if (velocityVector) {
            velocityVector.dispose();
            velocityVector = null;
        }
        if (velocityVectorArrow) {
            velocityVectorArrow.dispose();
            velocityVectorArrow = null;
        }
        setVelocityVector(null, null);
    }
}
