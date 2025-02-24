import { ParticleSys } from './particleSys.js';
import { ParticleLight } from './particleLight.js';

/** 🔥 Classe Particle : Gère un effet de particules attaché à un objet */
export class Particle {
    constructor(scene, emitter) {
        this.scene = scene;
        this.emitter = emitter;
        this.particleSystem = new ParticleSys(scene, emitter);
        this.particleLight = new ParticleLight(scene);

        // Synchronisation de la lumière avec la position de l'émetteur
        this.particleSystem.onBeforeDrawParticlesObservable.add(() => {
            this.particleLight.position.copyFrom(emitter.position);
        });
    }

    /** 🛑 Arrête et nettoie le système de particules */
    dispose() {
        if (this.particleSystem) {
            this.particleSystem.stop();
            this.particleSystem.dispose();
        }
        if (this.particleLight) {
            this.particleLight.dispose();
        }
    }
}