import { MeshBuilder, Vector3, StandardMaterial, Color3 } from '@babylonjs/core';

export function createPlanet(scene, size, position) {
    const planet = MeshBuilder.CreateSphere('planet', { diameter: size }, scene);
    planet.position = position;

    const material = new StandardMaterial('planetMaterial', scene);
    material.diffuseColor = new Color3(Math.random(), Math.random(), Math.random());
    planet.material = material;

    planet.size = size; // Store size for collision detection
    planet.gravitationalRange = size * 2; // Define gravitational range

    // Add gravitational force method
    planet.applyGravitationalForce = function (ship, gravitationalConstant) {
        const direction = planet.position.subtract(ship.position);
        const distance = direction.length();
        if (distance > planet.gravitationalRange) {
            return new Vector3(0, 0, 0); // No force if outside gravitational range
        }
        const forceMagnitude = (gravitationalConstant * planet.size) / (distance * distance);
        const force = direction.normalize().scale(forceMagnitude);
        return force;
    };

    // Create aura to visualize gravitational range
    const aura = MeshBuilder.CreateSphere('aura', { diameter: planet.gravitationalRange * 2 }, scene);
    const auraMaterial = new StandardMaterial('auraMaterial', scene);
    auraMaterial.diffuseColor = new Color3(0.5, 0.5, 1);
    auraMaterial.alpha = 0.2; // Make aura semi-transparent
    aura.material = auraMaterial;
    aura.position = position;

    return planet;
}

