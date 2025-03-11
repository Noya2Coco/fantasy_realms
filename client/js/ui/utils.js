import { MeshBuilder, StandardMaterial, DynamicTexture } from '@babylonjs/core';
import { setAxesVisibility } from './axis.js';

/** 🔄 Bascule l'affichage des informations (FPS, Axes, Panneaux) */
export function toggleInfoVisibility(ship, scene) {
    scene.infoVisible = !scene.infoVisible;
    document.getElementById('infoPanel').style.display = scene.infoVisible ? 'block' : 'none';
    document.getElementById('fpsPanel').style.display = scene.infoVisible ? 'block' : 'none';
    document.getElementById('axesIndicator').style.display = scene.infoVisible ? 'block' : 'none';

    if (ship.mesh) {
        ship.mesh.axes = setAxesVisibility(ship.mesh.axes, scene.infoVisible);
        ship.mesh.velocityVector = setAxesVisibility(ship.mesh.velocityVector, scene.infoVisible);
        ship.mesh.velocityVectorArrow = setAxesVisibility(ship.mesh.velocityVectorArrow, scene.infoVisible);
    }
    scene.axes = setAxesVisibility(scene.axes, scene.infoVisible);
}

/** 📝 Crée un texte en 3D pour la scène */
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
