import { Vector3, MeshBuilder, StandardMaterial, Color3 } from '@babylonjs/core';
import { game } from '../client.js';

export class Bullet {
    constructor(scene, ship, data) {
        this.scene = scene;
        this.ship = ship;
        this.id = data ? data.id : `bullet-${Math.random().toString(36).substr(2, 9)}`;

        // Création du mesh (visuel uniquement)
        this.mesh = MeshBuilder.CreateTube('bullet', { path: [new Vector3(0, 0, 0), new Vector3(0, 0, 2)], radius: 0.05 }, this.scene);
        this.mesh.material = new StandardMaterial('bulletMaterial', this.scene);
        this.mesh.material.emissiveColor = new Color3(1, 0, 0);
        this.mesh.material.disableLighting = true;

        // Position et vitesse initiale
        this.mesh.position = data ? data.position : Vector3.TransformCoordinates(new Vector3(0, 0, 0), ship.mesh.getWorldMatrix());
        this.mesh.rotationQuaternion = data ? data.rotationQuaternion : ship.mesh.rotationQuaternion.clone();
        this.mesh.direction = data ? data.direction : Vector3.TransformNormal(new Vector3(0, 0, 1), ship.mesh.getWorldMatrix()).normalize();
        this.mesh.velocity = data ? data.velocity : this.mesh.direction.scale(100).addInPlace(this.ship.mesh.velocity);

        // Ajout de la balle au WebWorker
        Bullet.worker.postMessage({
            type: "addBullet",
            data: this.toJSON()
        });

        this.mesh.renderingGroupId = 1;
        this.spawnTime = Date.now();
        this.lifeTime = 5000; // Suppression après 5 secondes
        this.visible = true;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.setEnabled(false);
            this.visible = false;
            console.log(`🛑 Suppression du projectile: ${this.id}`);
            Bullet.worker.postMessage({
                type: "removeBullet",
                data: { id: this.id }
            });
        }
    }

    /** 📡 Convertit le projectile en objet JSON */
    toJSON() {
        return {
            id: this.id,
            position: { x: this.mesh.position.x, y: this.mesh.position.y, z: this.mesh.position.z },
            rotation: { x: this.mesh.rotationQuaternion.x, y: this.mesh.rotationQuaternion.y, z: this.mesh.rotationQuaternion.z, w: this.mesh.rotationQuaternion.w },
            direction: { x: this.mesh.direction.x, y: this.mesh.direction.y, z: this.mesh.direction.z },
            velocity: { x: this.mesh.velocity.x, y: this.mesh.velocity.y, z: this.mesh.velocity.z },
            visible: this.visible
        };
    }

    /** 📡 Met à jour les données du vaisseau dans le WebWorker */
    static updateShipData(ship) {
        Bullet.worker.postMessage({
            type: "updateShip",
            data: {
                id: ship.id,
                position: { x: ship.mesh.position.x, y: ship.mesh.position.y, z: ship.mesh.position.z }
            }
        });
    }
}

// Vérifie si le WebWorker est déjà créé
if (typeof Bullet.worker === 'undefined') {
    Bullet.worker = new Worker(new URL('../worker/bulletWorker.js', import.meta.url));
}

Bullet.worker.onmessage = function(event) {
    if (event.data.type === "updateBullets") {
        event.data.bullets.forEach(updatedBullet => {
            const bullet = game.projectiles[updatedBullet.id];
            if (bullet) {
                // Utilisation de l'interpolation pour lisser les mouvements
                bullet.mesh.position.x += (updatedBullet.position.x - bullet.mesh.position.x) * 0.2;
                bullet.mesh.position.y += (updatedBullet.position.y - bullet.mesh.position.y) * 0.2;
                bullet.mesh.position.z += (updatedBullet.position.z - bullet.mesh.position.z) * 0.2;
                bullet.mesh.setEnabled(updatedBullet.visible);
            }
        });
    }

    if (event.data.type === "removeBullet") {
        console.log(`🛑 Suppression du projectile: ${event.data.id}`);
        const bullet = game.projectiles[event.data.id];
        if (bullet) {
            bullet.dispose();
            delete game.projectiles[event.data.id];
        }
    }
};