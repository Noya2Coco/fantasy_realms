import { MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';

export class Planet {
    constructor(scene, data) {
        this.scene = scene;
        this.mesh = MeshBuilder.CreateSphere('planet', { diameter: data.size }, scene);
        this.mesh.position.set(data.position.x, data.position.y, data.position.z);
        this.mesh.material = this.createMaterial(data.isStar);
    }

    createMaterial(isStar) {
        const material = new StandardMaterial('planetMaterial', this.scene);
        material.diffuseColor = isStar ? new Color3(1, 1, 0) : new Color3(0, 1, 0);
        material.specularColor = new Color3(0.1, 0.1, 0.1);
        if (isStar) material.emissiveColor = new Color3(1, 1, 0);
        return material;
    }
}
