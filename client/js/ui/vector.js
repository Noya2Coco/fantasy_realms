import { MeshBuilder, Color3 } from "babylonjs";

/** 🏹 Crée un vecteur de vitesse sous forme de ligne */
export function createVelocityVector(scene, startPoint, endPoint) {
    let velocityVector = MeshBuilder.CreateLines(
        "velocityVector",
        { points: [startPoint, endPoint] },
        scene
    );
    velocityVector.color = new Color3(1, 0, 1); // Couleur rose
    return velocityVector;
}

/** 🏹 Crée une flèche indiquant la direction du vecteur de vitesse */
export function createVelocityVectorArrow(scene, startPoint, endPoint, arrowLeft, arrowRight) {
    let velocityVectorArrow = MeshBuilder.CreateLines(
        "velocityVectorArrow",
        { points: [startPoint, endPoint, arrowLeft, endPoint, arrowRight] },
        scene
    );
    velocityVectorArrow.color = new Color3(1, 0, 1);
    return velocityVectorArrow;
}
