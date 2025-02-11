import { ParticleSystem, Texture, Vector3, Color4 } from "babylonjs";

export class ParticleSys extends ParticleSystem {
    constructor(scene, emitter) {
        super("particleSys", 8000, scene); // Increase capacity to 5000
        this.particleTexture = new Texture("images/flare.jpg", scene);
        this.emitter = emitter;
        this.minEmitBox = new Vector3(-0.5, -0.5, -1);
        this.maxEmitBox = new Vector3(0.5, 0.5, -1);
        this.color1 = new Color4(1, 0.5, 0, 1); // Orange color with full alpha
        this.color2 = new Color4(1, 0, 0, 0); // Red color with zero alpha for gradient effect
        this.minSize = 0.5; // Increase minimum size
        this.maxSize = 1.0; // Increase maximum size
        this.minLifeTime = 12; // Minimum lifetime of 20 seconds
        this.maxLifeTime = 20; // Maximum lifetime of 30 seconds
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
        this.range = 50; // Increase visibility range

        this.updateFunction = function(particles) {
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                if (!particle.initialized) {
                    particle.initialized = true;
                    particle.removeTime = performance.now() + Math.random() * (this.maxLifeTime - this.minLifeTime) * 1000 + this.minLifeTime * 1000;
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