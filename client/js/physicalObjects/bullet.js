import { Vector3, MeshBuilder, StandardMaterial, Color3, Quaternion } from '@babylonjs/core';
import { game } from '../client.js';

export class Bullet {
    constructor(scene, ship, data) {
        this.scene = scene;
        this.ship = ship;
        this.id = data ? data.id : `bullet-${Math.random().toString(36).substr(2, 9)}`;

        // Création du mesh (uniquement visuel)
        this.mesh = MeshBuilder.CreateTube('bullet', { path: [new Vector3(0, 0, 0), new Vector3(0, 0, 4)], radius: 0.1 }, this.scene); // Increase hitbox dimensions
        this.mesh.material = new StandardMaterial('bulletMaterial', this.scene);
        this.mesh.material.emissiveColor = new Color3(1, 0, 0);
        this.mesh.material.disableLighting = true;

        this.mesh.renderingGroupId = 1;
        
        // Position et vitesse initiale
        if (data && data.position && data.position._x !== undefined) {
            this.mesh.position = new Vector3(data.position._x, data.position._y, data.position._z);
        } else {
            this.mesh.position = data ? new Vector3(data.position.x, data.position.y, data.position.z) : 
                Vector3.TransformCoordinates(new Vector3(0, 0, 0), ship.mesh.getWorldMatrix());
        }

        this.mesh.rotationQuaternion = data && data.rotationQuaternion ? 
            new Quaternion(data.rotationQuaternion.x, data.rotationQuaternion.y,
                           data.rotationQuaternion.z, data.rotationQuaternion.w)
            : ship.mesh.rotationQuaternion.clone();

        if (data && data.velocity && data.velocity._x !== undefined) {
            this.mesh.velocity = new Vector3(data.velocity._x, data.velocity._y, data.velocity._z);
        } else {
            this.mesh.velocity = data ? new Vector3(data.velocity.x, data.velocity.y, data.velocity.z) :
                Vector3.TransformNormal(new Vector3(0, 0, 1), ship.mesh.getWorldMatrix()).normalize().scale(100);
        }

        // Envoi au Worker pour gestion complète
        Bullet.worker.postMessage({
            type: "addBullet",
            data: this.toJSON()
        });
    }

    static updateShipData(ship) {
        Bullet.worker.postMessage({
            type: "updateShip",
            data: {
                id: ship.id,
                position: { x: ship.mesh.position.x, y: ship.mesh.position.y, z: ship.mesh.position.z }
            }
        });
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
            Bullet.worker.postMessage({ type: "removeBullet", data: { id: this.id } });
        }
    }

    toJSON() {
        return {
            id: this.id,
            position: { x: this.mesh.position.x, y: this.mesh.position.y, z: this.mesh.position.z },
            rotationQuaternion: this.mesh.rotationQuaternion ? {
                x: this.mesh.rotationQuaternion.x, y: this.mesh.rotationQuaternion.y,
                z: this.mesh.rotationQuaternion.z, w: this.mesh.rotationQuaternion.w
            } : { x: 0, y: 0, z: 0, w: 1 },
            velocity: { x: this.mesh.velocity.x, y: this.mesh.velocity.y, z: this.mesh.velocity.z },
            visible: this.mesh.isVisible // Add visibility to JSON
        };
    }
}

// Vérification et écoute du Worker
if (typeof Bullet.worker === 'undefined') {
    Bullet.worker = new Worker(new URL('../worker/bulletWorker.js', import.meta.url));
}

Bullet.worker.onmessage = function (event) {
    if (event.data.type === "updateBullets") {
        event.data.bullets.forEach(updatedBullet => {
            const projectile = game.projectiles[updatedBullet.id];
            if (projectile) {
                const mesh = projectile.mesh;
                mesh.position.set(updatedBullet.position.x, updatedBullet.position.y, updatedBullet.position.z);
                mesh.isVisible = updatedBullet.visible; // Update visibility

                // Suppression des projectiles qui dépassent la limite de coordonnées
                const maxCoord = 2000;
                if (Math.abs(updatedBullet.position.x) > maxCoord || Math.abs(updatedBullet.position.y) > maxCoord || Math.abs(updatedBullet.position.z) > maxCoord) {
                    projectile.dispose();
                    delete game.projectiles[updatedBullet.id];
                }
            }
        });
    }
};
