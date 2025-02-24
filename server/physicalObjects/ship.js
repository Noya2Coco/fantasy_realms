import { Vector3, Quaternion } from '@babylonjs/core';

export class Ship {
    constructor(id) {
        this.id = id;
        this.position = new Vector3(0, 0, 0);
        this.rotation = new Quaternion(0, 0, 0, 1);
        this.velocity = new Vector3(0, 0, 0);
    }

    /** 🔄 Met à jour la position et la rotation du vaisseau */
    update(data) {
        if (data.position) {
            this.position = new Vector3(data.position.x, data.position.y, data.position.z);
        }
        if (data.rotation) {
            this.rotation = new Quaternion(data.rotation.x, data.rotation.y, data.rotation.z, data.rotation.w);
        }
        if (data.velocity) {
            this.velocity = new Vector3(data.velocity.x, data.velocity.y, data.velocity.z);
        }
    }

    /** 🔧 Génère un objet simplifié pour l'envoi aux clients */
    toJSON() {
        return {
            id: this.id,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            rotation: { x: this.rotation.x, y: this.rotation.y, z: this.rotation.z, w: this.rotation.w },
            velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z }
        };
    }
}
