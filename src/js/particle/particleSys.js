import { ParticleSystem, Texture, Vector3, Color3 } from "babylonjs";

export class ParticleSys extends ParticleSystem {
    constructor(scene, emitter) {
        super("particleSys", 2000, scene);
        this.particleTexture = new Texture("textures/flare.png", scene);
        this.emitter = emitter;
        this.minEmitBox = new Vector3(-0.5, -0.5, -1);
        this.maxEmitBox = new Vector3(0.5, 0.5, -1);
        this.color1 = new Color3(1, 0.5, 0); // Orange color
        this.color2 = new Color3(0, 0, 0); // Red color
        this.minSize = 0.1;
        this.maxSize = 0.5;
        this.minLifeTime = 0.2;
        this.maxLifeTime = 0.5;
        this.emitRate = 1000;
        this.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        this.gravity = new Vector3(0, 0, 0);
        this.direction1 = new Vector3(-1, -1, -10); // Increase speed
        this.direction2 = new Vector3(1, 1, -10); // Increase speed
        this.minAngularSpeed = 0;
        this.maxAngularSpeed = Math.PI;
        this.minEmitPower = 5; // Increase speed
        this.maxEmitPower = 10; // Increase speed
        this.updateSpeed = 0.005;
        this.isLocal = true;
        this.renderingGroupId = 1;

        this.updateFunction = function(particles) {
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                if (!particle.initialized) {
                    particle.initialized = true;
                    particle.removeTime = performance.now() + Math.random() * 9000 + 1000; // Randomly remove between 1 and 10 seconds
                }
                if (performance.now() > particle.removeTime) {
                    particles.splice(i, 1);
                    i--;
                }
            }
        };

        this.start();
    }
}