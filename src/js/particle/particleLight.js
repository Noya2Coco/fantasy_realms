import { PointLight, Vector3, Color3 } from "babylonjs";

export class ParticleLight extends PointLight {
    constructor(scene, ) {
        super("particleLight", new Vector3(0, 0, 0), scene);
        this.diffuse = new Color3(1, 0.5, 1);
        this.intensity = 5;
        this.range = 5;
    }
}