export class InputManager {
    constructor(playersManager, ball, uiManager, scoreManager) {
        this.playersManager = playersManager; // Gestion des joueurs
        this.ball = ball; // Référence à la balle
        this.uiManager = uiManager; // Gestion de l'interface utilisateur
        this.scoreManager = scoreManager; // Gestion du score et du chronomètre
        this.keys = {}; // État des touches pressées
        this.isPaused = false; // Indique si le jeu est en pause
        this.setupEventListeners(); // Initialisation des événements clavier et interface
    }

    setupEventListeners() {
        // Écoute les pressions de touches
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.togglePause(); // Basculer entre pause et reprise
            } else if (!this.isPaused) {
                this.handleKeyDown(e); // Gestion des autres touches
            }
        });

        // Écoute les relâchements de touches
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Gestion des boutons Pause et Reprise dans l'interface utilisateur
        document.getElementById('pauseButton').addEventListener('click', () => {
            this.togglePause();
        });
        document.getElementById('resumeButton').addEventListener('click', () => {
            this.togglePause();
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused; // Bascule l'état de pause
        this.scoreManager.togglePause(); // Met à jour le gestionnaire de score
        if (this.isPaused) {
            this.uiManager.showPauseMenu(); // Affiche le menu pause
        } else {
            this.uiManager.hidePauseMenu(); // Cache le menu pause
        }
    }

    handleKeyDown(e) {
        if (!this.isPaused) {
            this.keys[e.key] = true; // Enregistre la touche comme pressée
            this.updatePlayerMovement(); // Met à jour les mouvements du joueur
        }
    }

    handleKeyUp(e) {
        this.keys[e.key] = false; // Enregistre la touche comme relâchée
        this.updatePlayerMovement(); // Met à jour les mouvements du joueur
    }

    updatePlayerMovement() {
        if (this.isPaused) return; // Ne rien faire si le jeu est en pause

        const moveForce = 5; // Force de déplacement horizontale
        const jumpForce = 10; // Force de saut

        // Contrôles pour le joueur 1 (Touches ZQSD)
        if (this.keys['q']) {
            this.playersManager.player1.move(-1, moveForce); // Déplacement à gauche
        }
        if (this.keys['d']) {
            this.playersManager.player1.move(1, moveForce); // Déplacement à droite
        }
        if (this.keys['z']) {
            this.playersManager.player1.jump(jumpForce); // Saut
        }
        if (this.keys['s']) {
            this.playersManager.player1.handleKick(this.ball); // Coup de pied sur la balle
        }

        // Contrôles pour le joueur 2 (Touches fléchées)
        if (this.keys['ArrowLeft']) {
            this.playersManager.player2.move(-1, moveForce); // Déplacement à gauche
        }
        if (this.keys['ArrowRight']) {
            this.playersManager.player2.move(1, moveForce); // Déplacement à droite
        }
        if (this.keys['ArrowUp']) {
            this.playersManager.player2.jump(jumpForce); // Saut
        }
        if (this.keys['ArrowDown']) {
            this.playersManager.player2.handleKick(this.ball); // Coup de pied sur la balle
        }
    }
}