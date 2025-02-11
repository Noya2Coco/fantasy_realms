import { Vector3, MeshBuilder, StandardMaterial, Color3, PointLight, Sound } from 'babylonjs';

export class Projectile {
    constructor(scene, ship) {
        this.scene = scene;
        this.ship = ship;
        this.mesh = this.createProjectileMesh();
        this.velocity = this.mesh.direction.scale(3).addInPlace(ship.mesh.velocity);
        this.light = this.createLight();
        this.sound = this.createSound();
    }

    createProjectileMesh() {
        const path = [
            new Vector3(0, -1, 0),
            new Vector3(0, -1, 2)
        ];
        const projectile = MeshBuilder.CreateTube('projectile', { path: path, radius: 0.2 }, this.scene);
        const projectileWorldPosition = Vector3.TransformCoordinates(path[0], this.ship.mesh.getWorldMatrix());
        projectile.position.copyFrom(projectileWorldPosition);
        projectile.rotationQuaternion = this.ship.mesh.rotationQuaternion.clone();
        projectile.direction = Vector3.TransformNormal(new Vector3(0, 0, 1), this.ship.mesh.getWorldMatrix()).normalize();

        // Appliquer le matériau du projectile
        const material = new StandardMaterial('projectileMaterial', this.scene);
        material.emissiveColor = new Color3(1, 0, 0);
        material.disableLighting = true;
        projectile.material = material;
        
        projectile.renderingGroupId = 1;

        return projectile;
    }

    createLight() {
        const light = new PointLight('projectileLight', this.mesh.position, this.scene);
        light.diffuse = new Color3(1, 0, 0);
        light.intensity = 2;
        light.range = 5;
        return light;
    }

    createSound() {
        const sound = new Sound('projectileSound', 'sounds/laser2.mp3', this.scene, null, {
            loop: false,
            autoplay: true,
            spatialSound: true,
            maxDistance: 200,
            refDistance: 1
        });
        sound.attachToMesh(this.mesh);
        return sound;
    }

    update() {
        this.mesh.position.addInPlace(this.velocity);
        this.light.position = this.mesh.position;
    }

    shouldDispose(shipPosition) {
        return Vector3.Distance(this.mesh.position, shipPosition) > 500;
    }

    dispose() {
        this.mesh.dispose();
        this.light.dispose();
    }
}
