import { Color3, StandardMaterial, Texture, MeshBuilder } from '@babylonjs/core';

export function createSkybox(scene) {
    const skydome = MeshBuilder.CreateSphere("skyDome", { segments: 64, diameter: 10000 }, scene); // Plus de segments = moins d’artefacts
    const skydomeMaterial = new StandardMaterial("skyDomeMaterial", scene);

    skydomeMaterial.backFaceCulling = false; // Affiche l'intérieur de la sphère
    skydomeMaterial.diffuseTexture = new Texture("/img/skybox/space.jpg", scene);
    skydomeMaterial.diffuseTexture.uScale = 1;
    skydomeMaterial.diffuseTexture.vScale = 1;
    skydomeMaterial.diffuseTexture.level = 0.5; // Atténue les contrastes
    skydomeMaterial.diffuseTexture.blurLevel = 2; // Applique un flou
    skydomeMaterial.specularColor = new Color3(0, 0, 0); // Pas de réflexion de lumière
    skydomeMaterial.emissiveColor = new Color3(1, 1, 1); // Rendu plus lumineux
    skydomeMaterial.alpha = 0.95; // Légère transparence pour atténuer les défauts

    skydome.material = skydomeMaterial;
    skydome.infiniteDistance = true;

    return skydome;
}
