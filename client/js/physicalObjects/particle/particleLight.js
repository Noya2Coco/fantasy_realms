import { PointLight, Color3, Vector3, ShadowGenerator } from "@babylonjs/core";

export class ParticleLight extends PointLight {
    constructor(scene) {
        super("particleLight", new Vector3(0, 0, 0), scene);
        this.diffuse = new Color3(1, 0.5, 1); // Lumière rose-violette
        this.intensity = 1.5;
        this.range = 10;

        // Générateur d'ombres pour éviter que la lumière traverse les objets
        this.shadowGenerator = new ShadowGenerator(1024, this);
        this.shadowGenerator.useExponentialShadowMap = true;

        // Paramètres d'atténuation
        this.falloffType = PointLight.FALLOFF_PHYSICAL;
        this.radius = 5;
        this.range = 15;
        this.intensity = 1;

        // Ajustement de l'atténuation
        this.attenuation0 = 0.01;
        this.attenuation1 = 0.02;
        this.attenuation2 = 0.03;
    }
}
