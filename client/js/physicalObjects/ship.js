import { MeshBuilder, StandardMaterial, Color3, Quaternion, Vector3, PointLight, HemisphericLight } from '@babylonjs/core';
import { VelocityVector } from '../ui/velocityVector.js';
import { createMeshAxis } from '../ui/axis.js';

export class Ship {
    constructor(scene, id, data, isPlayer = false) {
        this.id = data ? data.id : id;
        this.scene = scene;
        this.isPlayer = isPlayer; // Indique si le vaisseau est contrôlé par le joueur
        this.mesh = MeshBuilder.CreateBox('ship', { width: 1, height: 0.5, depth: 2 }, this.scene);
        this.mesh.rotationQuaternion = data ? new Quaternion(data.rotationQuaternion.x, data.rotationQuaternion.y, data.rotationQuaternion.z, data.rotationQuaternion.w) : Quaternion.Identity();
        this.mesh.position = data ? new Vector3(data.position.x, data.position.y, data.position.z) : new Vector3(0, 0, 0);
        this.mesh.acceleration = new Vector3(0, 0, 0);
        this.mesh.maxAcceleration = 0.02;
        this.mesh.velocity = data ? new Vector3(data.velocity.x, data.velocity.y, data.velocity.z) : new Vector3(0, 0, 0);
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

        // Ajoutez une méthode par défaut pour éviter les erreurs
        shipMaterial.needAlphaTestingForMesh = () => false;

        this.mesh.material = shipMaterial;

        // Add a light source to the ship
        this.light = new PointLight(`light-${id}`, new Vector3(0, 0, 0), scene);
        this.light.diffuse = new Color3(1, 1, 1);
        this.light.specular = new Color3(1, 1, 1);
        this.light.intensity = 0.5; // Adjust intensity as needed
        this.light.parent = this.mesh; // Attach light to the ship

        // Add a hemispheric light to illuminate the ship's surface
        this.hemisphericLight = new HemisphericLight(`hemiLight-${id}`, new Vector3(0, 1, 0), scene);
        this.hemisphericLight.diffuse = new Color3(1, 1, 1);
        this.hemisphericLight.specular = new Color3(1, 1, 1);
        this.hemisphericLight.groundColor = new Color3(0.5, 0.5, 0.5);
        this.hemisphericLight.intensity = 0.3; // Adjust intensity as needed

        createMeshAxis(this.mesh, this.scene, 2);

        this.velocityVector = new VelocityVector(scene, `velocityVector-${id}`);
    }

    /** 🔄 Met à jour la position et la rotation du vaisseau selon les données du serveur */
    update(data, forceUpdate = false) {
        if (!this.isPlayer || forceUpdate) { // Ne pas mettre à jour si c'est le vaisseau du joueur, sauf si forceUpdate est vrai
            if (data.position) {
                this.mesh.position = new Vector3(data.position.x, data.position.y, data.position.z);
            }
            if (data.velocity) {
                this.mesh.velocity = new Vector3(data.velocity.x, data.velocity.y, data.velocity.z);
            }
            if (data.rotationQuaternion) {
                this.mesh.rotationQuaternion = new Quaternion(data.rotationQuaternion.x, data.rotationQuaternion.y, data.rotationQuaternion.z, data.rotationQuaternion.w);
            }
            //console.log(`🚀 Mise à jour du vaisseau ${this.id}`);
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
        if (this.mesh.velocity.length() > 0.003 && this.scene.infoVisible) {
            console.log(`[Ship] Adjusting velocity vector for ship: ${this.id}`);
            console.log(`[Ship] Velocity: ${this.mesh.velocity}, Damping: ${this.mesh.damping}`);

            // Mettre à jour le vecteur de vitesse en 3D
            this.velocityVector.update(this.mesh.position, this.mesh.velocity, this.mesh.damping);
        } else {
            console.log(`[Ship] Velocity too low or info not visible. Disposing velocity vector.`);
            this.velocityVector.dispose();
        }
    }

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
