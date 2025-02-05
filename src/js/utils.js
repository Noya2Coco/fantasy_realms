import { MeshBuilder, DynamicTexture, StandardMaterial} from 'babylonjs';

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
    ship.mesh.axes = setAxesVisibilityFromObject(ship.mesh.axes, scene.infoVisible);
    ship.mesh.velocityVector = setAxesVisibilityFromObject(ship.mesh.velocityVector, scene.infoVisible);
    ship.mesh.velocityVectorArrow = setAxesVisibilityFromObject(ship.mesh.velocityVectorArrow, scene.infoVisible);
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

