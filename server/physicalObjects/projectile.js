import { Vector3 } from '@babylonjs/core';

export class Projectile {
    constructor(id, ship) {
        this.id = id;
        this.position = new Vector3(ship.position.x, ship.position.y, ship.position.z);
        this.velocity = new Vector3(0, 0, 3).applyRotationQuaternion(ship.rotation);
    }

    /** 🔄 Met à jour la position du projectile */
    update() {
        this.position.addInPlace(this.velocity);
    }

    /** 📡 Convertit le projectile en objet JSON */
    toJSON() {
        return {
            id: this.id,
            position: { x: this.position.x, y: this.position.y, z: this.position.z }
        };
    }
}
