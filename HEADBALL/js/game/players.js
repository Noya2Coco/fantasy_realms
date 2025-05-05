const { Bodies, Body } = Matter;

// Classe pour représenter un joueur
export class Player {
    constructor(x, y, size, imagePath, engine) {
        this.size = size; // Taille du joueur
        this.startPosition = { x, y }; // Position de départ

        // Création du corps physique du joueur avec un sprite
        this.body = Bodies.circle(x, y, size, {
            restitution: 0.6, // Permet au joueur de rebondir
            friction: 0.1, // Réduit les frottements
            inertia: Infinity, // Empêche la rotation
            render: {
                sprite: {
                    texture: imagePath, // Image associée au joueur
                    xScale: size / 80, // Échelle horizontale de l'image
                    yScale: size / 80, // Échelle verticale de l'image
                    yOffset: 0.1 // Ajuste légèrement l'image
                }
            }
        });

        // Bloque la rotation du joueur à chaque mise à jour
        engine.on('beforeUpdate', () => {
            this.body.angle = 0;
        });

        // Chargement du son pour la frappe
        this.kickSound = new Audio("../sounds/kick.mp3");
    }

    // Remet le joueur à sa position de départ et annule sa vitesse
    reset() {
        Body.setPosition(this.body, this.startPosition);
        Body.setVelocity(this.body, { x: 0, y: 0 });
    }

    // Déplace le joueur horizontalement en fonction d'une direction et d'une force
    move(direction, force) {
        const currentVelocity = this.body.velocity;
        Body.setVelocity(this.body, {
            x: direction * force,
            y: currentVelocity.y
        });
    }

    // Fait sauter le joueur en appliquant une force verticale
    jump(force) {
        const currentVelocity = this.body.velocity;
        Body.setVelocity(this.body, {
            x: currentVelocity.x,
            y: -force
        });
    }

    // Frappe la balle si elle est assez proche
    handleKick(ball) {
        // Calcule la distance entre le joueur et la balle
        const dx = this.body.position.x - ball.body.position.x;
        const dy = this.body.position.y - ball.body.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            // Détermine si c'est le joueur 1 ou 2 en fonction de sa position
            const isPlayer1 = this.body.position.x < ball.body.position.x;
            
            // Calcule l'angle de tir en fonction du joueur
            let angle;
            if (isPlayer1) {
                // Joueur 1 ne peut tirer que vers la droite
                angle = Math.atan2(-dy, Math.abs(dx));
            } else {
                // Joueur 2 ne peut tirer que vers la gauche
                angle = Math.atan2(-dy, -Math.abs(dx));
            }
            
            const kickForce = 0.10;
            const force = {
                x: Math.cos(angle) * kickForce,
                y: Math.sin(angle) * kickForce
            };
            Body.applyForce(ball.body, ball.body.position, force);

            // Joue un son quand le joueur frappe la balle
            if (this.kickSound) {
                this.kickSound.currentTime = 0;
                this.kickSound.play();
            }
        }
    }
}

// Classe pour gérer les deux joueurs
export class PlayersManager {
    constructor(engine, width, height) {
        // Crée deux joueurs aux extrémités opposées du terrain
        this.player1 = new Player(300, height - 50, 45, "../assets/player1.png", engine);
        this.player2 = new Player(width - 300, height - 50, 50, "../assets/player2.png", engine);

        // Ajoute les joueurs au monde physique
        engine.addToWorld([this.player1.body, this.player2.body]);
    }

    // Réinitialise les positions des deux joueurs
    reset() {
        this.player1.reset();
        this.player2.reset();
    }
}