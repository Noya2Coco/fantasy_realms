const socket = new WebSocket('ws://localhost:8080');

// Lorsque la connexion est ouverte
socket.onopen = () => {
    console.log('Connecté au serveur WebSocket');
    socket.send(JSON.stringify({ type: 'newShip', id: 'player1' }));
};

// Lorsqu'un message est reçu
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'init') {
        displayPlanets(data.planets);
    }
    console.log('Message reçu du serveur:', event.data);
};

// Function to display planets on the client
function displayPlanets(planets) {
    planets.forEach(planet => {
        // Logic to display planets on the client
        console.log(`Planet: Size=${planet.size}, Position=(${planet.position.x}, ${planet.position.y}, ${planet.position.z}), IsStar=${planet.isStar}`);
    });
}

// Lorsqu'une erreur se produit
socket.onerror = (error) => {
    console.error('Erreur WebSocket:', error);
};

// Lorsqu'on est déconnecté
socket.onclose = () => {
    console.log('Déconnecté du serveur WebSocket');
};
