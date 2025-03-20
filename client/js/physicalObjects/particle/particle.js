import { ParticleSys } from './particleSys.js';
import { ParticleLight } from './particleLight.js';
import { game } from '../../client.js';

/** 🔥 Classe Particle : Gère un effet de particules attaché à un objet */
export class Particle {
    constructor(scene, emitter) {
        this.scene = scene;
        this.emitter = emitter;
        this.id = `particle-${Math.random().toString(36).substr(2, 9)}`;
        this.particleSystem = new ParticleSys(scene, emitter);
        this.particleLight = new ParticleLight(scene);

        // Ajout de la particule au WebWorker
        Particle.worker.postMessage({
            type: "addParticle",
            data: this.toJSON()
        });

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
        Particle.worker.postMessage({
            type: "removeParticle",
            data: { id: this.id }
        });
    }

    /** 📡 Convertit la particule en objet JSON */
    toJSON() {
        return {
            id: this.id,
            position: { x: this.emitter.position.x, y: this.emitter.position.y, z: this.emitter.position.z },
            velocity: { x: 0, y: 0, z: 0 }, // Assuming particles have no initial velocity
            lifeTime: this.particleSystem.maxLifeTime * 1000 // Convert to milliseconds
        };
    }
}

// Vérifie si le WebWorker est déjà créé
if (typeof Particle.worker === 'undefined') {
    Particle.worker = new Worker(new URL('./worker.js', import.meta.url));
}

Particle.worker.onmessage = function(event) {
    if (event.data.type === "updateParticles") {
        event.data.particles.forEach(updatedParticle => {
            const particle = game.particles[updatedParticle.id];
            if (particle) {
                // Utilisation de l'interpolation pour lisser les mouvements
                const emitterPosition = particle.emitter.position;
                emitterPosition.x += (updatedParticle.position.x - emitterPosition.x) * 0.2;
                emitterPosition.y += (updatedParticle.position.y - emitterPosition.y) * 0.2;
                emitterPosition.z += (updatedParticle.position.z - emitterPosition.z) * 0.2;
            }
        });
    }
};