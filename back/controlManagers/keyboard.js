import { Vector3, MeshBuilder, StandardMaterial, Color3, PointLight, Sound } from 'babylonjs';
import { setAxesVisibilityFromObject } from '../physicalObjets/ui/axis.js';
import { toggleInfoVisibility } from '../physicalObjets/ui/utils.js';
import { createVelocityVector, createVelocityVectorArrow } from '../physicalObjets/ui/vector.js';
import { Particle } from '../physicalObjets/particles/particle.js';
import { Projectile } from '../physicalObjets/projectile.js';

export function handleKeyPress(event, keysPressed) {
    keysPressed[event.key] = true;
}

export function handleKeyRelease(event, keysPressed) {
    keysPressed[event.key] = false;
}

let cameraSwitchCooldown = false;
let infoVisibleSwitchCooldown = false;
let lastProjectileTime = 0;

export function setupKeyboardControls(keysPressed) {
    window.addEventListener('keydown', (event) => {
        handleKeyPress(event, keysPressed);
    });

    window.addEventListener('keyup', (event) => handleKeyRelease(event, keysPressed));
}

export function updateShipMovement(canvas, scene, ship, keysPressed, acceleration, maxAcceleration, damping, projectiles, planets) {
    const forward = new Vector3(0, 0, 1);

    // Apply forces based on pressed keys
    if (keysPressed['e'] || keysPressed['E']) {
        const forwardWorld = Vector3.TransformCoordinates(forward, ship.mesh.getWorldMatrix());
        acceleration.addInPlace(forwardWorld.subtract(ship.mesh.position).normalize().scale(maxAcceleration));
        
        // Add visual effects when moving forward
        if (scene.isCockpitView) {
            // Slight camera shake effect
            const shakeIntensity = 0.01;
            ship.cockpitCamera.position.addInPlace(new Vector3(
                (Math.random() - 0.5) * shakeIntensity,
                (Math.random() - 0.5) * shakeIntensity,
                0
            ));
        }

        // Add exhaust particles to the ship
        if (!ship.mesh.exhaustParticles) {
            const particle = new Particle(scene, ship.mesh);
            ship.mesh.exhaustParticles = particle.particleSystem;
            ship.mesh.particleLight = particle.particleLight;
        }
    } else {
        // Ensure the ship slows down when the key is not pressed
        acceleration.scaleInPlace(0.9);
        
        // Stop exhaust particles when not moving forward
        if (ship.mesh.exhaustParticles) {
            ship.mesh.exhaustParticles.stop();
            ship.mesh.exhaustParticles = null;
            ship.mesh.particleLight.dispose();
            ship.mesh.particleLight = null;
        }
    }

    // Adjust camera FOV based on acceleration
    const accelerationMagnitude = acceleration.length();
    const fovAdjustment = accelerationMagnitude * 0.2; // Adjust the factor as needed
    if (fovAdjustment > 0) {
        ship.cockpitCamera.fov = Math.min(ship.cockpitCamera.fov + 0.004, ship.cockpitCamera.maxFov);
        ship.thirdPersonCamera.fov = Math.min(ship.thirdPersonCamera.fov + 0.004, ship.thirdPersonCamera.maxFov);
    } else {
        ship.cockpitCamera.fov = Math.max(ship.cockpitCamera.fov - 0.004, ship.cockpitCamera.minFov);
        ship.thirdPersonCamera.fov = Math.max(ship.thirdPersonCamera.fov - 0.004, ship.thirdPersonCamera.minFov);
    }

    // Apply gravitational forces from planets
    if (Array.isArray(planets)) {
        planets.forEach(planet => {
            const gravitationalForce = planet.applyGravitationalForce(ship.mesh);
            ship.mesh.velocity.addInPlace(gravitationalForce); // Apply gravitational force to velocity
        });
    }

    // Prevent ship from passing through planets
    planets.forEach(planet => {
        const distance = Vector3.Distance(ship.mesh.position, planet.position);
        if (distance < planet.size / 2) { // Check if ship is inside the planet
            const direction = ship.mesh.position.subtract(planet.position).normalize();
            ship.mesh.position = planet.position.add(direction.scale(planet.size / 2)); // Move ship to the surface of the planet
            ship.mesh.velocity.scaleInPlace(0); // Stop the ship's velocity
        }
    });

    // Fire projectiles
    const currentTime = performance.now();
    if (keysPressed[' '] && currentTime - lastProjectileTime > 250) {
        const projectile = new Projectile(scene, ship);
        projectiles.push(projectile);
        lastProjectileTime = currentTime;
    }

    // Mise à jour des projectiles
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (projectile.shouldDispose(ship.mesh.position)) {
            projectile.dispose();
            projectiles.splice(index, 1);
        }
    });
    
    if (keysPressed['x'] && !infoVisibleSwitchCooldown) {
        toggleInfoVisibility(ship, scene);
        if (scene.isCockpitView) {
            ship.mesh.axes = setAxesVisibilityFromObject(ship.mesh.axes, false);
            ship.mesh.velocityVector = setAxesVisibilityFromObject(ship.mesh.velocityVector, false);
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
            ship.mesh.axes = setAxesVisibilityFromObject(ship.mesh.axes, false);
            ship.mesh.velocityVector = setAxesVisibilityFromObject(ship.mesh.velocityVector, false);
        } else if (!scene.isCockpitView && scene.infoVisible) {
            ship.mesh.axes = setAxesVisibilityFromObject(ship.mesh.axes, true);
            ship.mesh.velocityVector = setAxesVisibilityFromObject(ship.mesh.velocityVector, true);
        }
        scene.activeCamera = scene.isCockpitView ? ship.cockpitCamera : ship.thirdPersonCamera;
        cameraSwitchCooldown = true;
    } else if (!keysPressed['v']) {
        cameraSwitchCooldown = false;
    }

    // Update ship velocity and position
    ship.mesh.velocity.addInPlace(acceleration);
    ship.mesh.velocity.scaleInPlace(damping);
    ship.mesh.position.addInPlace(ship.mesh.velocity);
    acceleration.scaleInPlace(0);

    // Update velocity vector line
    if (ship.mesh.velocity.length() > 0.003 && !scene.isCockpitView && scene.infoVisible) {
        const displacement = ship.mesh.velocity.scale(100);
        let endPoint = ship.mesh.position.add(displacement);

        // Deform the velocity vector line if near planets
        planets.forEach(planet => {
            const distance = Vector3.Distance(ship.mesh.position, planet.position);
            if (distance < planet.gravitationalRange) { // Use planet's gravitational range
                const direction = planet.position.subtract(ship.mesh.position).normalize();
                const deformation = direction.scale(50 / distance); // Adjust the deformation factor as needed
                endPoint.addInPlace(deformation);
            }
        });

        if (ship.mesh.velocityVector) {
            ship.mesh.velocityVector.dispose();
        }
        ship.mesh.velocityVector = createVelocityVector(scene, ship.mesh.position, endPoint);

        // Add arrowhead at the end of the velocity vector line
        const arrowSize = Math.min(5, ship.mesh.velocity.length() * 20); // Adjust arrow size based on vector length
        const arrowDirection = endPoint.subtract(ship.mesh.position).normalize();
        const arrowBase = endPoint.subtract(arrowDirection.scale(arrowSize));
        const arrowLeft = arrowBase.add(Vector3.Cross(arrowDirection, new Vector3(0, 1, 0)).normalize().scale(arrowSize / 2));
        const arrowRight = arrowBase.add(Vector3.Cross(arrowDirection, new Vector3(0, -1, 0)).normalize().scale(arrowSize / 2));

        if (ship.mesh.velocityVectorArrow) {
            ship.mesh.velocityVectorArrow.dispose();
        }
        ship.mesh.velocityVectorArrow = createVelocityVectorArrow(scene, ship.mesh.position, endPoint, arrowLeft, arrowRight);
    } else {
        if (ship.mesh.velocityVector) {
            ship.mesh.velocityVector.dispose();
            ship.mesh.velocityVector = null;
        }
        if (ship.mesh.velocityVectorArrow) {
            ship.mesh.velocityVectorArrow.dispose();
            ship.mesh.velocityVectorArrow = null;
        }
    }
}
