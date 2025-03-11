import { Vector3 } from '@babylonjs/core';

export class Bullet {
    constructor(ship, data) {
        this.id = data.id;
        this.position = new Vector3(data.position.x, data.position.y, data.position.z);
        this.velocity = new Vector3(data.velocity.x, data.velocity.y, data.velocity.z);
        this.spawnTime = Date.now();
        this.lifeTime = 15000; // 5 secondes avant suppression
        this.visible = true;
    }

    update(deltaTime) {
        this.position.addInPlace(this.velocity.scale(deltaTime / 1000));
        if (Date.now() - this.spawnTime > this.lifeTime) {
            this.lifeTime = 0;
            this.visible = false;
        }
    }

    toJSON() {
        return {
            id: this.id,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z },
            visible: this.visible
        };
    }
}
