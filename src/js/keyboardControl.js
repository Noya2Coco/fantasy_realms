import { Vector3, MeshBuilder, StandardMaterial, Color3, PointLight, Sound, ParticleSystem, Texture } from '@babylonjs/core';
import { toggleInfoVisibility, setAxesVisibilityFromObject } from './utils.js';
import { createVelocityVector, createVelocityVectorArrow } from './axis.js';

export function handleKeyPress(event, keysPressed) {
    keysPressed[event.key] = true;
}

export function handleKeyRelease(event, keysPressed) {
    keysPressed[event.key] = false;
}

let cameraSwitchCooldown = false;
let infoVisibleSwitchCooldown = false;
let lastBulletTime = 0;

export function setupKeyboardControls(keysPressed) {
    window.addEventListener('keydown', (event) => {
        handleKeyPress(event, keysPressed);
    });

    window.addEventListener('keyup', (event) => handleKeyRelease(event, keysPressed));
}

export function updateShipMovement(canvas, scene, ship, keysPressed, acceleration, velocity, maxAcceleration, damping, projectiles, cameras, planets) {
    const forward = new Vector3(0, 0, 1);

    // Apply forces based on pressed keys
    if (keysPressed['e'] || keysPressed['E']) {
        const forwardWorld = Vector3.TransformCoordinates(forward, ship.getWorldMatrix());
        acceleration.addInPlace(forwardWorld.subtract(ship.position).normalize().scale(maxAcceleration));
        
        // Add visual effects when moving forward
        if (scene.isCockpitView) {
            // Slight camera shake effect
            const shakeIntensity = 0.01;
            cameras.cockpitCamera.position.addInPlace(new Vector3(
                (Math.random() - 0.5) * shakeIntensity,
                (Math.random() - 0.5) * shakeIntensity,
                0
            ));
        }

        // Add exhaust particles to the ship
        if (!ship.exhaustParticles) {
            const particleSystem = new ParticleSystem("particles", 2000, scene);
            particleSystem.particleTexture = new Texture("textures/flare.png", scene);
            particleSystem.emitter = ship;
            particleSystem.minEmitBox = new Vector3(-0.5, -0.5, -1); // Where the particles come from
            particleSystem.maxEmitBox = new Vector3(0.5, 0.5, -1); // Where the particles come from
            particleSystem.color1 = new Color3(1, 0.5, 0); // Orange color
            particleSystem.color2 = new Color3(1, 0, 0); // Red color
            particleSystem.minSize = 0.1;
            particleSystem.maxSize = 0.5;
            particleSystem.minLifeTime = 0.2;
            particleSystem.maxLifeTime = 0.5;
            particleSystem.emitRate = 1000;
            particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;
            particleSystem.gravity = new Vector3(0, 0, 0);
            particleSystem.direction1 = new Vector3(-1, -1, -10); // Increase speed
            particleSystem.direction2 = new Vector3(1, 1, -10); // Increase speed
            particleSystem.minAngularSpeed = 0;
            particleSystem.maxAngularSpeed = Math.PI;
            particleSystem.minEmitPower = 5; // Increase speed
            particleSystem.maxEmitPower = 10; // Increase speed
            particleSystem.updateSpeed = 0.005;

            // Add light to the particles
            const particleLight = new PointLight("particleLight", new Vector3(0, 0, 0), scene);
            particleLight.diffuse = new Color3(1, 0.5, 0); // Orange color
            particleLight.intensity = 5; // Low intensity
            particleLight.range = 5; // Small range
            particleSystem.onBeforeDrawParticlesObservable.add(() => {
                particleLight.position = ship.position;
            });

            // Ensure particles are visible in space
            particleSystem.isLocal = true;
            particleSystem.renderingGroupId = 1;

            // Detach particles from the ship once emitted and remove them randomly between 1 and 10 seconds
            particleSystem.updateFunction = function(particles) {
                for (let i = 0; i < particles.length; i++) {
                    const particle = particles[i];
                    if (!particle.initialized) {
                        particle.initialized = true;
                        particle.removeTime = performance.now() + Math.random() * 9000 + 1000; // Randomly remove between 1 and 10 seconds
                    }
                    if (performance.now() > particle.removeTime) {
                        particles.splice(i, 1);
                        i--;
                    }
                }
            };

            particleSystem.start();
            ship.exhaustParticles = particleSystem;
            ship.particleLight = particleLight;
        }
    } else {
        // Ensure the ship slows down when the key is not pressed
        acceleration.scaleInPlace(0.9);
        
        // Stop exhaust particles when not moving forward
        if (ship.exhaustParticles) {
            ship.exhaustParticles.stop();
            ship.exhaustParticles = null;
            ship.particleLight.dispose();
            ship.particleLight = null;
        }
    }

    // Adjust camera FOV based on acceleration
    const accelerationMagnitude = acceleration.length();
    const fovAdjustment = accelerationMagnitude * 0.2; // Adjust the factor as needed
    if (fovAdjustment > 0) {
        cameras.cockpitCamera.fov = Math.min(cameras.cockpitCamera.fov + 0.004, cameras.cockpitCamera.maxFov);
        cameras.thirdPersonCamera.fov = Math.min(cameras.thirdPersonCamera.fov + 0.004, cameras.thirdPersonCamera.maxFov);
    } else {
        cameras.cockpitCamera.fov = Math.max(cameras.cockpitCamera.fov - 0.004, cameras.cockpitCamera.minFov);
        cameras.thirdPersonCamera.fov = Math.max(cameras.thirdPersonCamera.fov - 0.004, cameras.thirdPersonCamera.minFov);
    }

    // Apply gravitational forces from planets
    if (Array.isArray(planets)) {
        planets.forEach(planet => {
            const gravitationalForce = planet.applyGravitationalForce(ship);
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
    const currentTime = performance.now();
    if (keysPressed[' '] && currentTime - lastBulletTime > 250) { // Limit to one bullet every 500ms
        const path = [
            new Vector3(0, -1, 0), // Adjusted position to be slightly lower
            new Vector3(0, -1, 2) // Adjust length as needed
        ];
        const bullet = MeshBuilder.CreateTube('bullet', { path: path, radius: 0.05 }, scene); // Create a thin tube
        const bulletWorldPosition = Vector3.TransformCoordinates(path[0], ship.getWorldMatrix());
        bullet.position.copyFrom(bulletWorldPosition);
        bullet.rotationQuaternion = ship.rotationQuaternion.clone(); // Match the ship's orientation
        bullet.direction = Vector3.TransformNormal(new Vector3(0, 0, 1), ship.getWorldMatrix()).normalize();
        bullet.velocity = bullet.direction.scale(3).addInPlace(ship.velocity); // Increased bullet speed

        // Change bullet color to neon red and make it emissive
        const bulletMaterial = new StandardMaterial('bulletMaterial', scene);
        bulletMaterial.emissiveColor = new Color3(1, 0, 0); // Neon red color
        bulletMaterial.disableLighting = true; // Disable lighting effects on the bullet
        bullet.material = bulletMaterial;

        // Add light to the bullet
        const bulletLight = new PointLight('bulletLight', bullet.position, scene);
        bulletLight.diffuse = new Color3(1, 0, 0); // Neon red color
        bulletLight.intensity = 2; // Adjust the intensity as needed
        bulletLight.range = 5; // Adjust the range as needed
        bullet.light = bulletLight;

        // Add sound to the bullet
        const bulletSound = new Sound('bulletSound', 'sound/laser1.mp3', scene, null, {
            loop: false,
            autoplay: true,
            spatialSound: true,
            maxDistance: 200,
            refDistance: 1
        });
        bulletSound.attachToMesh(bullet);
        bullet.sound = bulletSound;

        projectiles.push(bullet);
        lastBulletTime = currentTime; // Update the last bullet time
    }

    // Update projectiles
    projectiles.forEach((bullet, index) => {
        bullet.position.addInPlace(bullet.velocity);
        bullet.light.position = bullet.position; // Update light position
        if (Vector3.Distance(bullet.position, ship.position) > 300) {
            bullet.isVisible = false;
        } else {
            bullet.isVisible = true;
        }
        if (Vector3.Distance(bullet.position, ship.position) > 500) {
            bullet.dispose();
            bullet.light.dispose(); // Dispose of the light
            projectiles.splice(index, 1);
        }
    });

    if (keysPressed['x'] && !infoVisibleSwitchCooldown) {
        toggleInfoVisibility(ship, scene);
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

        if (ship.velocityVector) {
            ship.velocityVector.dispose();
        }
        ship.velocityVector = createVelocityVector(scene, ship.position, endPoint);

        // Add arrowhead at the end of the velocity vector line
        const arrowSize = Math.min(5, velocity.length() * 20); // Adjust arrow size based on vector length
        const arrowDirection = endPoint.subtract(ship.position).normalize();
        const arrowBase = endPoint.subtract(arrowDirection.scale(arrowSize));
        const arrowLeft = arrowBase.add(Vector3.Cross(arrowDirection, new Vector3(0, 1, 0)).normalize().scale(arrowSize / 2));
        const arrowRight = arrowBase.add(Vector3.Cross(arrowDirection, new Vector3(0, -1, 0)).normalize().scale(arrowSize / 2));

        if (ship.velocityVectorArrow) {
            ship.velocityVectorArrow.dispose();
        }
        ship.velocityVectorArrow = createVelocityVectorArrow(scene, ship.position, endPoint, arrowLeft, arrowRight);
    } else {
        if (ship.velocityVector) {
            ship.velocityVector.dispose();
            ship.velocityVector = null;
        }
        if (ship.velocityVectorArrow) {
            ship.velocityVectorArrow.dispose();
            ship.velocityVectorArrow = null;
        }
    }
}
