import { FreeCamera, Vector3 } from '@babylonjs/core';

export class Camera extends FreeCamera {
    constructor(name, position, scene, parent, minFov, maxFov, rotationX = 0, rotationY = 0, rotationZ = 0) {
        super(name, new Vector3(...position), scene);
        this.parent = parent;
        this.minFov = minFov;
        this.maxFov = maxFov;
        this.fov = minFov;
        this.rotation.set(rotationX, rotationY, rotationZ);
    }

    /** 🔄 Ajuste le champ de vision */
    updateFov(accelerationMagnitude) {
        const fovAdjustment = accelerationMagnitude * 0.2;
        this.fov = Math.max(this.minFov, Math.min(this.maxFov, this.fov + fovAdjustment));
    }
}
