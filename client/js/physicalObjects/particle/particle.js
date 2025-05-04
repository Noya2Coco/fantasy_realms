import { ParticleSys } from './particleSys.js';
import { ParticleLight } from './particleLight.js';
import { game } from '../../client.js';
import { Vector3 } from 'babylonjs';

/** Manages a particle effect attached to an object */
export class Particle {
    constructor(scene, emitter) {
        this.scene = scene;
        this.id = `particle-${Math.random().toString(36).substr(2, 9)}`;
        this.particleSystem = new ParticleSys(scene, emitter);
        this.particleLight = new ParticleLight(scene);
        this.velocity = new Vector3(0, 0, 0); // Default velocity: stationary

        // Synchronize light position with emitter
        this.particleSystem.onBeforeDrawParticlesObservable.add(() => {
            this.particleLight.position.copyFrom(emitter.position);
        });
    }

    update(deltaTime) {
        if (this.particleSystem && typeof this.particleSystem.update === 'function') {
            this.particleSystem.update(deltaTime);
        }
    }

    /** Stops and cleans up the particle system */
    dispose() {
        if (this.isDisposed) return; // Prevent multiple disposals
        this.isDisposed = true;

        if (this.particleSystem) {
            this.particleSystem.stop();
            this.particleSystem.dispose();
        }
        if (this.particleLight) {
            this.particleLight.dispose();
        }

        // Remove the particle from the WebWorker
        Particle.worker.postMessage({
            type: "removeParticle",
            data: { id: this.id }
        });
    }

    /** Converts the particle to a JSON object */
    toJSON() {
        return {
            id: this.id,
            position: {
                x: this.particleSystem.position.x,
                y: this.particleSystem.position.y,
                z: this.particleSystem.position.z
            },
            velocity: {
                x: this.velocity.x,
                y: this.velocity.y,
                z: this.velocity.z
            },
            lifeTime: this.particleSystem.maxLifeTime * 1000 // Convert to milliseconds
        };
    }
}

// Ensure the WebWorker is initialized
if (typeof Particle.worker === 'undefined') {
    Particle.worker = new Worker(new URL('./worker.js', import.meta.url));
}

Particle.worker.onmessage = function (event) {
    if (event.data.type === "updateParticles") {
        event.data.particles.forEach(updatedParticles => {
            const particle = game.particles[updatedParticles.id];
            if (particle) {
                const mesh = particle.particleSys;
                mesh.position.set(updatedParticles.position.x, updatedParticles.position.y, updatedParticles.position.z);
                if (updatedParticles.visible !== undefined) {
                    mesh.isVisible = updatedParticles.visible;
                }
                
                // Dispose of particles exceeding coordinate limits
                const maxlifeTime = 2000;
                if (Math.abs(updatedParticles.position.x) > maxlifeTime || Math.abs(updatedParticles.position.y) > maxlifeTime || Math.abs(updatedParticles.position.z) > maxlifeTime) {
                    particle.dispose();
                    delete game.particles[updatedParticles.id];
                }
            }
        });
    }
};