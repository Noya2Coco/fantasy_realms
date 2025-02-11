import { MeshBuilder, Vector3, StandardMaterial, Color3, PointLight } from 'babylonjs';

export function createPlanet(scene, size, position, isStar = false, auraEnable = false) {
    if (isStar) {
        size *= 3;
    }

    const planet = MeshBuilder.CreateSphere('planet', { diameter: size }, scene);
    planet.position = position;

    const material = new StandardMaterial('planetMaterial', scene);
    material.diffuseColor = isStar ? new Color3(1, 1, 0) : new Color3(0, 1, 0); // Yellow for stars, green for others
    material.specularColor = new Color3(0.1, 0.1, 0.1); // Reduce specular highlights
    material.specularPower = 32; // Increase specular power for a more focused highlight
    if (isStar) {
        material.emissiveColor = new Color3(1, 1, 0); // Make the star emit light
    }
    planet.material = material;

    planet.size = size; // Store size for collision detection
    planet.gravitationalRange = size * 2; // Define gravitational range

    // Calculate gravitational constant based on planet size
    const baseGravitationalConstant = size * 0.005; // Adjust the factor as needed
    planet.gravitationalConstant = isStar ? baseGravitationalConstant : baseGravitationalConstant * 0.75; // Reduce gravity for non-stars
    planet.renderingGroupId = 1;

    // Add gravitational force method
    planet.applyGravitationalForce = function (mesh) {
        const direction = planet.position.subtract(mesh.position);
        const distance = direction.length();
        if (distance > planet.gravitationalRange) {
            return new Vector3(0, 0, 0); // No force if outside gravitational range
        }
        const forceMagnitude = (planet.gravitationalConstant * planet.size) / (distance * distance);
        const force = direction.normalize().scale(forceMagnitude);
        return force;
    };

    if (auraEnable) {
        // Create aura to visualize gravitational range
        const aura = MeshBuilder.CreateSphere('aura', { diameter: planet.gravitationalRange * 2 }, scene);
        const auraMaterial = new StandardMaterial('auraMaterial', scene);
        auraMaterial.diffuseColor = new Color3(0.5, 0.5, 1);
        auraMaterial.alpha = 0.2; // Make aura semi-transparent
        aura.material = auraMaterial;
        aura.position = position;
    }

    if (isStar) {
        // Add light to the planet if it is a star
        const light = new PointLight('planetLight', position, scene);
        light.intensity = 10; // Adjust the intensity as needed
        light.range = size * 20; // Adjust the range as needed
        light.diffuse = material.diffuseColor;
        light.specular = new Color3(0.1, 0.1, 0.1); // Reduce specular highlights

        // Set attenuation properties
        light.attachedMesh = planet;
        light.falloffType = PointLight.FALLOFF_PHYSICAL;
        light.radius = size * 10; // Adjust the radius as needed
        light.range = size * 15; // Adjust the range as needed
        light.intensity = 1; // Adjust the intensity as needed

        // Increase attenuation for smoother gradient
        light.attenuation0 = 0.01; // Constant attenuation
        light.attenuation1 = 0.02; // Linear attenuation
        light.attenuation2 = 0.03; // Quadratic attenuation

        planet.light = light; // Attach the light to the planet
    }

    return planet;
}

