import { Vector3 } from '@babylonjs/core';
import { toggleInfoVisibility } from '../ui/utils.js';
import { Particle } from '../physicalObjects/particle/particle.js';

export class Keyboard {
    constructor(scene, ship, socket) {
        this.scene = scene;
        this.ship = ship;
        this.socket = socket;
        this.keysPressed = {};
        this.infoVisibleSwitchCooldown = false;
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => this.handleKeyPress(event));
        document.addEventListener('keyup', (event) => this.handleKeyRelease(event));
    }

    handleKeyPress(event) {
        this.keysPressed[event.key.toLowerCase()] = true;
        this.sendKeyUpdate('keyPress', event.key.toLowerCase());
    }

    handleKeyRelease(event) {
        this.keysPressed[event.key.toLowerCase()] = false;
        this.sendKeyUpdate('keyRelease', event.key.toLowerCase());
    }

    sendKeyUpdate(type, key) {
        if (this.socket && this.ship) {
            this.socket.send(JSON.stringify({ type, id: this.ship.id, key }));
        }

        // Apply forces based on pressed keys
        if (key == 'e') {
            if (type == 'keyPress') {
                const forwardWorld = Vector3.TransformCoordinates(new Vector3(0, 0, 1), this.ship.mesh.getWorldMatrix());
                this.ship.mesh.acceleration.addInPlace(forwardWorld.subtract(this.ship.mesh.position).normalize().scale(this.ship.mesh.maxAcceleration));

                // Add visual effects when moving forward
                if (this.scene.isCockpitView) {
                    // Slight camera shake effect
                    const shakeIntensity = 0.01;
                    this.ship.cockpitCamera.position.addInPlace(new Vector3(
                        (Math.random() - 0.5) * shakeIntensity,
                        (Math.random() - 0.5) * shakeIntensity,
                        0
                    ));
                }

                // Add exhaust particles to the ship
                if (!this.ship.mesh.exhaustParticles) {
                    const particle = new Particle(this.scene, this.ship.mesh);
                    this.ship.mesh.exhaustParticles = particle.particleSystem;
                    this.ship.mesh.particleLight = particle.particleLight;
                }
            } else {
                // Ensure the ship slows down when the key is not pressed
                this.ship.mesh.acceleration.scaleInPlace(0.9);

                // Stop exhaust particles when not moving forward
                if (this.ship.mesh.exhaustParticles) {
                    this.ship.mesh.exhaustParticles.stop();
                    this.ship.mesh.exhaustParticles = null;
                    this.ship.mesh.particleLight.dispose();
                    this.ship.mesh.particleLight = null;
                }
            }
        }

        if (key == 'x' && type == 'keyPress') {
            toggleInfoVisibility(this.ship, this.scene);
            if (this.scene.isCockpitView) {
                playerShip.mesh.axes = setAxesVisibilityFromObject(this.ship.mesh.axes, false);
                playerShip.mesh.velocityVector = setAxesVisibilityFromObject(this.ship.mesh.velocityVector, false);
            }
            this.infoVisibleSwitchCooldown = true;
        } else {
            this.infoVisibleSwitchCooldown = false;
        }
    }
}
