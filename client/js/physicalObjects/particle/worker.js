self.particles = [];
let lastUpdateTime = Date.now();

self.onmessage = function(event) {
    const { type, data } = event.data;

    if (type === "addParticle") {
        self.particles.push({
            id: data.id,
            position: { ...data.position },
            velocity: { ...data.velocity },
            spawnTime: Date.now(),
            lifeTime: data.lifeTime || 5000 // Default lifetime of 5s
        });
    }

    if (type === "removeParticle") {
        self.particles = self.particles.filter(particle => particle.id !== data.id);
    }
};

// Boucle d'update indépendante
function updateParticles() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Conversion en secondes
    lastUpdateTime = currentTime;

    const updatedParticles = [];
    for (let i = 0; i < self.particles.length; i++) {
        const particle = self.particles[i];
        particle.position.x += particle.velocity.x * deltaTime;
        particle.position.y += particle.velocity.y * deltaTime;
        particle.position.z += particle.velocity.z * deltaTime;

        // Vérifie si la particule doit être supprimée
        if (currentTime - particle.spawnTime < particle.lifeTime) {
            updatedParticles.push(particle);
        }
    }
    self.particles = updatedParticles;

    // Envoie les nouvelles positions au thread principal
    self.postMessage({ type: "updateParticles", particles: self.particles });
}

// Lancer la boucle d'update en continu
setInterval(updateParticles, 16); // 60 FPS
