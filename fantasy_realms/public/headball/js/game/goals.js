const { Bodies, Events } = Matter;

export class GoalsManager {
    constructor(engine, width, height) {
    // Dimensions de l'écran
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Conversion des dimensions en pourcentage de l'écran
    this.width = (width / screenWidth) * 100; // Largeur du terrain en pourcentage
    this.height = (height / screenHeight) * 100; // Hauteur du terrain en pourcentage

    this.goalWidth = (1500 / screenWidth) * 100; // Largeur des cages de but en pourcentage
    this.goalHeight = (1800 / screenHeight) * 100; // Hauteur des cages de but en pourcentage
    this.cageYOffset = (-3000 / screenHeight) * 100; // Décalage vertical des cages en pourcentage
    this.topBarHeight = (30 / screenHeight) * 100; // Hauteur des barres transversales en pourcentage

    this.leftGoalX = (1080 / screenWidth) * 100; // Position horizontale de la cage gauche en pourcentage
    this.rightGoalX = ((width+14000) / screenWidth) * 100; // Position horizontale de la cage droite en pourcentage

    this.engine = engine; // Stockage de l'engine pour les événements


        // Initialisation des cages de but et des images associées
        this.setupGoals(engine);
        this.positionGoalImages();
        this.setupCollisionEvents();
    }

    setupCollisionEvents() {
        Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                // Vérifier si l'un des corps est une TopBar
                if (bodyA.isTopBar || bodyB.isTopBar) {
                    const ball = bodyA.isTopBar ? bodyB : bodyA;
                    const topBar = bodyA.isTopBar ? bodyA : bodyB;
                    
                    // Calculer la direction de propulsion (vers la droite si la TopBar est à gauche, vers la gauche si elle est à droite)
                    const direction = topBar.position.x < this.width / 2 ? 1 : -1;
                    
                    // Appliquer une force horizontale à la balle
                    Matter.Body.applyForce(ball, ball.position, {
                        x: direction * 0.05, // Force horizontale
                        y: -0.02 // Légère force vers le haut
                    });
                }
            });
        });
    }

    setupGoals(engine) {
        // Création des capteurs pour détecter si un but est marqué
        const leftGoalSensor = Bodies.rectangle(
            this.leftGoalX,
            this.height - this.cageYOffset - this.goalHeight / 2,
            this.goalWidth,
            this.goalHeight,
            {
                isStatic: true,
                isSensor: true,
                collisionFilter: { group: -1 },
                render: { fillStyle: "green" }
            }
        );

        const rightGoalSensor = Bodies.rectangle(
            this.rightGoalX,
            this.height - this.cageYOffset - this.goalHeight / 2,
            this.goalWidth,
            this.goalHeight,
            {
                isStatic: true,
                isSensor: true,
                render: { fillStyle: "green" }
            }
        );

        // Création des barres de protection
        const leftTopBar = this.createTopBar(this.leftGoalX);
        const rightTopBar = this.createTopBar(this.rightGoalX);
        const leftVerticalBar = this.createVerticalBar(this.width - 50);
        const rightVerticalBar = this.createVerticalBar(this.width + 1150);
        
        // Ajout des nouvelles barres verticales de protection avec décalage
        const leftVerticalProtection = this.createVerticalProtectionBar(this.leftGoalX - this.goalWidth/2, true);
        const rightVerticalProtection = this.createVerticalProtectionBar(this.rightGoalX + this.goalWidth/2, false);

        // Ajout de tous les éléments au moteur physique
        engine.addToWorld([
            leftGoalSensor,
            rightGoalSensor,
            leftTopBar,
            rightTopBar,
            leftVerticalBar,
            rightVerticalBar,
            leftVerticalProtection,
            rightVerticalProtection
        ]);

        // Stockage des capteurs pour une utilisation ultérieure
        this.leftGoalSensor = leftGoalSensor;
        this.rightGoalSensor = rightGoalSensor;
    }

    createTopBar(x) {
        // Création d'une barre transversale au-dessus des cages
        const increasedGoalWidth = this.goalWidth * 1.1; // Légèrement plus large que la cage
        return Bodies.rectangle(
            x,
            this.height - this.cageYOffset - this.goalHeight / 2 - this.goalHeight / 2 - this.topBarHeight / 2,
            increasedGoalWidth,
            this.topBarHeight,
            {
                isStatic: true,
                isTopBar: true, // Marquer comme TopBar pour la détection
                friction: 0,
                render: {
                    fillStyle: "white",
                    strokeStyle: "transparent",
                    lineWidth: 1
                }
            }
        );
    }

    createVerticalBar(x) {
        // Création d'une barre verticale pour encadrer la cage
        return Bodies.rectangle(
            x,
            this.height - this.cageYOffset - this.goalHeight / 2,
            this.topBarHeight,
            this.goalHeight,
            {
                isStatic: true,
                render: {
                    fillStyle: "white",
                    strokeStyle: "transparent", // Pas de contour visible
                    lineWidth: 5
                }
            }
        );
    }

    createVerticalProtectionBar(x, isLeft) {
        // Création d'une barre verticale de protection qui monte jusqu'au plafond
        const barHeight = this.height - this.cageYOffset - this.goalHeight / 2 - this.goalHeight / 2 - this.topBarHeight / 2;
        
        // Décalage pour déplacer les barres vers l'intérieur
        const screenWidth = window.innerWidth;

        // Conversion du décalage en pourcentage
        const offsetPercentage = (110 / screenWidth) * 100;
        const offset = (offsetPercentage / 100) * screenWidth;
        const adjustedX = isLeft ? x + offset : x - offset;
        
        return Bodies.rectangle(
            adjustedX, // Appliquer le décalage selon la barre (gauche ou droite)
            barHeight / 2, // Position verticale au milieu de la hauteur
            this.topBarHeight, // Largeur de la barre
            barHeight, // Hauteur de la barre
            {
                isStatic: true,
                friction: 0,
                render: {
                    fillStyle: "white",
                    strokeStyle: "transparent",
                    lineWidth: 1
                }
            }
        );
    }
    
    
    

    positionGoalImages() {
        // Positionnement des images des cages de but
        const leftGoalImage = document.getElementById("leftGoalImage");
        const rightGoalImage = document.getElementById("rightGoalImage");

        leftGoalImage.style.left = `-2.5%`; // Positionnement en pixels
        leftGoalImage.style.top = `20.5%`;
        leftGoalImage.style.display = "block"; // Rendre visible

        rightGoalImage.style.left = `82%`; // Positionnement en pixels
        rightGoalImage.style.top = `20.5%`;
        rightGoalImage.style.display = "block"; // Rendre visible
    }

    checkGoal(ball, onGoal) {
        // Vérification si la balle entre dans une cage
        if (ball === this.leftGoalSensor) {
            onGoal('right'); // But dans la cage gauche, point pour l'équipe droite
        } else if (ball === this.rightGoalSensor) {
            onGoal('left'); // But dans la cage droite, point pour l'équipe gauche
        }
    }
}