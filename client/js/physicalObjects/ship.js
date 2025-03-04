import { MeshBuilder, StandardMaterial, Color3, Quaternion, Vector3 } from '@babylonjs/core';
import { createVelocityVector, createVelocityVectorArrow } from '../ui/vector.js';
import { createMeshAxis } from '../ui/axis.js';

export class Ship {
    constructor(scene, id, isPlayer = false) {
        this.id = id;
        this.scene = scene;
        this.isPlayer = isPlayer; // Indique si le vaisseau est contrôlé par le joueur
        this.mesh = MeshBuilder.CreateBox('ship', { width: 1, height: 0.5, depth: 2 }, this.scene);
        this.mesh.rotationQuaternion = Quaternion.Identity();
        this.mesh.acceleration = new Vector3(0, 0, 0);
        this.mesh.maxAcceleration = 0.02;
        this.mesh.velocity = new Vector3(0, 0, 0);
        this.mesh.velocityVector = null;
        this.mesh.velocityVectorArrow = null;
        this.mesh.damping = 0.99;
        this.socket = null; // Référence au socket WebSocket
        this.mesh.renderingGroupId = 1;
        this.lastBulletTime = 0;

        // Matériau du vaisseau
        const shipMaterial = new StandardMaterial('shipMaterial', this.scene);
        shipMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
        shipMaterial.emissiveColor = new Color3(0.5, 0.5, 0.5);
        shipMaterial.specularColor = new Color3(0.2, 0.2, 0.2);
        this.mesh.material = shipMaterial;

        createMeshAxis(this.mesh, this.scene, 2);
    }

    /** 🔄 Met à jour la position et la rotation du vaisseau selon les données du serveur */
    update(data) {
        if (!this.isPlayer) { // Ne pas mettre à jour si c'est le vaisseau du joueur
            this.mesh.position.set(data.position.x, data.position.y, data.position.z);
            this.mesh.rotationQuaternion.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
        }
    }

    /** 🔄 Met à jour la position et la rotation du vaisseau selon les données du serveur */
    updatePlayer(planets) {
        this.mesh.velocity.addInPlace(this.mesh.acceleration);
        this.mesh.velocity.scaleInPlace(this.mesh.damping);
        this.mesh.position.addInPlace(this.mesh.velocity);
        this.mesh.acceleration.scaleInPlace(0);
        
        if (this.mesh.velocity.length() < 0.001) {
            this.mesh.velocity = new Vector3(0, 0, 0);
        }

        this.checkCollisions(planets);
        this.adjustFov();
        this.adjustVectorLine(planets);
    }

    checkCollisions(planets) {
        // Prevent ship from passing through planets
        Object.values(planets).forEach(planet => {
            const distance = Vector3.Distance(this.mesh.position, planet.mesh.position);
            if (distance < planet.mesh.size / 2) { // Check if ship is inside the planet
                const direction = this.mesh.position.subtract(planet.mesh.position).normalize();
                this.mesh.position = planet.mesh.position.add(direction.scale(planet.mesh.size / 2)); // Move ship to the surface of the planet
                this.mesh.velocity.scaleInPlace(0); // Stop the ship's velocity
            }
        });
    }

    adjustFov() {
        let alpha = 0.1; // lissage du fov
        let newCfov = this.cockpitCamera.minFov + (this.cockpitCamera.maxFov - this.cockpitCamera.minFov) * this.mesh.velocity.length();
        this.cockpitCamera.fov = alpha * newCfov + (1 - alpha) * this.cockpitCamera.fov;
        let newTPfov = this.thirdPersonCamera.minFov + (this.thirdPersonCamera.maxFov - this.thirdPersonCamera.minFov) * this.mesh.velocity.length();
        this.thirdPersonCamera.fov = alpha * newTPfov + (1 - alpha) * this.thirdPersonCamera.fov;
    }

    adjustVectorLine(planets) {
        if (this.mesh.velocity.length() > 0.003 && !this.scene.isCockpitView && this.scene.infoVisible) {
            const displacement = this.mesh.velocity.scale(100);
            let endPoint = this.mesh.position.add(displacement);

            // Deform the velocity vector line if near planets
            Object.values(planets).forEach(planet => {
                const distance = Vector3.Distance(this.mesh.position, planet.mesh.position);
                if (distance < planet.gravitationalRange) { // Use planet's gravitational range
                    const direction = planet.mesh.position.subtract(this.mesh.position).normalize();
                    const deformation = direction.scale(50 / distance); // Adjust the deformation factor as needed
                    endPoint.addInPlace(deformation);
                }
            });

            if (this.mesh.velocityVector) {
                this.mesh.velocityVector.dispose();
            }
            this.mesh.velocityVector = createVelocityVector(this.scene, this.mesh.position, endPoint);

            // Add arrowhead at the end of the velocity vector line
            const arrowSize = Math.min(5, this.mesh.velocity.length() * 20); // Adjust arrow size based on vector length
            const arrowDirection = endPoint.subtract(this.mesh.position).normalize();
            const arrowBase = endPoint.subtract(arrowDirection.scale(arrowSize));
            const arrowLeft = arrowBase.add(Vector3.Cross(arrowDirection, new Vector3(0, 1, 0)).normalize().scale(arrowSize / 2));
            const arrowRight = arrowBase.add(Vector3.Cross(arrowDirection, new Vector3(0, -1, 0)).normalize().scale(arrowSize / 2));

            if (this.mesh.velocityVectorArrow) {
                this.mesh.velocityVectorArrow.dispose();
            }
            this.mesh.velocityVectorArrow = createVelocityVectorArrow(this.scene, this.mesh.position, endPoint, arrowLeft, arrowRight);
        } else {
            if (this.mesh.velocityVector) {
                this.mesh.velocityVector.dispose();
                this.mesh.velocityVector = null;
            }
            if (this.mesh.velocityVectorArrow) {
                this.mesh.velocityVectorArrow.dispose();
                this.mesh.velocityVectorArrow = null;
            }
        }
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
    }
}
