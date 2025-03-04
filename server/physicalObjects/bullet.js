import { Vector3 } from '@babylonjs/core';

export class Bullet {
    constructor(ship, data) {
        this.ship = ship;
        this.shipId = data.shipId;
        this.id = data.id;
        this.position = new Vector3(data.position.x, data.position.y, data.position.z);
        this.rotationQuaternion = data.rotation;
        this.direction = data.direction;
        this.velocity = new Vector3(data.velocity.x, data.velocity.y, data.velocity.z);
        console.log("Création bullet server: ", data, this.ship);
    }

    update(deltaTime) {
        console.log("Bullet update server: ", this);
        const distance = this.velocity.scale(deltaTime / 16);
        this.position.addInPlace(distance);
        if (Vector3.Distance(this.position, this.ship.position) > 300) {
            this.isVisible = false;
        } else {
            this.isVisible = true;
        }
    }

    dispose() {
        this.dispose();
    }

    /** 📡 Convertit le projectile en objet JSON */
    toJSON() {
        return {
            id: this.id,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            rotation: { x: this.rotationQuaternion.x, y: this.rotationQuaternion.y, z: this.rotationQuaternion.z, w: this.rotationQuaternion.w },
            direction: { x: this.direction.x, y: this.direction.y, z: this.direction.z },
            velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z },
            shipId: this.ship.id
        };
    }
}
