self.bullets = {}; // Stores active bullets
let lastUpdateTime = Date.now();
let emitterPosition = { x: 0, y: 0, z: 0 }; // Position of the emitter (e.g., the ship)

self.onmessage = function(event) {
    const { type, data } = event.data;

    if (type === "addBullet") {
        // Add a new bullet if it doesn't already exist
        if (!self.bullets[data.id]) {
            self.bullets[data.id] = {
                id: data.id,
                position: { ...data.position },
                velocity: { ...data.velocity },
                rotationQuaternion: { ...data.rotationQuaternion },
                spawnTime: Date.now(),
                lifeTime: 15000 // Default lifetime: 15 seconds
            };
        }
    }

    if (type === "removeBullet") {
        // Remove a bullet by its ID
        delete self.bullets[data.id];
    }

    if (type === "updateBulletsFromServer") {
        // Sync bullets with server data
        data.bullets.forEach(serverBullet => {
            if (!self.bullets[serverBullet.id]) {
                self.bullets[serverBullet.id] = { ...serverBullet };
            }
        });
    }

    if (type === "updateEmitterPosition") {
        // Update the emitter's position
        emitterPosition = { ...data.position };
    }
};

// Calculate update interval based on distance
function calculateUpdateInterval(distance) {
    if (distance <= 500) return 1000 / 60; // 60 FPS
    if (distance <= 1000) return 1000 / 30; // 30 FPS
    if (distance <= 2000) return 1000 / 15; // 15 FPS
    return 1000 / 5; // 5 FPS for distant bullets
}

// Update bullet positions and handle expiration
function updateBullets() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Convert to seconds
    lastUpdateTime = currentTime;

    Object.values(self.bullets).forEach(bullet => {
        // Update position based on velocity
        bullet.position.x += bullet.velocity.x * deltaTime;
        bullet.position.y += bullet.velocity.y * deltaTime;
        bullet.position.z += bullet.velocity.z * deltaTime;

        // Remove expired bullets
        if (currentTime - bullet.spawnTime > bullet.lifeTime) {
            delete self.bullets[bullet.id];
            return;
        }

        // Calculate distance from emitter
        const dx = bullet.position.x - emitterPosition.x;
        const dy = bullet.position.y - emitterPosition.y;
        const dz = bullet.position.z - emitterPosition.z;
        const distance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);

        // Remove bullets exceeding distance or coordinate limits
        if (distance >= 4000 || Math.abs(bullet.position.x) > 10000 || Math.abs(bullet.position.y) > 10000 || Math.abs(bullet.position.z) > 10000) {
            delete self.bullets[bullet.id];
            return;
        }

        // Update bullet's update interval based on distance
        bullet.updateInterval = calculateUpdateInterval(distance);
    });

    // Send updated bullet data to the main thread
    self.postMessage({ type: "updateBullets", bullets: Object.values(self.bullets) });
}

// Start the continuous update loop
function dynamicUpdate() {
    updateBullets();

    // Determine the minimum update interval among all bullets
    const minInterval = Math.min(...Object.values(self.bullets).map(bullet => bullet.updateInterval || 1000 / 60));
    setTimeout(dynamicUpdate, minInterval || 1000); // Default to 100 FPS if no bullets
}

dynamicUpdate();
