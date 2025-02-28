import { MeshBuilder, StandardMaterial, Color3, Quaternion, Vector3 } from '@babylonjs/core';

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

        // Matériau du vaisseau
        const shipMaterial = new StandardMaterial('shipMaterial', this.scene);
        shipMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
        shipMaterial.emissiveColor = new Color3(0.5, 0.5, 0.5);
        shipMaterial.specularColor = new Color3(0.2, 0.2, 0.2);
        this.mesh.material = shipMaterial;
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

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
    }
}
