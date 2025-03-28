self.bullets = {}; // Stocke tous les projectiles
let lastUpdateTime = Date.now();

self.onmessage = function(event) {
    const { type, data } = event.data;

    if (type === "addBullet") {
        if (!self.bullets[data.id]) {
            console.log(`🔫 Ajout du projectile: ${data.id}`);
            self.bullets[data.id] = {
                id: data.id,
                position: { ...data.position },
                velocity: { ...data.velocity },
                rotationQuaternion: { ...data.rotationQuaternion },
                spawnTime: Date.now(),
                lifeTime: 5000 // 5s de vie
            };
        }
    }

    if (type === "removeBullet") {
        delete self.bullets[data.id];
    }

    if (type === "updateBulletsFromServer") {
        data.bullets.forEach(serverBullet => {
            if (!self.bullets[serverBullet.id]) {
                self.bullets[serverBullet.id] = { ...serverBullet };
            }
        });
    }
};

// Mise à jour en continu
function updateBullets() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Conversion en secondes
    lastUpdateTime = currentTime;

    Object.values(self.bullets).forEach(bullet => {
        bullet.position.x += bullet.velocity.x * deltaTime;
        bullet.position.y += bullet.velocity.y * deltaTime;
        bullet.position.z += bullet.velocity.z * deltaTime;

        // Suppression des projectiles expirés
        if (currentTime - bullet.spawnTime > bullet.lifeTime) {
            delete self.bullets[bullet.id];
        }

        // Vérification de la distance pour la visibilité
        const distance = Math.sqrt(bullet.position.x ** 2 + bullet.position.y ** 2 + bullet.position.z ** 2);
        bullet.visible = distance <= 400;

        // Suppression des projectiles qui dépassent la limite de coordonnées
        const maxCoord = 2000;
        if (Math.abs(bullet.position.x) > maxCoord || Math.abs(bullet.position.y) > maxCoord || Math.abs(bullet.position.z) > maxCoord) {
            delete self.bullets[bullet.id];
        }
    });

    self.postMessage({ type: "updateBullets", bullets: Object.values(self.bullets) });
}

// Démarrer la mise à jour continue
setInterval(updateBullets, 50); // 20 FPS
