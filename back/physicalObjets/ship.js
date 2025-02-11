import { MeshBuilder, Quaternion, Vector3, StandardMaterial, Color3 } from 'babylonjs';

export class Ship {
    constructor(scene) {
        this.parent = scene;
        this.mesh = MeshBuilder.CreateBox('ship', { width: 1, height: 0.5, depth: 2 }, this.parent);
        this.mesh.position.z = -5;
        this.mesh.rotationQuaternion = Quaternion.Identity();
        this.mesh.velocity = new Vector3(0, 0, 0); // Initialize velocity property
        this.mesh.velocityVector = null;
        this.mesh.velocityVectorArrow = null;
        this.mesh.renderingGroupId = 1;

        // Add emissive material to the ship
        const shipMaterial = new StandardMaterial('shipMaterial', this.parent);
        shipMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5); // Base color
        shipMaterial.emissiveColor = new Color3(0.5, 0.5, 0.5); // Increase emissive color for more light
        shipMaterial.specularColor = new Color3(0.2, 0.2, 0.2); // Increase specular color for more diffusion
        this.mesh.material = shipMaterial;
    }
}