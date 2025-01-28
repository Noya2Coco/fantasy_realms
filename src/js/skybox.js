import { MeshBuilder, StandardMaterial, CubeTexture, Texture } from '@babylonjs/core';

export function createSkybox(scene) {
    const skybox = MeshBuilder.CreateBox("skyBox", { size: 10000 }, scene); // Increase skybox size
    const skyboxMaterial = new StandardMaterial("skyBoxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;

    // Chargez la texture cubique
    const skyboxTexture = new CubeTexture("/img/skybox/skybox", scene);
    skyboxMaterial.reflectionTexture = skyboxTexture;
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;

    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
}
