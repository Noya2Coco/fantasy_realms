import { MeshBuilder, StandardMaterial, Texture, Color3 } from "@babylonjs/core";

export class Skydome {
    constructor(scene) {
        this.scene = scene;
        const skydome = MeshBuilder.CreateSphere("skyDome", { segments: 64, diameter: 15000 }, this.scene);

        // Matériau du Skydome
        const skydomeMaterial = new StandardMaterial("skyDomeMaterial", this.scene);
        skydomeMaterial.backFaceCulling = false;
        skydomeMaterial.diffuseTexture = new Texture("/images/skydome.jpg", this.scene);
        skydomeMaterial.emissiveColor = new Color3(1, 1, 1);
        this.skydome = skydome;
        this.skydome.material = skydomeMaterial;
        this.skydome.infiniteDistance = true;
    }
}
