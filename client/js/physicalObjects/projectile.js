import { MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';

export class Projectile {
    constructor(scene, data) {
        this.scene = scene;
        this.mesh = MeshBuilder.CreateSphere('projectile', { diameter: 0.2 }, scene);
        this.mesh.position.set(data.position.x, data.position.y, data.position.z);
        this.mesh.material = this.createMaterial();
    }

    createMaterial() {
        const material = new StandardMaterial('projectileMaterial', this.scene);
        material.emissiveColor = new Color3(1, 0, 0);
        return material;
    }

    update(data) {
        this.mesh.position.set(data.position.x, data.position.y, data.position.z);
    }
}
