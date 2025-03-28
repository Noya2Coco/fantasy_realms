import { MeshBuilder, Color3, StandardMaterial } from "@babylonjs/core";

export function createVelocityVector(scene, startPoint, endPoint) {
    // Vérifiez si un objet existe déjà et mettez à jour ses points
    const existingVector = scene.getMeshByName("velocityVector");
    if (existingVector) {
        existingVector = MeshBuilder.CreateLines(
            "velocityVector",
            { points: [startPoint, endPoint] },
            scene
        );
    } else {
        const velocityVector = MeshBuilder.CreateLines(
            "velocityVector",
            { points: [startPoint, endPoint] },
            scene
        );
        velocityVector.color = new Color3(1, 0, 1);
        velocityVector.renderingGroupId = 2; // Assurez-vous que le renderingGroupId est défini
        velocityVector.isVisible = true; // Assurez-vous que l'objet est visible

        // ✅ Ajout d’un material minimal
        const material = new StandardMaterial("velocityMaterial", scene);
        material.emissiveColor = new Color3(1, 0, 1);
        material.disableLighting = true;
        velocityVector.material = material;

        return velocityVector;
    }
}

export function createVelocityVectorArrow(scene, startPoint, endPoint, arrowLeft, arrowRight) {
    const velocityVectorArrow = MeshBuilder.CreateLines(
        "velocityVectorArrow",
        { points: [startPoint, endPoint, arrowLeft, endPoint, arrowRight] },
        scene
    );
    velocityVectorArrow.color = new Color3(1, 0, 1);
    velocityVectorArrow.renderingGroupId = 2; // Assurez-vous que le renderingGroupId est défini
    velocityVectorArrow.isVisible = true; // Assurez-vous que l'objet est visible

    // ✅ Material obligatoire en Babylon.js 8 pour éviter les erreurs
    const material = new StandardMaterial("arrowMaterial", scene);
    material.emissiveColor = new Color3(1, 0, 1);
    material.disableLighting = true;
    velocityVectorArrow.material = material;

    return velocityVectorArrow;
}

