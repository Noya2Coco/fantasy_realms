import { Vector3, MeshBuilder, StandardMaterial, Color3, PointLight, Sound } from '@babylonjs/core';

export class Bullet {
    constructor(scene, ship, data) {
        this.scene = scene;
        this.ship = ship;
        const path = [
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 2)
        ];
        this.mesh = MeshBuilder.CreateTube('bullet', { path: path, radius: 0.05 }, this.scene); // Create a thin tube
        if (data) {
            this.id = data.id;
            const bulletWorldPosition = Vector3.TransformCoordinates(data.position, this.ship.mesh.getWorldMatrix());
            this.mesh.position.copyFrom(bulletWorldPosition);
            this.mesh.rotationQuaternion = data.rotationQuaternion;
            this.mesh.direction = Vector3.TransformNormal(new Vector3(0, 0, 1), this.ship.mesh.getWorldMatrix()).normalize();
            this.mesh.velocity = data.velocity;
        } else {
            this.id = `bullet-${Math.random().toString(36).substr(2, 9)}`; // Ensure bullet has an id
            const bulletWorldPosition = Vector3.TransformCoordinates(path[0], this.ship.mesh.getWorldMatrix());
            this.mesh.position.copyFrom(bulletWorldPosition);
            this.mesh.rotationQuaternion = this.ship.mesh.rotationQuaternion.clone(); // Match the ship's orientation
            this.mesh.direction = Vector3.TransformNormal(new Vector3(0, 0, 1), this.ship.mesh.getWorldMatrix()).normalize();
            this.mesh.velocity = this.mesh.direction.scale(3).addInPlace(this.ship.mesh.velocity); // Increased bullet speed
        }

        // Change bullet color to neon red and make it emissive
        const bulletMaterial = new StandardMaterial('bulletMaterial', this.scene);
        bulletMaterial.emissiveColor = new Color3(1, 0, 0); // Neon red color
        bulletMaterial.disableLighting = true; // Disable lighting effects on the bullet
        this.mesh.material = bulletMaterial;

        // Add light to the bullet
        const bulletLight = new PointLight('bulletLight', this.mesh.position, this.scene);
        bulletLight.diffuse = new Color3(1, 0, 0); // Neon red color
        bulletLight.intensity = 2; // Adjust the intensity as needed
        bulletLight.range = 5; // Adjust the range as needed
        this.mesh.light = bulletLight;

        // Add sound to the bullet
        const bulletSound = new Sound('bulletSound', '../sounds/laser1.mp3', this.scene, null, {
            loop: false,
            autoplay: true,
            spatialSound: true,
            maxDistance: 200,
            refDistance: 1
        });
        bulletSound.attachToMesh(this.mesh);
        this.mesh.sound = bulletSound;

        this.mesh.renderingGroupId = 1;
    }

    update(deltaTime) {
        const distance = this.mesh.velocity.scale(deltaTime / 16);
        this.mesh.position.addInPlace(distance);
        this.mesh.light.position = this.mesh.position; // Update light position
        if (Vector3.Distance(this.mesh.position, this.ship.mesh.position) > 300) {
            this.mesh.isVisible = true;
        } else {
            this.mesh.isVisible = true;
        }
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
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
