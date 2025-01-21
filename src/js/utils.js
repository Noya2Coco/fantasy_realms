import { MeshBuilder, DynamicTexture, StandardMaterial, Vector3, Color3 } from '@babylonjs/core';

export function createAxis(scene, size) {
    const makeTextPlane = (text, color, size) => {
        const dynamicTexture = new DynamicTexture("DynamicTexture", { width: 256, height: 256 }, scene);
        dynamicTexture.drawText(text, null, null, "bold 200px Arial", color, "transparent", true);

        const textSize = dynamicTexture.getSize();
        const plane = MeshBuilder.CreatePlane("TextPlane", { width: textSize.width / 512, height: textSize.height / 512 }, scene);
        const material = new StandardMaterial("TextPlaneMaterial", scene);
        material.diffuseTexture = dynamicTexture;
        material.backFaceCulling = false;
        plane.material = material;
        return plane;
    };

    // Axe X
    const axisX = MeshBuilder.CreateLines(
        "axisX",
        { points: [Vector3.Zero(), new Vector3(size, 0, 0)] },
        scene
    );
    axisX.color = Color3.Red();
    const xText = makeTextPlane("X", "red", size);
    xText.position = new Vector3(size * 0.9, 0.1, 0);

    // Axe Y
    const axisY = MeshBuilder.CreateLines(
        "axisY",
        { points: [Vector3.Zero(), new Vector3(0, size, 0)] },
        scene
    );
    axisY.color = Color3.Green();
    const yText = makeTextPlane("Y", "green", size);
    yText.position = new Vector3(0, size * 0.9, 0);

    // Axe Z
    const axisZ = MeshBuilder.CreateLines(
        "axisZ",
        { points: [Vector3.Zero(), new Vector3(0, 0, size)] },
        scene
    );
    axisZ.color = Color3.Blue();
    const zText = makeTextPlane("Z", "blue", size);
    zText.position = new Vector3(0, 0.1, size * 0.9);
}

export function createShipAxis(ship, scene, size) {
    const makeTextPlane = (text, color, size) => {
        const dynamicTexture = new DynamicTexture("DynamicTexture", { width: 128, height: 128 }, scene);
        dynamicTexture.drawText(text, null, null, "bold 60px Arial", color, "transparent", true);

        const textSize = dynamicTexture.getSize();
        const plane = MeshBuilder.CreatePlane("TextPlane", { width: textSize.width / 512, height: textSize.height / 512 }, scene);
        const material = new StandardMaterial("TextPlaneMaterial", scene);
        material.diffuseTexture = dynamicTexture;
        material.backFaceCulling = false;
        plane.material = material;
        return plane;
    };

    // Axe X
    const axisX = MeshBuilder.CreateLines(
        "axisX",
        { points: [Vector3.Zero(), new Vector3(size, 0, 0)] },
        scene
    );
    axisX.color = Color3.Red();
    axisX.parent = ship;
    const xText = makeTextPlane("X", "red", size);
    xText.position = new Vector3(size * 0.9, 0.1, 0);
    xText.parent = ship;

    // Axe Y
    const axisY = MeshBuilder.CreateLines(
        "axisY",
        { points: [Vector3.Zero(), new Vector3(0, size, 0)] },
        scene
    );
    axisY.color = Color3.Green();
    axisY.parent = ship;
    const yText = makeTextPlane("Y", "green", size);
    yText.position = new Vector3(0, size * 0.9, 0);
    yText.parent = ship;

    // Axe Z
    const axisZ = MeshBuilder.CreateLines(
        "axisZ",
        { points: [Vector3.Zero(), new Vector3(0, 0, size)] },
        scene
    );
    axisZ.color = Color3.Blue();
    axisZ.parent = ship;
    const zText = makeTextPlane("Z", "blue", size);
    zText.position = new Vector3(0, 0.1, size * 0.9);
    zText.parent = ship;
}
