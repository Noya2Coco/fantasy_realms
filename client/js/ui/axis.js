import { Color3, MeshBuilder, Vector3 } from '@babylonjs/core';
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
