import { Vector3, Quaternion } from '@babylonjs/core';

export class Bullet {
    constructor(data) {
        console.log(data);
        this.id = data.id;
        this.shipId = data.shipId;
        
        console.log("Data:", data);
        if (data && data.position && data.position._x !== undefined) {
            this.position = new Vector3(data.position._x, data.position._y, data.position._z);
        } else {
            this.position = data ? new Vector3(data.position.x, data.position.y, data.position.z) : 
                Vector3.TransformCoordinates(new Vector3(0, 0, 0), ship.getWorldMatrix());
        }

        if (data && data.rotationQuaternion && data.rotationQuaternion._x !== undefined) {
            this.rotationQuaternion = new Vector3(data.rotationQuaternion._x, data.rotationQuaternion._y, data.rotationQuaternion._z, data.rotationQuaternion._w);
        } else {
            this.rotationQuaternion = data ? new Vector3(data.rotationQuaternion.x, data.rotationQuaternion.y, data.rotationQuaternion.z, data.rotationQuaternion.w) :
                Quaternion.Identity();
        }

        if (data && data.velocity && data.velocity._x !== undefined) {
            this.velocity = new Vector3(data.velocity._x, data.velocity._y, data.velocity._z);
        } else {
            this.velocity = data ? new Vector3(data.velocity.x, data.velocity.y, data.velocity.z) :
                Vector3.TransformNormal(new Vector3(0, 0, 1), ship.getWorldMatrix()).normalize().scale(100);
        }

        this.spawnTime = Date.now();
        this.lifeTime = 15000; // 15 secondes avant suppression
        this.visible = true;
        console.log(this.rotationQuaternion);
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
            rotationQuaternion: { x: this.rotationQuaternion.x, y: this.rotationQuaternion.y, z: this.rotationQuaternion.z, w: this.rotationQuaternion.w },
            velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z },
            visible: this.visible
        };
    }
}
