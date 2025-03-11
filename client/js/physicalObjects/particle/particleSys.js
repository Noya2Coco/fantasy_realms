import { ParticleSystem, Texture, Vector3, Color4 } from "@babylonjs/core";

export class ParticleSys extends ParticleSystem {
    constructor(scene, emitter) {
        super("particleSys", 2000, scene); // Reduce max particles
        this.scene = scene;
        this.particleTexture = new Texture("images/flare.jpg", scene);
        this.emitter = emitter;

        // Définition de l'origine des particules
        this.minEmitBox = new Vector3(-0.5, -0.5, -1);
        this.maxEmitBox = new Vector3(0.5, 0.5, -1);

        // Couleurs des particules
        this.color1 = new Color4(1, 0.5, 0, 1); // Orange
        this.color2 = new Color4(1, 0, 0, 0); // Rouge (disparition)

        // Taille et durée de vie des particules
        this.minSize = 0.5; // Increase size
        this.maxSize = 1.0; // Increase size
        this.minLifeTime = 15; // Increase lifetime
        this.maxLifeTime = 20; // Increase lifetime

        // Débit et vitesse des particules
        this.emitRate = 100; // Further reduce number of particles
        this.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        this.gravity = new Vector3(0, 0, 0);
        this.direction1 = new Vector3(-0.1, -0.1, -0.1); // Reduce spread over time
        this.direction2 = new Vector3(0.1, 0.1, 0.1); // Reduce spread over time
        this.minAngularSpeed = 0;
        this.maxAngularSpeed = Math.PI;
        this.minEmitPower = 1; // Reduce speed
        this.maxEmitPower = 2; // Reduce speed
        this.updateSpeed = 0.01;
        this.renderingGroupId = 1;

        // Activation du système de particules
        this.start();
    }

    /** 🔄 Met à jour le système de particules */
    update(deltaTime) {
        if (!this.initialized) {
            this.initialized = true;
            this.removeTime = performance.now() + Math.random() * 9000 + 1000;
        }
        this.removeTime -= deltaTime; // Update removeTime based on deltaTime
        if (this.removeTime <= 0) {
            this.dispose();
        }
    }

    /** 🛑 Arrête proprement le système de particules */
    dispose() {
        this.stop();
        super.dispose();
        this.isDisposed = true;
    }
}
