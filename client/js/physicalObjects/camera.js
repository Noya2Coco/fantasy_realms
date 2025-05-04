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

    /**
     * Updates the field of view (FOV) based on the given acceleration magnitude.
     * The FOV is adjusted within the defined minimum and maximum limits.
     * @param {number} accelerationMagnitude - The magnitude of acceleration to influence the FOV adjustment.
     */
    updateFov(accelerationMagnitude) {
        const fovAdjustment = accelerationMagnitude * 0.2;
        this.fov = Math.max(this.minFov, Math.min(this.maxFov, this.fov + fovAdjustment));
    }
}
