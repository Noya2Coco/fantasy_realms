import { MeshBuilder, Texture, StandardMaterial, Color3, Quaternion, Vector3, PointLight, HemisphericLight } from '@babylonjs/core';
import { VelocityVector } from '../ui/velocityVector.js';
import { createMeshAxis } from '../ui/axis.js';

export class Ship {
    constructor(scene, id, data, isPlayer = false) {
        this.id = data ? data.id : id;
        this.scene = scene;
        this.isPlayer = isPlayer; // Indicates if the ship is controlled by the player

        // Create the ship mesh
        this.mesh = MeshBuilder.CreateBox('ship', { width: 1, height: 0.5, depth: 2 }, this.scene);
        this.mesh.rotationQuaternion = data 
            ? new Quaternion(data.rotationQuaternion.x, data.rotationQuaternion.y, data.rotationQuaternion.z, data.rotationQuaternion.w) 
            : Quaternion.Identity();
        this.mesh.position = data 
            ? new Vector3(data.position.x, data.position.y, data.position.z) 
            : new Vector3(0, 0, 0);
        this.mesh.acceleration = new Vector3(0, 0, 0);
        this.mesh.maxAcceleration = 0.05;
        this.mesh.velocity = data 
            ? new Vector3(data.velocity.x, data.velocity.y, data.velocity.z) 
            : new Vector3(0, 0, 0);
        this.mesh.damping = 0.99;
        this.mesh.renderingGroupId = 1;
        this.lastBulletTime = 0;

        // Configure the ship material
        const shipMaterial = new StandardMaterial('shipMaterial', this.scene);
        shipMaterial.diffuseTexture = new Texture("../../images/ship.png", scene);
        shipMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8);
        shipMaterial.emissiveColor = new Color3(0.8, 0.8, 0.8);
        shipMaterial.specularColor = new Color3(0.2, 0.2, 0.2);

        // Add a default method to avoid errors
        shipMaterial.needAlphaTestingForMesh = () => false;

        this.mesh.material = shipMaterial;

        // Add a point light to the ship
        this.light = new PointLight(`light-${id}`, new Vector3(0, 0, 0), scene);
        this.light.diffuse = new Color3(1, 1, 1);
        this.light.specular = new Color3(1, 1, 1);
        this.light.intensity = 0.5;
        this.light.parent = this.mesh;

        // Add a hemispheric light for surface illumination
        this.hemisphericLight = new HemisphericLight(`hemiLight-${id}`, new Vector3(0, 1, 0), scene);
        this.hemisphericLight.diffuse = new Color3(1, 1, 1);
        this.hemisphericLight.specular = new Color3(1, 1, 1);
        this.hemisphericLight.groundColor = new Color3(0.5, 0.5, 0.5);
        this.hemisphericLight.intensity = 0.3;

        createMeshAxis(this.mesh, this.scene, 2);

        this.velocityVector = new VelocityVector(scene, `velocityVector-${id}`);
    }

    /** Updates the ship's position and rotation based on server data */
    update(data, forceUpdate = false) {
        if (!this.isPlayer || forceUpdate) {
            if (data.position) {
                this.mesh.position = new Vector3(data.position.x, data.position.y, data.position.z);
            }
            if (data.velocity) {
                this.mesh.velocity = new Vector3(data.velocity.x, data.velocity.y, data.velocity.z);
            }
            if (data.rotationQuaternion) {
                this.mesh.rotationQuaternion = new Quaternion(data.rotationQuaternion.x, data.rotationQuaternion.y, data.rotationQuaternion.z, data.rotationQuaternion.w);
            }
        }
    }

    /** Updates the player's ship position and handles collisions */
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

    /** Prevents the ship from passing through planets */
    checkCollisions(planets) {
        Object.values(planets).forEach(planet => {
            const distance = Vector3.Distance(this.mesh.position, planet.mesh.position);
            if (distance < planet.mesh.size / 2) {
                const direction = this.mesh.position.subtract(planet.mesh.position).normalize();
                this.mesh.position = planet.mesh.position.add(direction.scale(planet.mesh.size / 2));
                this.mesh.velocity.scaleInPlace(0);
            }
        });
    }

    /** Adjusts the field of view based on velocity */
    adjustFov() {
        let alpha = 0.1; // Smoothing factor
        let newCfov = this.cockpitCamera.minFov + (this.cockpitCamera.maxFov - this.cockpitCamera.minFov) * this.mesh.velocity.length();
        this.cockpitCamera.fov = alpha * newCfov + (1 - alpha) * this.cockpitCamera.fov;
        let newTPfov = this.thirdPersonCamera.minFov + (this.thirdPersonCamera.maxFov - this.thirdPersonCamera.minFov) * this.mesh.velocity.length();
        this.thirdPersonCamera.fov = alpha * newTPfov + (1 - alpha) * this.thirdPersonCamera.fov;

        // Toggle cockpit view image visibility
        const cockpitImage = document.getElementById('cockpitViewImage');
        cockpitImage.style.display = this.scene.activeCamera === this.cockpitCamera ? 'block' : 'none';
    }

    /** Updates or disposes the velocity vector line */
    adjustVectorLine(planets) {
        if (this.mesh.velocity.length() > 0.003 && this.scene.infoVisible) {
            this.velocityVector.update(this.mesh.position, this.mesh.velocity, this.mesh.damping);
        } else {
            this.velocityVector.dispose();
        }
    }

    /** Disposes of the ship and its resources */
    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
        if (this.mesh.velocityVector) {
            this.mesh.velocityVector.dispose();
        }
        if (this.mesh.velocityVectorArrow) {
            this.mesh.velocityVectorArrow.dispose();
        }
        if (this.mesh.exhaustParticles) {
            this.mesh.exhaustParticles.stop();
            this.mesh.exhaustParticles.dispose();
        }
        if (this.mesh.particleLight) {
            this.mesh.particleLight.dispose();
        }
        if (this.velocityVector) {
            this.velocityVector.dispose();
        }
    }
}
