import { PointLight, Color3, Vector3, ShadowGenerator } from "@babylonjs/core";

export class ParticleLight extends PointLight {
    constructor(scene) {
        console.log("New ParticleLight created");
        super("particleLight", new Vector3(0, 0, 0), scene);
        this.diffuse = new Color3(1, 0.5, 1); // Pink-purple light
        this.intensity = 1.5;
        this.range = 10;

        // Shadow generator to prevent light from passing through objects
        this.shadowGenerator = new ShadowGenerator(1024, this);
        this.shadowGenerator.useExponentialShadowMap = true;

        // Attenuation settings
        this.falloffType = PointLight.FALLOFF_PHYSICAL;
        this.radius = 5;
        this.range = 15;
        this.intensity = 1;

        // Fine-tuned attenuation
        this.attenuation0 = 0.01;
        this.attenuation1 = 0.02;
        this.attenuation2 = 0.03;
    }
}
