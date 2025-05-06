import { GameEngine } from './engine.js';
import { PlayersManager } from './players.js';
import { Ball } from './ball.js';
import { GoalsManager } from './goals.js';
import { ScoreManager } from './score.js';
import { InputManager } from './input.js';
import { UIManager } from './ui.js';

export class Game {
    constructor() {
        // Initialisation des dimensions de la fenêtre
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Initialisation des différents gestionnaires et composants
        this.uiManager = new UIManager(); // Gestion de l'interface utilisateur
        this.engine = new GameEngine(this.width, this.height); // Moteur du jeu
        this.playersManager = new PlayersManager(this.engine, this.width, this.height); // Gestion des joueurs
        this.ball = new Ball(this.engine, this.width, this.height); // Gestion de la balle
        this.goalsManager = new GoalsManager(this.engine, this.width, this.height); // Gestion des buts
        this.scoreManager = new ScoreManager(this.uiManager); // Gestion du score et du chronomètre
        this.inputManager = new InputManager(this.playersManager, this.ball, this.uiManager, this.scoreManager); // Gestion des entrées utilisateur

        this.setupEventListeners(); // Mise en place des événements du jeu
    }

    setupEventListeners() {
        // Détection des collisions pour vérifier si un but est marqué
        this.engine.on('collisionStart', (event) => {
            event.pairs.forEach(({ bodyA, bodyB }) => {
                if (bodyA === this.ball.body || bodyB === this.ball.body) {
                    const goalBody = bodyA === this.ball.body ? bodyB : bodyA;
                    this.goalsManager.checkGoal(goalBody, (team) => {
                        // Mise à jour du score et affichage d'un message de but
                        this.scoreManager.updateScore(team);
                        this.scoreManager.showGoalMessage();
                        
                        // Réinitialisation des positions après un délai
                        setTimeout(() => this.resetPositions(), 1000);
                    });
                }
            });
        });

        // Gestion du bouton de démarrage du jeu
        document.getElementById("startGame").addEventListener("click", () => this.start());

        // Gestion du bouton de redémarrage
        document.getElementById("restartButton").addEventListener("click", () => this.restart());
    }

    start() {
        // Démarrer le jeu
        this.uiManager.showGame(); // Afficher l'interface de jeu
        this.scoreManager.startTimer(); // Démarrer le chronomètre
        this.engine.start(); // Lancer le moteur du jeu
    }

    restart() {
        // Redémarrer le jeu
        this.resetPositions(); // Réinitialiser les positions des éléments
        this.scoreManager.reset(); // Réinitialiser le score
        this.scoreManager.startTimer(); // Relancer le chronomètre
        this.uiManager.hideRestartButton(); // Cacher le bouton de redémarrage
        this.uiManager.showGame(); // Réafficher l'interface de jeu
    }

    resetPositions() {
        // Réinitialiser la balle et les joueurs à leurs positions de départ
        this.ball.reset();
        this.playersManager.reset();
    }
}