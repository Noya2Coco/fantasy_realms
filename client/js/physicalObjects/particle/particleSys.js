import { ParticleSystem, Texture, Vector3, Color4 } from "@babylonjs/core";

export class ParticleSys extends ParticleSystem {
    constructor(scene, emitter) {
        super("particleSys", 2000, scene); // Max particles reduced for optimization
        this.scene = scene;
        this.particleTexture = new Texture("images/flare.jpg", scene);
        this.position = emitter.position;

        // Particle emission origin
        this.minEmitBox = new Vector3(-0.5, -0.5, -0.5); // Adjusted for controlled spread
        this.maxEmitBox = new Vector3(0.5, 0.5, 0.5);

        // Particle colors
        this.color1 = new Color4(1, 0.5, 0, 1); // Orange
        this.color2 = new Color4(1, 0, 0, 0); // Red (fade out)

        // Particle size and lifetime
        this.minSize = 0.3; // Adjusted size
        this.maxSize = 0.7;
        this.minLifeTime = 1; // Adjusted lifetime
        this.maxLifeTime = 2;

        // Emission rate and velocity
        this.emitRate = 50; // Reduced emission rate
        this.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        this.gravity = new Vector3(0, -0.1, 0); // Slight gravity effect
        this.direction1 = new Vector3(-0.1, -0.1, -0.1);
        this.direction2 = new Vector3(0.1, 0.1, 0.1);
        this.minEmitPower = 0.5; // Reduced speed
        this.maxEmitPower = 1.5;
        this.updateSpeed = 0.01;
        this.renderingGroupId = 1;

        console.log(`ParticleSys created for emitter at position: ${this.position}`);
        this.start();
    }

    /** Updates the particle system */
    update(deltaTime) {
        if (!this.initialized) {
            this.initialized = true;
            this.removeTime = performance.now() + Math.random() * 9000 + 1000;
        }
        this.removeTime -= deltaTime;
        if (this.removeTime <= 0) {
            console.log("Disposing ParticleSys due to timeout");
            this.dispose();
        }
    }

    /** Stops and disposes of the particle system */
    dispose() {
        console.log("Disposing ParticleSys");
        this.stop();
        super.dispose();
        this.isDisposed = true;
    }
}
