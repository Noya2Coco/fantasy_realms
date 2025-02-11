import { PointLight, Vector3, Color3, ShadowGenerator } from "babylonjs";

export class ParticleLight extends PointLight {
    constructor(scene) {
        super("particleLight", new Vector3(0, 0, 0), scene);
        this.diffuse = new Color3(1, 0.5, 1);
        this.intensity = 5;
        this.range = 5;

        // Create a shadow generator to prevent light from passing through objects
        this.shadowGenerator = new ShadowGenerator(1024, this);
        this.shadowGenerator.useExponentialShadowMap = true; // Optional: use exponential shadow maps for better quality

        // Set attenuation properties similar to planet light
        this.falloffType = PointLight.FALLOFF_PHYSICAL;
        this.radius = 10; // Adjust the radius as needed
        this.range = 15; // Adjust the range as needed
        this.intensity = 1; // Adjust the intensity as needed

        // Increase attenuation for smoother gradient
        this.attenuation0 = 0.01; // Constant attenuation
        this.attenuation1 = 0.02; // Linear attenuation
        this.attenuation2 = 0.03; // Quadratic attenuation
    }
}