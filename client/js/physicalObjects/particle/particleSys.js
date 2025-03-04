import { ParticleSystem, Texture, Vector3, Color4 } from "@babylonjs/core";

export class ParticleSys extends ParticleSystem {
    constructor(scene, emitter) {
        super("particleSys", 5000, scene); // Nombre max de particules
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
        this.minSize = 0.3;
        this.maxSize = 0.8;
        this.minLifeTime = 1;
        this.maxLifeTime = 2;

        // Débit et vitesse des particules
        this.emitRate = 1000;
        this.blendMode = ParticleSystem.BLENDMODE_ONEONE;
        this.gravity = new Vector3(0, 0, 0);
        this.direction1 = new Vector3(-1, -1, -5);
        this.direction2 = new Vector3(1, 1, -5);
        this.minEmitPower = 2;
        this.maxEmitPower = 5;
        this.updateSpeed = 0.01;
        this.renderingGroupId = 1;

        // Activation du système de particules
        this.start();
    }

    /** 🔄 Met à jour le système de particules */
    update() {
        // Ajoutez ici la logique de mise à jour si nécessaire
        // Par exemple, ajuster les propriétés des particules en fonction du temps ou des événements
    }

    /** 🛑 Arrête proprement le système de particules */
    dispose() {
        this.stop();
        super.dispose();
    }
}
