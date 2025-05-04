import { Color3, MeshBuilder, Vector3, Matrix } from '@babylonjs/core';
import { makeTextPlane } from './utils.js';

// Creates axes (X, Y, Z) in the scene with labels and sets them to be initially invisible.
export function createSceneAxis(scene, size) {
    const axes = {};

    // Create the X axis (red)
    axes.axisX = MeshBuilder.CreateLines("axisX", { points: [Vector3.Zero(), new Vector3(size, 0, 0)] }, scene);
    axes.axisX.color = Color3.Red();
    axes.xText = makeTextPlane(scene, "X", "red", 256, 256, 200);
    axes.xText.position = new Vector3(size * 1.1, 0, 0);

    // Create the Y axis (green)
    axes.axisY = MeshBuilder.CreateLines("axisY", { points: [Vector3.Zero(), new Vector3(0, size, 0)] }, scene);
    axes.axisY.color = Color3.Green();
    axes.yText = makeTextPlane(scene, "Y", "green", 256, 256, 200);
    axes.yText.position = new Vector3(0, size * 1.1, 0);

    // Create the Z axis (blue)
    axes.axisZ = MeshBuilder.CreateLines("axisZ", { points: [Vector3.Zero(), new Vector3(0, 0, size)] }, scene);
    axes.axisZ.color = Color3.Blue();
    axes.zText = makeTextPlane(scene, "Z", "blue", 256, 256, 200);
    axes.zText.position = new Vector3(0, 0, size * 1.1);

    // Set all axes to be initially invisible
    for (let axisInfo of Object.values(axes)) {
        axisInfo.isVisible = false;
    }
    scene.axes = axes;
}

// Creates axes (X, Y, Z) attached to a specific mesh with labels and sets them to be initially invisible.
export function createMeshAxis(mesh, scene, size) {
    const axes = {};

    // Create the X axis (red)
    axes.axisX = MeshBuilder.CreateLines("axisX", { points: [Vector3.Zero(), new Vector3(size, 0, 0)] }, scene);
    axes.axisX.color = Color3.Red();
    axes.axisX.parent = mesh;
    axes.xText = makeTextPlane(scene, "X", "red", 128, 128, 60);
    axes.xText.position = new Vector3(size * 1.1, 0, 0);
    axes.xText.parent = mesh;

    // Create the Y axis (green)
    axes.axisY = MeshBuilder.CreateLines("axisY", { points: [Vector3.Zero(), new Vector3(0, size, 0)] }, scene);
    axes.axisY.color = Color3.Green();
    axes.axisY.parent = mesh;
    axes.yText = makeTextPlane(scene, "Y", "green", 128, 128, 60);
    axes.yText.position = new Vector3(0, size * 1.1, 0);
    axes.yText.parent = mesh;

    // Create the Z axis (blue)
    axes.axisZ = MeshBuilder.CreateLines("axisZ", { points: [Vector3.Zero(), new Vector3(0, 0, size)] }, scene);
    axes.axisZ.color = Color3.Blue();
    axes.axisZ.parent = mesh;
    axes.zText = makeTextPlane(scene, "Z", "blue", 128, 128, 60);
    axes.zText.position = new Vector3(0, 0, size * 1.1);
    axes.zText.parent = mesh;

    // Set all axes to be initially invisible and assign a rendering group
    for (let axisInfo of Object.values(axes)) {
        axisInfo.isVisible = false;
        axisInfo.renderingGroupId = 2;
    }

    mesh.axes = axes;
}

// Draws an arrowhead at the end of a line on a 2D canvas.
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

// Draws a 2D axis indicator on a canvas based on the given rotation quaternion.
export function createPanelAxisIndicator(axesContext, rotationQuaternion) {
    axesContext.clearRect(0, 0, axesCanvas.width, axesCanvas.height);

    const size = 40;
    const center = { x: 50, y: 50 };

    // Transforms a vector using the rotation quaternion and scales it for display.
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

    const xAxisEnd = transformVector(new Vector3(1, 0, 0)); // X axis direction
    const yAxisEnd = transformVector(new Vector3(0, 1, 0)); // Y axis direction
    const zAxisEnd = transformVector(new Vector3(0, 0, 1)); // Z axis direction

    // Draw the X axis (red) and its dashed counterpart
    axesContext.strokeStyle = 'red';
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(xAxisEnd.x, xAxisEnd.y);
    axesContext.stroke();
    createArrowhead(axesContext, xAxisEnd.x, xAxisEnd.y, 'red');
    axesContext.fillStyle = 'red';
    axesContext.fillText('X', xAxisEnd.x + 5, xAxisEnd.y);

    axesContext.setLineDash([5, 5]);
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(center.x - (xAxisEnd.x - center.x), center.y - (xAxisEnd.y - center.y));
    axesContext.stroke();
    axesContext.setLineDash([]);

    // Draw the Y axis (green) and its dashed counterpart
    axesContext.strokeStyle = 'green';
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(yAxisEnd.x, yAxisEnd.y);
    axesContext.stroke();
    createArrowhead(axesContext, yAxisEnd.x, yAxisEnd.y, 'green');
    axesContext.fillStyle = 'green';
    axesContext.fillText('Y', yAxisEnd.x + 5, yAxisEnd.y);

    axesContext.setLineDash([5, 5]);
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(center.x - (yAxisEnd.x - center.x), center.y - (yAxisEnd.y - center.y));
    axesContext.stroke();
    axesContext.setLineDash([]);

    // Draw the Z axis (blue) and its dashed counterpart
    axesContext.strokeStyle = 'blue';
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(zAxisEnd.x, zAxisEnd.y);
    axesContext.stroke();
    createArrowhead(axesContext, zAxisEnd.x, zAxisEnd.y, 'blue');
    axesContext.fillStyle = 'blue';
    axesContext.fillText('Z', zAxisEnd.x + 5, zAxisEnd.y);

    axesContext.setLineDash([5, 5]);
    axesContext.beginPath();
    axesContext.moveTo(center.x, center.y);
    axesContext.lineTo(center.x - (zAxisEnd.x - center.x), center.y - (zAxisEnd.y - center.y));
    axesContext.stroke();
    axesContext.setLineDash([]);
}

// Toggles the visibility of all axes in the given axes object.
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
