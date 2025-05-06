function connectToStarfall() {
    const sessionData = JSON.parse(sessionStorage.getItem('userSession'));
    const userToken = sessionData ? sessionData.email : null;

    if (!userToken) {
        alert("Vous devez être connecté pour jouer à Starfall.");
        return;
    }

    // Redirect to Starfall with the token in the URL
    const starfallUrl = `http://localhost:5173?token=${encodeURIComponent(userToken)}`;
    window.location.href = starfallUrl;
}

// Appelez cette fonction lorsque l'utilisateur clique sur "Jouer"
document.getElementById('play-button').addEventListener('click', connectToStarfall);
