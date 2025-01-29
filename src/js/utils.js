import { MeshBuilder, DynamicTexture, StandardMaterial} from '@babylonjs/core';

export function makeTextPlane(scene, text, color, size, width, height, fontSize) {
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

export function toggleInfoVisibility(ship, scene) {
    scene.infoVisible = !scene.infoVisible;
    document.getElementById('infoPanel').style.display = scene.infoVisible ? 'block' : 'none';
    document.getElementById('fpsPanel').style.display = scene.infoVisible ? 'block' : 'none';
    document.getElementById('axisIndicator').style.display = scene.infoVisible ? 'block' : 'none';
    ship.axes = setAxesVisibilityFromObject(ship.axes, scene.infoVisible);
    ship.velocityVector = setAxesVisibilityFromObject(ship.velocityVector, scene.infoVisible);
    ship.velocityVectorArrow = setAxesVisibilityFromObject(ship.velocityVectorArrow, scene.infoVisible);
    scene.axes = setAxesVisibilityFromObject(scene.axes, scene.infoVisible);
}

export function setAxesVisibilityFromObject(axes, visible) {
    if (axes) {
        if (Array.isArray(Object.values(axes))) {
            Object.values(axes).forEach(axis => {
                if (axis && typeof axis.isVisible !== 'undefined') {
                    axis.isVisible = visible;
                }
            });
        } else {
            axes.isVisible = visible;
        }
    } 
    return axes;
}

