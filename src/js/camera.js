import { FreeCamera, Vector3 } from "babylonjs";

export class Camera extends FreeCamera {
    constructor(name, position, scene, parent, minFov, maxFov, rotationX = 0, rotationY = 0, rotationZ = 0) {
        super(name, new Vector3(...position), scene);
        this.parent = parent;
        this.minFov = minFov;
        this.maxFov = maxFov;
        this.fov = minFov;
        this.rotation.x = rotationX;
        this.rotation.y = rotationY;
        this.rotation.z = rotationZ;
    }
}