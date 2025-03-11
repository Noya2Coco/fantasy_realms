import { Color3, MeshBuilder, Vector3, Matrix } from '@babylonjs/core';
import { makeTextPlane } from './utils.js';

export function createSceneAxis(scene, size) {
    const axes = {};

    // Axe X (Rouge)
    axes.axisX = MeshBuilder.CreateLines("axisX", { points: [Vector3.Zero(), new Vector3(size, 0, 0)] }, scene);
    axes.axisX.color = Color3.Red();
    axes.xText = makeTextPlane(scene, "X", "red", 256, 256, 200);
    axes.xText.position = new Vector3(size * 1.1, 0, 0);

    // Axe Y (Vert)
    axes.axisY = MeshBuilder.CreateLines("axisY", { points: [Vector3.Zero(), new Vector3(0, size, 0)] }, scene);
    axes.axisY.color = Color3.Green();
    axes.yText = makeTextPlane(scene, "Y", "green", 256, 256, 200);
    axes.yText.position = new Vector3(0, size * 1.1, 0);

    // Axe Z (Bleu)
    axes.axisZ = MeshBuilder.CreateLines("axisZ", { points: [Vector3.Zero(), new Vector3(0, 0, size)] }, scene);
    axes.axisZ.color = Color3.Blue();
    axes.zText = makeTextPlane(scene, "Z", "blue", 256, 256, 200);
    axes.zText.position = new Vector3(0, 0, size * 1.1);

    for (let axisInfo of Object.values(axes)) {
        axisInfo.isVisible = false;
    }
    scene.axes = axes;
}

export function createMeshAxis(mesh, scene, size) {
    const axes = {};

    // Axe X (Rouge)
    axes.axisX = MeshBuilder.CreateLines("axisX", { points: [Vector3.Zero(), new Vector3(size, 0, 0)] }, scene);
    axes.axisX.color = Color3.Red();
    axes.axisX.parent = mesh;
    axes.xText = makeTextPlane(scene, "X", "red", 128, 128, 60);
    axes.xText.position = new Vector3(size * 1.1, 0, 0);
    axes.xText.parent = mesh;

    // Axe Y (Vert)
    axes.axisY = MeshBuilder.CreateLines("axisY", { points: [Vector3.Zero(), new Vector3(0, size, 0)] }, scene);
    axes.axisY.color = Color3.Green();
    axes.axisY.parent = mesh;
    axes.yText = makeTextPlane(scene, "Y", "green", 128, 128, 60);
    axes.yText.position = new Vector3(0, size * 1.1, 0);
    axes.yText.parent = mesh;

    // Axe Z (Bleu)
    axes.axisZ = MeshBuilder.CreateLines("axisZ", { points: [Vector3.Zero(), new Vector3(0, 0, size)] }, scene);
    axes.axisZ.color = Color3.Blue();
    axes.axisZ.parent = mesh;
    axes.zText = makeTextPlane(scene, "Z", "blue", 128, 128, 60);
    axes.zText.position = new Vector3(0, 0, size * 1.1);
    axes.zText.parent = mesh;

    for (let axisInfo of Object.values(axes)) {
        axisInfo.isVisible = false;
        axisInfo.renderingGroupId = 2;
    }

    mesh.axes = axes;
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

export function createPanelAxisIndicator(axesContext, rotationQuaternion) {
    axesContext.clearRect(0, 0, axesCanvas.width, axesCanvas.height);

    const size = 40;
    const center = { x: 50, y: 50 };

    const transformVector = (vector) => {
        const matrix = new Matrix();
        Matrix.FromQuaternionToRef(rotationQuaternion, matrix);
        const transformed = Vector3.TransformCoordinates(vector, matrix);
        return {
            x: center.x + transformed.x * size, // Align X-axis movement
            y: center.y - transformed.y * size, // Align Y-axis movement
            z: center.z + transformed.z * size  // Align Z-axis movement
        };
    };

    const xAxisEnd = transformVector(new Vector3(1, 0, 0)); // Align X axis direction
    const yAxisEnd = transformVector(new Vector3(0, 1, 0)); // Align Y axis direction
    const zAxisEnd = transformVector(new Vector3(0, 0, 1)); // Align Z axis direction

    // Draw X axis (red)
    axesContext.strokeStyle = 'red';
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(xAxisEnd.x, xAxisEnd.y);
    axesContext.stroke();
    createArrowhead(axesContext, xAxisEnd.x, xAxisEnd.y, 'red');
    axesContext.fillStyle = 'red';
    axesContext.fillText('X', xAxisEnd.x + 5, xAxisEnd.y);

    // Draw dashed line for X axis (red)
    axesContext.setLineDash([5, 5]);
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(center.x - (xAxisEnd.x - center.x), center.y - (xAxisEnd.y - center.y));
    axesContext.stroke();
    axesContext.setLineDash([]);

    // Draw Y axis (green)
    axesContext.strokeStyle = 'green';
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(yAxisEnd.x, yAxisEnd.y);
    axesContext.stroke();
    createArrowhead(axesContext, yAxisEnd.x, yAxisEnd.y, 'green');
    axesContext.fillStyle = 'green';
    axesContext.fillText('Y', yAxisEnd.x + 5, yAxisEnd.y);

    // Draw dashed line for Y axis (green)
    axesContext.setLineDash([5, 5]);
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(center.x - (yAxisEnd.x - center.x), center.y - (yAxisEnd.y - center.y));
    axesContext.stroke();
    axesContext.setLineDash([]);

    // Draw Z axis (blue)
    axesContext.strokeStyle = 'blue';
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(zAxisEnd.x, zAxisEnd.y);
    axesContext.stroke();
    createArrowhead(axesContext, zAxisEnd.x, zAxisEnd.y, 'blue');
    axesContext.fillStyle = 'blue';
    axesContext.fillText('Z', zAxisEnd.x + 5, zAxisEnd.y);

    // Draw dashed line for Z axis (blue)
    axesContext.setLineDash([5, 5]);
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(center.x - (zAxisEnd.x - center.x), center.y - (zAxisEnd.y - center.y));
    axesContext.stroke();
    axesContext.setLineDash([]);
}

export function setAxesVisibility(axes, visibility) {
    if (axes) {
        Object.values(axes).forEach(axis => {
            if (axis && typeof axis.isVisible !== 'undefined') {
                axis.isVisible = visibility;
            }
        });
        return axes;
    }
}
