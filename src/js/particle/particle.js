import { ParticleSys } from './particleSys.js';
import { ParticleLight } from './particleLight.js';

export class Particle {
    constructor(scene, emitter) {
        this.particleSystem = new ParticleSys(scene, emitter);
        this.particleLight = new ParticleLight(scene);

        this.particleSystem.onBeforeDrawParticlesObservable.add(() => {
            this.particleLight.position = emitter.position;
        });
    }
}