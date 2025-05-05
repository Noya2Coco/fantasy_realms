const { Engine, Render, Runner, World, Bodies } = Matter;

export class GameEngine {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.engine = Engine.create(); // Création du moteur physique
        this.world = this.engine.world; // Référence au monde du moteur
        this.canvas = document.getElementById('gameCanvas'); // Sélection de l'élément canvas
        this.canvas.width = width;
        this.canvas.height = height;

        // Configuration du rendu visuel
        this.render = Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                width,
                height,
                wireframes: false,
                background: '../assets/stade.png', // Image de fond du terrain
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
            }
        });

        this.setupWorld(); // Initialisation des objets du monde (murs, sol, etc.)
    }

    setupWorld() {
        // Dimensions des murs et du sol
        const wallThickness = 15;

        // Création des éléments statiques : sol, murs et plafond
        const ground = Bodies.rectangle(this.width / 2, this.height, this.width, 265, { 
            isStatic: true, // Ne bouge pas
            render: { fillStyle: "transparent" } // Sol transparent
        });
        const ground2 = Bodies.rectangle(this.width / 2, this.height, this.width, wallThickness, { 
            isStatic: true,
            render: { fillStyle: "black" } // Sol visible en noir
        });
        const leftWall = Bodies.rectangle(wallThickness / 2, this.height / 2, wallThickness, this.height, { 
            isStatic: true, 
            render: { fillStyle: "black" } // Mur gauche noir
        });
        const rightWall = Bodies.rectangle(this.width - wallThickness / 2, this.height / 2, wallThickness, this.height, { 
            isStatic: true, 
            render: { fillStyle: "black" } // Mur droit noir
        });
        const ceiling = Bodies.rectangle(this.width / 2, wallThickness / 2, this.width, wallThickness, { 
            isStatic: true, 
            render: { fillStyle: "black" } // Plafond noir
        });

        // Ajouter tous les éléments statiques au monde
        World.add(this.world, [ground, leftWall, rightWall, ceiling, ground2]);
    }

    start() {
        // Démarrer le moteur physique et le rendu
        Render.run(this.render);
        Runner.run(Runner.create(), this.engine);
    }

    addToWorld(bodies) {
        // Ajouter des objets supplémentaires au monde physique
        World.add(this.world, bodies);
    }

    on(event, callback) {
        // Attacher un événement personnalisé au moteur
        Matter.Events.on(this.engine, event, callback);
    }

    checkCollisions() {
        // Vérifier les collisions entre la balle et les murs ou les joueurs
        const margin = 2; // Marge pour éviter que la balle traverse les murs
        const wallThickness = 15;

        // Collisions avec les murs
        if (this.ball.x - this.ball.radius <= wallThickness + margin) {
            this.ball.x = wallThickness + this.ball.radius + margin; // Empêcher la traversée
            this.ball.vx = -this.ball.vx * 0.95; // Inverser et réduire la vitesse horizontale
        }
        if (this.ball.x + this.ball.radius >= this.canvas.width - wallThickness - margin) {
            this.ball.x = this.canvas.width - wallThickness - this.ball.radius - margin;
            this.ball.vx = -this.ball.vx * 0.95;
        }
        if (this.ball.y - this.ball.radius <= wallThickness + margin) {
            this.ball.y = wallThickness + this.ball.radius + margin;
            this.ball.vy = -this.ball.vy * 0.95; // Inverser et réduire la vitesse verticale
        }
        if (this.ball.y + this.ball.radius >= this.canvas.height - margin) {
            this.ball.y = this.canvas.height - this.ball.radius - margin;
            this.ball.vy = -this.ball.vy * 0.95;
        }

        // Collisions avec les joueurs
        for (const player of this.players) {
            const dx = this.ball.x - player.x;
            const dy = this.ball.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.ball.radius + player.radius) {
                // Si la balle touche un joueur, calcul de l'angle de collision
                const angle = Math.atan2(dy, dx);
                
                // Calcul de la vitesse après collision
                const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
                const newSpeed = speed * 1.05; // Augmente légèrement la vitesse

                // Appliquer la nouvelle direction et vitesse à la balle
                this.ball.vx = Math.cos(angle) * newSpeed;
                this.ball.vy = Math.sin(angle) * newSpeed;
                
                // Éviter que la balle reste coincée dans le joueur
                const overlap = (this.ball.radius + player.radius - distance) / 2;
                this.ball.x += Math.cos(angle) * overlap;
                this.ball.y += Math.sin(angle) * overlap;
            }
        }
    }
}