// Importer la classe Game depuis le fichier game.js
import { Game } from './game/game.js';

// Attendre que accountManager soit disponible avant d'initialiser le jeu
const checkAccountManager = setInterval(() => {
    if (window.accountManager) {
        clearInterval(checkAccountManager);
        // Créer une instance du jeu
        const game = new Game(); // Cela initialise le jeu en créant un objet Game
    }
}, 100);

// Gérer le redimensionnement de la fenêtre
window.addEventListener('resize', () => {
});
