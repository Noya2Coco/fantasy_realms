import { MeshBuilder, PBRMaterial, Color3, Vector3, PointLight, Texture, Scalar, ParticleSystem, Texture as BabylonTexture } from '@babylonjs/core';

/**
 * Represents a planet or star in the scene.
 */
export class Planet {
    constructor(scene, data) {
        this.scene = scene;
        this.isStar = data.isStar;

        // Create the planet/star mesh
        this._createMesh(data);

        // Configure material based on type (planet or star)
        this._configureMaterial(data);

        // Add rotation for planets
        if (!this.isStar) {
            this._addRandomRotation();
        }

        // Add light and flares for stars
        if (this.isStar) {
            this._addStarLight();
            this._addStarFlares();
        }
    }

    /** Creates the mesh for the planet or star */
    _createMesh(data) {
        const sizeCoeff = this.isStar ? 2 : 1;
        this.mesh = MeshBuilder.CreateSphere('planet', { diameter: data.size * sizeCoeff }, this.scene);
        this.mesh.size = data.size;
        this.mesh.position.set(data.position.x, data.position.y, data.position.z);
        this.mesh.renderingGroupId = 1;

        // Define gravitational properties
        this.gravitationalRange = this.isStar 
            ? this.mesh.size * 6 // Larger range for stars
            : this.mesh.size * 3;
        const baseGravitationalConstant = this.mesh.size * 0.005;
        this.gravitationalConstant = this.isStar
            ? baseGravitationalConstant * 2 // Stronger gravity for stars
            : baseGravitationalConstant * 0.75; // Weaker gravity for planets
    }

    /** Configures the material for the planet or star */
    _configureMaterial(data) {
        const material = new PBRMaterial('planetMaterial', this.scene);

        if (this.isStar) {
            // Configure emissive material for stars
            material.emissiveColor = Color3.FromHexString("#7e3300");
            material.disableLighting = true;

            // Load emissive texture for stars
            const emissiveTexturePath = "../../images/sun.jpg";
            material.emissiveTexture = new Texture(emissiveTexturePath, this.scene, false, true, Texture.TRILINEAR_SAMPLINGMODE, 
                () => console.log(`✅ Emissive texture loaded successfully: ${emissiveTexturePath}`),
                (message, exception) => console.error(`❌ Failed to load emissive texture: ${emissiveTexturePath}`, message, exception)
            );
        } else {
            // Configure material with textures for planets
            const textureSets = [
                {
                    albedo: "../../images/planets/planet_1/Color.jpg",
                    normal: "../../images/planets/planet_1/NormalGL.jpg",
                    parallax: "../../images/planets/planet_1/Displacement.jpg",
                    roughness: "../../images/planets/planet_1/Roughness.jpg",
                },
                {
                    albedo: "../../images/planets/planet_2/Color.jpg",
                    normal: "../../images/planets/planet_2/NormalGL.jpg",
                    parallax: "../../images/planets/planet_2/Displacement.jpg",
                    roughness: "../../images/planets/planet_2/Roughness.jpg",
                },
                {
                    albedo: "../../images/planets/planet_3/Color.jpg",
                    normal: "../../images/planets/planet_3/NormalGL.jpg",
                    parallax: "../../images/planets/planet_3/Displacement.jpg",
                    roughness: "../../images/planets/planet_3/Roughness.jpg",
                },
            ];
            const selectedTextures = textureSets[Math.floor(Math.random() * textureSets.length)];

            material.albedoTexture = new Texture(selectedTextures.albedo, this.scene);
            material.bumpTexture = new Texture(selectedTextures.normal, this.scene);
            material.useParallax = true;
            material.useParallaxOcclusion = true;
            material.parallaxScaleBias = 0.03;
            material.parallaxTexture = new Texture(selectedTextures.parallax, this.scene);
            material.roughness = 1.0;
            material.metallicTexture = new Texture(selectedTextures.roughness, this.scene);

            // Apply random texture offsets
            material.albedoTexture.uOffset = Math.random();
            material.albedoTexture.vOffset = Math.random();
            material.bumpTexture.uOffset = Math.random();
            material.bumpTexture.vOffset = Math.random();
            material.parallaxTexture.uOffset = Math.random();
            material.parallaxTexture.vOffset = Math.random();
            material.metallicTexture.uOffset = Math.random();
            material.metallicTexture.vOffset = Math.random();
        }

        this.mesh.material = material;
    }

    /** Adds random rotation to the planet */
    _addRandomRotation() {
        const rotationSpeed = Scalar.RandomRange(0.001, 0.01);
        const rotationAxis = new Vector3(
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            Math.random() * 2 - 1
        ).normalize();

        this.scene.onBeforeRenderObservable.add(() => {
            this.mesh.rotate(rotationAxis, rotationSpeed, BABYLON.Space.LOCAL);
        });
    }

    /** Adds light to the star */
    _addStarLight() {
        const light = new PointLight('planetLight', this.mesh.position, this.scene);
        light.intensity = 20;
        light.range = this.mesh.size * 40;

        light.diffuse = Color3.FromHexString("#7e3300");
        light.specular = new Color3(0.1, 0.1, 0.1);

        light.attachedMesh = this.mesh;
        light.falloffType = PointLight.FALLOFF_PHYSICAL;
        light.radius = this.mesh.size * 20;
        light.attenuation0 = 0.05;
        light.attenuation1 = 0.05;
        light.attenuation2 = 0.05;

        this.mesh.light = light;
    }

    /** Adds particle flares to the star */
    _addStarFlares() {
        if (!this.mesh || !this.mesh.position || typeof this.mesh.size === 'undefined') {
            console.error("❌ this.mesh, this.mesh.position, or this.mesh.size is undefined in _addStarFlares");
            return;
        }

        const particleSystem = new ParticleSystem("starFlares", 2000, this.scene);
        const flarePath = "../../images/flare.jpg";
        particleSystem.particleTexture = new Texture(
            flarePath,
            this.scene,
            false,
            true,
            Texture.TRILINEAR_SAMPLINGMODE,
            () => console.log(`✅ Texture loaded successfully: ${flarePath}`),
            (message, exception) => console.error(`❌ Failed to load texture: ${flarePath}`, message, exception)
        );        

        particleSystem.emitter = this.mesh;

        // Configure particle properties
        particleSystem.minEmitBox = new Vector3(-this.mesh.size / 2, -this.mesh.size / 2, -this.mesh.size / 2);
        particleSystem.maxEmitBox = new Vector3(this.mesh.size / 2, this.mesh.size / 2, this.mesh.size / 2);

        particleSystem.color1 = new Color3(1, 0.5, 0);
        particleSystem.color2 = new Color3(1, 0, 0);
        particleSystem.colorDead = new Color3(0.2, 0.2, 0.2);

        particleSystem.minSize = 0.5;
        particleSystem.maxSize = 2.0;

        particleSystem.minLifeTime = 0.2;
        particleSystem.maxLifeTime = 1.0;

        particleSystem.emitRate = 500;

        particleSystem.direction1 = new Vector3(-1, 1, -1);
        particleSystem.direction2 = new Vector3(1, 1, 1);

        particleSystem.minEmitPower = 2;
        particleSystem.maxEmitPower = 5;
        particleSystem.updateSpeed = 0.01;

        particleSystem.start();

        this.particleSystem = particleSystem;
        console.log("✅ Particle system started for star:", this.mesh.name);
    }

    /** Toggles the gravity warning indicator */
    toggleGravityWarning(show) {
        const gravityWarning = document.getElementById('gravityWarning');
        if (gravityWarning) {
            gravityWarning.style.display = show ? 'block' : 'none';
        }
    }

    /** Applies gravitational force to a ship within range */
    applyGravitationalForce(ship) {
        const direction = this.mesh.position.subtract(ship.mesh.position);
        const distanceSquared = direction.lengthSquared();
        const isWithinRange = distanceSquared <= this.gravitationalRange * this.gravitationalRange;

        this.toggleGravityWarning(isWithinRange);

        if (!isWithinRange) {
            return;
        }

        const forceMagnitude = (this.gravitationalConstant * this.mesh.size) / distanceSquared;
        if (forceMagnitude < 0.001) {
            return;
        }

        const force = direction.normalize().scale(forceMagnitude);
        ship.mesh.velocity.addInPlace(force);
    }

    /** Disposes of the planet/star and its resources */
    dispose() {
        if (this.mesh) {
            this.mesh.dispose();
        }
        if (this.mesh.light) {
            this.mesh.light.dispose();
        }
        if (this.particleSystem) {
            this.particleSystem.dispose();
        }
    }
}
