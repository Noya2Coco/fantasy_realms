import { Vector3, Quaternion } from '@babylonjs/core';

export class Ship {
    constructor(id, position = { x: 0, y: 0, z: 0 }, token = null) {
        this.id = id;
        this.position = new Vector3(position.x, position.y, position.z);
        this.rotationQuaternion = new Quaternion(0, 0, 0, 1);
        this.velocity = new Vector3(0, 0, 0);
        this.acceleration = new Vector3(0, 0, 0);
        this.lastTeleportTime = null;
        this.health = 30;
        this.hitbox = { width: 3.5, height: 1.75, depth: 7 };
        this.kills = 0;
        this.token = token; // Store user token or email
    }

    update(data) {
        if (data.position) {
            this.position.copyFromFloats(data.position.x, data.position.y, data.position.z);
        }
        if (data.velocity) {
            this.velocity.copyFromFloats(data.velocity.x, data.velocity.y, data.velocity.z);
        }
        if (data.rotationQuaternion) {
            this.rotationQuaternion.copyFromFloats(data.rotationQuaternion.x, data.rotationQuaternion.y, data.rotationQuaternion.z, data.rotationQuaternion.w);
        }
    }

    /** Génère un objet simplifié pour le serveur */
    toJSON() {
        return {
            id: this.id,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            rotationQuaternion: { x: this.rotationQuaternion.x, y: this.rotationQuaternion.y, z: this.rotationQuaternion.z, w: this.rotationQuaternion.w },
            velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z },
            isPlayer: false,
            kills: this.kills
        };
    }
}
