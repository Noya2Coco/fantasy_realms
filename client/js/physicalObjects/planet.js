import { MeshBuilder, StandardMaterial, Color3, Vector3, PointLight } from '@babylonjs/core';

export class Planet {
    constructor(scene, data) {
        this.scene = scene;
        this.isStar = data.isStar;
        let sizeCoeff = this.isStar ? 2 : 1;
        this.mesh = MeshBuilder.CreateSphere('planet', { diameter: data.size * sizeCoeff }, this.scene);
        this.mesh.size = data.size;
        this.mesh.position.set(data.position.x, data.position.y, data.position.z);
        this.mesh.renderingGroupId = 1;

        this.gravitationalRange = this.mesh.size * 2;
        let baseGravitationalConstant = this.mesh.size * 0.005;
        this.gravitationalConstant = this.isStar ? baseGravitationalConstant : baseGravitationalConstant * 0.75; // Reduce gravity for non-stars

        const material = new StandardMaterial('planetMaterial', this.scene);
        material.diffuseColor = this.isStar ? new Color3(1, 1, 0) : new Color3(0, 1, 0);
        material.specularColor = new Color3(0.1, 0.1, 0.1);
        if (this.isStar) material.emissiveColor = new Color3(1, 1, 0);

        // Ajoutez une méthode par défaut pour éviter les erreurs
        material.needAlphaTestingForMesh = () => false;

        this.mesh.material = material;

        if (this.isStar) {
            // Add light to the planet if it is a star
            const light = new PointLight('planetLight', this.mesh.position, this.scene);
            light.intensity = 10; // Adjust the intensity as needed
            light.range = this.mesh.size * 20; // Adjust the range as needed
            light.diffuse = material.diffuseColor;
            light.specular = new Color3(0.1, 0.1, 0.1); // Reduce specular highlights
    
            // Set attenuation properties
            light.attachedMesh = this.mesh;
            light.falloffType = PointLight.FALLOFF_PHYSICAL;
            light.radius = this.mesh.size * 10; // Adjust the radius as needed
            light.range = this.mesh.size * 20; // Adjust the range as needed
            light.intensity = 10; // Adjust the intensity as needed
    
            // Increase attenuation
            light.attenuation0 = 0.05; // Constant attenuation
            light.attenuation1 = 0.05; // Linear attenuation
            light.attenuation2 = 0.05; // Quadratic attenuation
    
            this.mesh.light = light; // Attach the light to the planet
        }
    }

    /** 🔄 Affiche ou masque le halo rouge */
    toggleGravityWarning(show) {
        const gravityWarning = document.getElementById('gravityWarning');
        if (gravityWarning) {
            gravityWarning.style.display = show ? 'block' : 'none';
        }
    }

    applyGravitationalForce(ship) {
        const direction = this.mesh.position.subtract(ship.mesh.position);
        const distanceSquared = direction.lengthSquared();
        const isWithinRange = distanceSquared <= this.gravitationalRange * this.gravitationalRange;

        // Afficher le halo rouge si le vaisseau est proche
        this.toggleGravityWarning(isWithinRange);

        if (!isWithinRange) {
            return; // No force if outside gravitational range
        }

        const forceMagnitude = (this.gravitationalConstant * this.mesh.size) / distanceSquared;
        if (forceMagnitude < 0.001) {
            return; // No force if the magnitude is too small
        }

        const force = direction.normalize().scale(forceMagnitude);
        ship.mesh.velocity.addInPlace(force); // Apply gravitational force to velocity
    }

    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
        if (this.mesh.light) {
            this.mesh.light.dispose();
        }
    }
}
