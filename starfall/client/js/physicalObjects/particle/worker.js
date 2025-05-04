self.particles = [];
let lastUpdateTime = Date.now();

self.onmessage = function(event) {
    const { type, data } = event.data;

    if (type === "addParticle" && !self.particles[data.id]) {
        console.log(`Adding particle: ${data.id}`);
        self.particles.push({
            id: data.id,
            position: { ...data.position },
            velocity: { ...data.velocity },
            spawnTime: Date.now(),
            lifeTime: data.lifeTime || 5000 // Default lifetime: 5 seconds
        });
    }

    if (type === "removeParticle") {
        console.log(`Removing particle: ${data.id}`);
        self.particles = self.particles.filter(particle => particle.id !== data.id);
    }
};

// Independent update loop for particles
function updateParticles() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000; // Convert to seconds
    lastUpdateTime = currentTime;

    const updatedParticles = [];
    for (let i = 0; i < self.particles.length; i++) {
        const particle = self.particles[i];
        particle.position.x += particle.velocity.x * deltaTime;
        particle.position.y += particle.velocity.y * deltaTime;
        particle.position.z += particle.velocity.z * deltaTime;

        // Retain particles that are still within their lifetime
        if (currentTime - particle.spawnTime < particle.lifeTime) {
            updatedParticles.push(particle);
        } else {
            console.log(`Particle expired: ${particle.id}`);
        }
    }
    self.particles = updatedParticles;

    // Send updated particle positions to the main thread
    self.postMessage({ type: "updateParticles", particles: self.particles });
}

// Start the continuous update loop (60 FPS)
setInterval(updateParticles, 16);
