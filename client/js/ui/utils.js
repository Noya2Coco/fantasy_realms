import { MeshBuilder, StandardMaterial, DynamicTexture } from '@babylonjs/core';
import { setAxesVisibility } from './axis.js';

/** Toggles the visibility of various UI elements (FPS, axes, panels) */
export function toggleInfoVisibility(ship, scene) {
    scene.infoVisible = !scene.infoVisible;
    document.getElementById('infoPanel').style.display = scene.infoVisible ? 'block' : 'none';
    document.getElementById('fpsPanel').style.display = scene.infoVisible ? 'block' : 'none';
    document.getElementById('axesIndicator').style.display = scene.infoVisible ? 'block' : 'none';

    if (ship.mesh) {
        ship.mesh.axes = setAxesVisibility(ship.mesh.axes, scene.infoVisible);
        ship.mesh.velocityVector = setAxesVisibility(ship.mesh.velocityVector, scene.infoVisible);
        ship.mesh.velocityVectorArrow = setAxesVisibility(ship.mesh.velocityVectorArrow, scene.infoVisible);

        // Add a default method to avoid errors
        if (ship.mesh.material && typeof ship.mesh.material.needAlphaTestingForMesh !== 'function') {
            ship.mesh.material.needAlphaTestingForMesh = () => false;
        }
    }
    scene.axes = setAxesVisibility(scene.axes, scene.infoVisible);
}

/** Creates a 3D text plane for the scene */
export function makeTextPlane(scene, text, color, width, height, fontSize) {
    const dynamicTexture = new DynamicTexture("DynamicTexture", { width, height }, scene);
    dynamicTexture.drawText(text, null, null, `bold ${fontSize}px Arial`, color, "transparent", true);

    const textSize = dynamicTexture.getSize();
    const plane = MeshBuilder.CreatePlane("TextPlane", { width: textSize.width / 512, height: textSize.height / 512 }, scene);
    const material = new StandardMaterial("TextPlaneMaterial", scene);
    material.diffuseTexture = dynamicTexture;
    material.backFaceCulling = false;
    plane.material = material;
    return plane;
}
