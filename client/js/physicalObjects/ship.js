import { MeshBuilder, StandardMaterial, Color3, Quaternion } from '@babylonjs/core';

export class Ship {
    constructor(scene, id, isPlayer = false) {
        this.id = id;
        this.scene = scene;
        this.isPlayer = isPlayer; // Indique si le vaisseau est contrôlé par le joueur
        this.mesh = MeshBuilder.CreateBox('ship', { width: 1, height: 0.5, depth: 2 }, this.scene);
        this.mesh.rotationQuaternion = Quaternion.Identity();
        this.mesh.renderingGroupId = 1;

        // Matériau du vaisseau
        const shipMaterial = new StandardMaterial('shipMaterial', this.scene);
        shipMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
        shipMaterial.emissiveColor = new Color3(0.5, 0.5, 0.5);
        shipMaterial.specularColor = new Color3(0.2, 0.2, 0.2);
        this.mesh.material = shipMaterial;
    }

    /** 🔄 Met à jour la position du vaisseau selon les données du serveur */
    update(data) {
        if (!this.isPlayer) { // Ne pas mettre à jour si c'est le vaisseau du joueur
            this.mesh.position.set(data.position.x, data.position.y, data.position.z);
            this.mesh.rotationQuaternion.set(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
        }
    }
}
