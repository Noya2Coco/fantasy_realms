// Classe pour gérer l'interface utilisateur du jeu
export class UIManager {
    constructor() {
        this.setupUI(); // Configure l'UI initiale
    }

    // Configure l'UI au début
    setupUI() {
        // Masquer le canvas de jeu initialement
        document.getElementById("gameCanvas").style.display = "none";
        // Masquer le bouton "Recommencer" initialement
        document.getElementById("restartButton").style.display = "none";
        // Masquer les images des cages au début
        const leftGoal = document.getElementById("leftGoalImage");
        const rightGoal = document.getElementById("rightGoalImage");
        if (leftGoal) leftGoal.classList.add("hidden");
        if (rightGoal) rightGoal.classList.add("hidden");

        // Créer le bouton de pause et l'ajouter à l'UI
        const pauseButton = document.createElement('button');
        pauseButton.id = 'pauseButton';
        pauseButton.innerHTML = `
            <div class="pause-bars">
                <div class="pause-bar"></div>
                <div class="pause-bar"></div>
            </div>
        `;
        pauseButton.style.display = 'none'; // Masquer le bouton de pause au départ
        document.body.appendChild(pauseButton);

        // Créer le menu de pause et l'ajouter à l'UI
        const pauseMenu = document.createElement('div');
        pauseMenu.id = 'pauseMenu';
        pauseMenu.style.display = 'none'; // Masquer le menu de pause au départ
        pauseMenu.innerHTML = `
            <h2>PAUSE</h2>
            <div class="controls">
                <div class="player-controls">
                    <h3 class="player1-controls">Joueur 1</h3>
                    <ul>
                        <li>Z :  Sauter</li>
                        <li>Q :  Gauche</li>
                        <li>D :  Droite</li>
                        <li>S :  Frapper</li>
                    </ul>
                </div>
                <div class="player-controls">
                    <h3 class="player2-controls">Joueur 2</h3>
                    <ul>
                        <li>↑ :  Sauter</li>
                        <li>← :  Gauche</li>
                        <li>→ :  Droite</li>
                        <li>↓ :  Frapper</li>
                    </ul>
                </div>
            </div>
            <button id="resumeButton">Reprendre</button>
        `;
        document.body.appendChild(pauseMenu);
    }

    // Affiche le jeu en cours (canvas et autres éléments)
    showGame() {
        document.getElementById("title").style.display = "none"; // Masque le titre
        document.getElementById("gameCanvas").style.display = "block"; // Affiche le canvas
        document.getElementById("startGame").style.display = "none"; // Masque le bouton de démarrage
        document.getElementById("pauseButton").style.display = "block"; // Affiche le bouton de pause
        // Affiche les cages de but
        const leftGoal = document.getElementById("leftGoalImage");
        const rightGoal = document.getElementById("rightGoalImage");
        if (leftGoal) leftGoal.classList.remove("hidden");
        if (rightGoal) rightGoal.classList.remove("hidden");
    }

    // Affiche le menu principal (avant le début du jeu)
    showMenu() {
        document.getElementById("title").style.display = "block"; // Affiche le titre
        document.getElementById("gameCanvas").style.display = "none"; // Masque le canvas
        document.getElementById("startGame").style.display = "block"; // Affiche le bouton de démarrage
        document.getElementById("pauseButton").style.display = "none"; // Masque le bouton de pause
        document.getElementById("restartButton").style.display = "none"; // Masque le bouton de redémarrage
        // Masque les cages de but
        const leftGoal = document.getElementById("leftGoalImage");
        const rightGoal = document.getElementById("rightGoalImage");
        if (leftGoal) leftGoal.classList.add("hidden");
        if (rightGoal) rightGoal.classList.add("hidden");
    }

    // Affiche le bouton pour recommencer
    showRestartButton() {
        document.getElementById("restartButton").style.display = "block"; // Affiche le bouton
    }

    // Masque le bouton de recommencement
    hideRestartButton() {
        document.getElementById("restartButton").style.display = "none"; // Masque le bouton
    }

    // Masque les images des cages de but
    hideGoals() {
        const leftGoal = document.getElementById("leftGoalImage");
        const rightGoal = document.getElementById("rightGoalImage");
        if (leftGoal) leftGoal.classList.add("hidden");
        if (rightGoal) rightGoal.classList.add("hidden");
    }

    // Affiche le menu de pause
    showPauseMenu() {
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.style.display = 'block'; // Affiche le menu de pause
        }
    }

    // Masque le menu de pause
    hidePauseMenu() {
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.style.display = 'none'; // Masque le menu de pause
        }
    }
}