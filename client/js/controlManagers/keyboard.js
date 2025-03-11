import { Vector3 } from '@babylonjs/core';
import { toggleInfoVisibility } from '../ui/utils.js';
import { Particle } from '../physicalObjects/particle/particle.js';
import { Bullet } from '../physicalObjects/bullet.js';
import { setAxesVisibility } from '../ui/axis.js';

export class Keyboard {
    constructor(canvas, scene, ship, projectiles, socket) {
        this.canvas = canvas;
        this.scene = scene;
        this.ship = ship;
        this.projectiles = projectiles;
        this.socket = socket;
        this.keysPressed = {};
        this.infoVisibleSwitchCooldown = false;
        this.cameraSwitchCooldown = false;
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (event) => this.handleKeyPress(event));
        window.addEventListener('keyup', (event) => this.handleKeyRelease(event));
    }

    handleKeyPress(event) {
        this.keysPressed[event.key] = true;
    }
    
    handleKeyRelease(event) {
        this.keysPressed[event.key] = false;
    }

    checkPressedKeys() {
        const currentTime = performance.now();

        // Apply forces based on pressed keys
        if (this.keysPressed['e']) {
            const forwardWorld = Vector3.TransformCoordinates(new Vector3(0, 0, 1), this.ship.mesh.getWorldMatrix());
            this.ship.mesh.acceleration.addInPlace(forwardWorld.subtract(this.ship.mesh.position).normalize().scale(this.ship.mesh.maxAcceleration));

            // Add exhaust particles to the ship
            if (!this.ship.mesh.exhaustParticles) {
                const particle = new Particle(this.scene, this.ship.mesh);
                this.ship.mesh.exhaustParticles = particle.particleSystem;
                this.ship.mesh.particleLight = particle.particleLight;
            }

            this.socket.send(JSON.stringify({
                type: 'updateShip',
                id: this.ship.id,
                position: {
                    x: this.ship.mesh.position.x,
                    y: this.ship.mesh.position.y,
                    z: this.ship.mesh.position.z
                },
                rotationQuaternion: {
                    x: this.ship.mesh.rotationQuaternion.x,
                    y: this.ship.mesh.rotationQuaternion.y,
                    z: this.ship.mesh.rotationQuaternion.z,
                    w: this.ship.mesh.rotationQuaternion.w
                },
                velocity: {
                    x: this.ship.mesh.velocity.x,
                    y: this.ship.mesh.velocity.y,
                    z: this.ship.mesh.velocity.z
                }
            }));
        } else {
            // Stop exhaust particles when not moving forward
            if (this.ship.mesh.exhaustParticles) {
                this.ship.mesh.exhaustParticles.stop();
                this.ship.mesh.exhaustParticles = null;
                this.ship.mesh.particleLight.dispose();
                this.ship.mesh.particleLight = null;
            }
        }

        if (this.keysPressed['x'] && !this.infoVisibleSwitchCooldown) {
            toggleInfoVisibility(this.ship, this.scene);
            if (this.scene.isCockpitView) {
                this.ship.mesh.axes = setAxesVisibility(this.ship.mesh.axes, false);
                this.ship.mesh.velocityVector = setAxesVisibility(this.ship.mesh.velocityVector, false);
            }
            this.infoVisibleSwitchCooldown = true;
        } else if (!this.keysPressed['x']) {
            this.infoVisibleSwitchCooldown = false;
        }

        if (this.keysPressed['v'] && !this.cameraSwitchCooldown) {
            this.scene.activeCamera.detachControl(this.canvas);
            this.scene.isCockpitView = !this.scene.isCockpitView;
            if (this.scene.isCockpitView) {
                this.ship.mesh.axes = setAxesVisibility(this.ship.mesh.axes, false);
                this.ship.mesh.velocityVector = setAxesVisibility(this.ship.mesh.velocityVector, false);
            } else if (!this.scene.isCockpitView && this.scene.infoVisible) {
                this.ship.mesh.axes = setAxesVisibility(this.ship.mesh.axes, true);
                this.ship.mesh.velocityVector = setAxesVisibility(this.ship.mesh.velocityVector, true);
            }
            this.scene.activeCamera = this.scene.isCockpitView ? this.ship.cockpitCamera : this.ship.thirdPersonCamera;
            this.cameraSwitchCooldown = true;
        } else if (!this.keysPressed['v']) {
            this.cameraSwitchCooldown = false;
        }

        if (this.keysPressed[' '] && currentTime - this.ship.lastBulletTime > 250) { // Limit to one bullet every 250ms
            const bullet = new Bullet(this.scene, this.ship);
            this.projectiles[bullet.id] = bullet; // Store bullet internally
            this.ship.lastBulletTime = currentTime; // Update the last bullet time
            
            if (this.socket) {
                this.socket.send(JSON.stringify({
                    type: 'fireProjectile',
                    id: bullet.id,
                    position: bullet.mesh.position,
                    rotation: bullet.mesh.rotationQuaternion,
                    direction: bullet.mesh.direction,
                    velocity: bullet.mesh.velocity,
                    shipId: this.ship.id
                }));
            }

            bullet.mesh.onDisposeObservable.add(() => {
                delete this.projectiles[bullet.id];
            });
        }

        // Update ship data in the worker
        Bullet.updateShipData(this.ship);
    }
}
