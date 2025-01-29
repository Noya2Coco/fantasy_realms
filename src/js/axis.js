import { MeshBuilder, Vector3, Color3, Matrix } from '@babylonjs/core';
import { makeTextPlane } from './utils.js';

export function createSceneAxis(scene, size) {
    // Axe X
    const axisX = MeshBuilder.CreateLines(
        "axisX",
        { points: [Vector3.Zero(), new Vector3(size, 0, 0)] },
        scene
    );
    axisX.color = Color3.Red();
    const xText = makeTextPlane(scene, "X", "red", size, 256, 256, 200);
    xText.position = new Vector3(size * 1.1, 0, 0);

    // Axe Y
    const axisY = MeshBuilder.CreateLines(
        "axisY",
        { points: [Vector3.Zero(), new Vector3(0, size, 0)] },
        scene
    );
    axisY.color = Color3.Green();
    const yText = makeTextPlane(scene, "Y", "green", size, 256, 256, 200);
    yText.position = new Vector3(0, size * 1.1, 0);

    // Axe Z
    const axisZ = MeshBuilder.CreateLines(
        "axisZ",
        { points: [Vector3.Zero(), new Vector3(0, 0, size)] },
        scene
    );
    axisZ.color = Color3.Blue();
    const zText = makeTextPlane(scene, "Z", "blue", size, 256, 256, 200);
    zText.position = new Vector3(0, 0, size * 1.1);

    // Attach axes to scene as attributes
    scene.axes = { axisX, axisY, axisZ, xText, yText, zText };
}

export function createShipAxis(ship, scene, size) {
    // Axe X
    const axisX = MeshBuilder.CreateLines(
        "axisX",
        { points: [Vector3.Zero(), new Vector3(size, 0, 0)] },
        scene
    );
    axisX.color = Color3.Red();
    axisX.parent = ship;
    const xText = makeTextPlane(scene, "X", "red", size, 128, 128, 60);
    xText.position = new Vector3(size * 1.1, 0, 0);
    xText.parent = ship;

    // Axe Y
    const axisY = MeshBuilder.CreateLines(
        "axisY",
        { points: [Vector3.Zero(), new Vector3(0, size, 0)] },
        scene
    );
    axisY.color = Color3.Green();
    axisY.parent = ship;
    const yText = makeTextPlane(scene, "Y", "green", size, 128, 128, 60);
    yText.position = new Vector3(0, size * 1.1, 0);
    yText.parent = ship;

    // Axe Z
    const axisZ = MeshBuilder.CreateLines(
        "axisZ",
        { points: [Vector3.Zero(), new Vector3(0, 0, size)] },
        scene
    );
    axisZ.color = Color3.Blue();
    axisZ.parent = ship;
    const zText = makeTextPlane(scene, "Z", "blue", size, 128, 128, 60);
    zText.position = new Vector3(0.2, 0, size * 1.1);
    zText.parent = ship;

    // Attach axes to ship as attributes
    ship.axes = { axisX, axisY, axisZ, xText, yText, zText };
}

export function createSceneAxisIndicator(axisContext, rotationQuaternion) {
    axisContext.clearRect(0, 0, axisCanvas.width, axisCanvas.height);

    const size = 40;
    const center = { x: 50, y: 50 };

    const transformVector = (vector) => {
        const matrix = new Matrix();
        Matrix.FromQuaternionToRef(rotationQuaternion, matrix);
        const transformed = Vector3.TransformCoordinates(vector, matrix);
        return {
            x: center.x + transformed.x * size,
            y: center.y - transformed.y * size
        };
    };

    const xAxisEnd = transformVector(new Vector3(1, 0, 0));
    const yAxisEnd = transformVector(new Vector3(0, 1, 0));
    const zAxisEnd = transformVector(new Vector3(0, 0, -1)); // Fix Z axis direction

    // Draw X axis (red)
    axisContext.strokeStyle = 'red';
    axisContext.beginPath();
    axisContext.moveTo(center.x, center.y);
    axisContext.lineTo(xAxisEnd.x, xAxisEnd.y);
    axisContext.stroke();
    createArrowhead(axisContext, xAxisEnd.x, xAxisEnd.y, 'red');
    axisContext.fillStyle = 'red';
    axisContext.fillText('X', xAxisEnd.x + 5, xAxisEnd.y);

    // Draw Y axis (green)
    axisContext.strokeStyle = 'green';
    axisContext.beginPath();
    axisContext.moveTo(center.x, center.y);
    axisContext.lineTo(yAxisEnd.x, yAxisEnd.y);
    axisContext.stroke();
    createArrowhead(axisContext, yAxisEnd.x, yAxisEnd.y, 'green');
    axisContext.fillStyle = 'green';
    axisContext.fillText('Y', yAxisEnd.x + 5, yAxisEnd.y);

    // Draw Z axis (blue)
    axisContext.strokeStyle = 'blue';
    axisContext.beginPath();
    axisContext.moveTo(center.x, center.y);
    axisContext.lineTo(zAxisEnd.x, zAxisEnd.y);
    axisContext.stroke();
    createArrowhead(axisContext, zAxisEnd.x, zAxisEnd.y, 'blue');
    axisContext.fillStyle = 'blue';
    axisContext.fillText('Z', zAxisEnd.x + 5, zAxisEnd.y);
}

function createArrowhead(context, x, y, color) {
    const headLength = 5;
    const angle = Math.atan2(y - 50, x - 50);
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x - headLength * Math.cos(angle - Math.PI / 6), y - headLength * Math.sin(angle - Math.PI / 6));
    context.lineTo(x - headLength * Math.cos(angle + Math.PI / 6), y - headLength * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fill();
}

export function createVelocityVector(scene, startPoint, endPoint) {
    let velocityVector = MeshBuilder.CreateLines(
        "velocityVector",
        { points: [startPoint, endPoint] },
        scene
    );
    velocityVector.color = new Color3(1, 0, 1); // Pink color
    return velocityVector;
}

export function createVelocityVectorArrow(scene, startPoint, endPoint, arrowLeft, arrowRight) {
    let velocityVectorArrow = MeshBuilder.CreateLines(
        "velocityVectorArrow",
        { points: [startPoint, endPoint, arrowLeft, endPoint, arrowRight] },
        scene
    );
    velocityVectorArrow.color = new Color3(1, 0, 1);
    return velocityVectorArrow;
}