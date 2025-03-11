self.bullets = [];
self.ships = {};
let lastUpdateTime = Date.now();

self.onmessage = function(event) {
    const { type, data } = event.data;

    if (type === "addBullet") {
        self.bullets.push({
            id: data.id,
            position: { ...data.position },
            rotation: { ...data.rotation },
            direction: { ...data.direction },
            velocity: { ...data.velocity },
            spawnTime: Date.now(),
            lifeTime: 5000, // Détruire après 5s
            shipPosition: {x: 0, y: 0, z: 0}
        });
    }

    if (type === "removeBullet") {
        self.bullets = self.bullets.filter(bullet => bullet.id !== data.id);
    }

    if (type === "updateShip") {
        self.shipPosition = data.position;
    }
};

// Boucle d'update indépendante
function updateBullets() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Conversion en secondes
    lastUpdateTime = currentTime;

    self.bullets.forEach(bullet => {
        bullet.position.x += bullet.velocity.x * deltaTime;
        bullet.position.y += bullet.velocity.y * deltaTime;
        bullet.position.z += bullet.velocity.z * deltaTime;

        if (self.shipPosition) {
            const distanceFromShip = Math.sqrt(
                Math.pow(bullet.position.x - shipPosition.x, 2) +
                Math.pow(bullet.position.y - shipPosition.y, 2) +
                Math.pow(bullet.position.z - shipPosition.z, 2)
            );
            bullet.isVisible = distanceFromShip <= 400;
        }
    });

    self.postMessage({ type: "updateBullets", bullets: self.bullets });

    setTimeout(updateBullets, 16); // 60 FPS
}

// Lancer la boucle d'update en continu
updateBullets();
