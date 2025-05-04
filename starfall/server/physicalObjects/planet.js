import { Vector3 } from '@babylonjs/core';

export class Planet {
    constructor(id, size, position, isStar = false) {
        this.id = id;
        this.size = size;
        this.position = new Vector3(position.x, position.y, position.z);
        this.isStar = isStar;
        this.gravitationalRange = isStar 
            ? size * 4 // Increased range for stars
            : size * 2;
        this.gravitationalConstant = size * 0.005 * (isStar ? 2 : 0.75); // Increased gravity for stars
    }

    /** 🔄 Applique une force gravitationnelle sur un objet */
    applyGravitationalForce(mesh) {
        const direction = this.position.subtract(mesh.position);
        const distance = direction.length();
        if (distance > this.gravitationalRange) {
            return Vector3.Zero();
        }
        const forceMagnitude = (this.gravitationalConstant * this.size) / (distance * distance);
        return direction.normalize().scale(forceMagnitude);
    }

    /** 📡 Convertit la planète en objet JSON */
    toJSON() {
        return {
            id: this.id,
            size: this.size,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            isStar: this.isStar
        };
    }
}
