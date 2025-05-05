const { Bodies, Body } = Matter;

export class Ball {
    constructor(engine, width, height) {
        // Définir la position initiale de la balle au centre de l'écran
        this.startPosition = { x: width / 2, y: height / 2 };

        // Créer un corps circulaire représentant la balle avec des propriétés physiques
        this.body = Bodies.circle(width / 2, height / 2, 20, {
            restitution: 0.8, // Rend la balle rebondissante
            frictionAir: 0.01, // Ajoute une légère résistance de l'air
            render: { 
                sprite: {
                    texture: "../assets/ball.png", // Image utilisée pour la balle
                    xScale: 0.15, // Échelle horizontale de l'image
                    yScale: 0.15  // Échelle verticale de l'image
                }
            },
            collisionFilter: {
                group: 1 // Définit le groupe de collision de la balle
            }
        });

        // Ajouter la balle au moteur physique
        engine.addToWorld(this.body);
    }

    reset() {
        // Réinitialiser la position et la vitesse de la balle
        Body.setVelocity(this.body, { x: 0, y: 0 }); // Arrêter la balle
        Body.setPosition(this.body, this.startPosition); // Ramener la balle à sa position de départ
    }

    kick(force, direction) {
        // Ajouter une force à la balle pour la déplacer
        const currentVelocity = this.body.velocity; // Obtenir la vitesse actuelle
        Body.setVelocity(this.body, {
            x: currentVelocity.x + (direction * force), // Ajouter la force dans la direction horizontale
            y: currentVelocity.y - (force * 0.5) // Ajouter une force verticale
        });
    }
}