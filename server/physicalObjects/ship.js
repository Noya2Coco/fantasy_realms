import { Vector3, Quaternion } from '@babylonjs/core';

export class Ship {
    constructor(id) {
        this.id = id;
        this.position = new Vector3(0, 0, 0);
        this.rotationQuaternion = new Quaternion(0, 0, 0, 1);
        this.velocity = new Vector3(0, 0, 0);
        this.acceleration = new Vector3(0, 0, 0);
    }

    update(data) {
        if (data.position) {
            this.position = new Vector3(data.position.x, data.position.y, data.position.z);
        }
        if (data.velocity) {
            this.velocity = new Vector3(data.velocity.x, data.velocity.y, data.velocity.z);
        }
        if (data.rotationQuaternion) {
            this.rotationQuaternion = new Quaternion(data.rotationQuaternion.x, data.rotationQuaternion.y, data.rotationQuaternion.z, data.rotationQuaternion.w);
        }
        //console.log(`🚀 Mise à jour du vaisseau ${this.id}`);
    }

    /** 📡 Génère un objet simplifié pour le serveur */
    toJSON() {
        return {
            id: this.id,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            rotationQuaternion: { x: this.rotationQuaternion.x, y: this.rotationQuaternion.y, z: this.rotationQuaternion.z, w: this.rotationQuaternion.w },
            velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z },
            isPlayer: false // Ensure isPlayer is false for all ships sent to the client
        };
    }
}
