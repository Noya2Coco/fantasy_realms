import { MeshBuilder, Color3, StandardMaterial, Vector3, Quaternion, Axis } from "@babylonjs/core";

export class VelocityVector {
    constructor(scene, name = "velocityVector") {
        this.scene = scene;
        this.name = name;
        this.body = null; // Représente le corps du vecteur (cylindre)
        this.arrow = null; // Représente la pointe du vecteur (cône)

        // Matériau commun pour le vecteur
        this.material = new StandardMaterial(`${name}Material`, scene);
        this.material.emissiveColor = new Color3(1, 0, 1);
        this.material.disableLighting = true;
    }

    update(startPoint, velocity, damping) {
        console.log(`Start Point: ${startPoint}, Velocity: ${velocity}, Damping: ${damping}`);

        // Calculer la position future (endPoint) en simulant la décélération
        const velocityLength = velocity.length();
        const endPoint = startPoint.add(
            velocity.scale(velocityLength / (1 - damping)) // Position future en fonction de la vitesse et du damping
        );

        console.log(`Calculated End Point: ${endPoint}`);

        const direction = endPoint.subtract(startPoint);
        const length = direction.length();
        const normalizedDirection = direction.normalize();

        // Calculer la rotation pour aligner le vecteur avec la direction
        const up = new Vector3(0, 1, 0); // Axe par défaut pour les cylindres (Y)
        const axis = Vector3.Cross(up, normalizedDirection).normalize(); // Axe de rotation
        const angle = Math.acos(Vector3.Dot(up, normalizedDirection)); // Angle entre les deux vecteurs
        const rotationQuaternion = Quaternion.RotationAxis(axis, angle);

        // Mettre à jour ou recréer le corps du vecteur (cylindre)
        if (!this.body) {
            this.body = MeshBuilder.CreateCylinder(
                `${this.name}Body`,
                { height: 1, diameter: 0.1 }, // La hauteur sera ajustée via scaling
                this.scene
            );
            this.body.material = this.material;
            this.body.renderingGroupId = 2;
        }
        this.body.scaling.y = length; // Ajuster la hauteur
        this.body.position = startPoint.add(normalizedDirection.scale(length / 2)); // Positionner au milieu
        this.body.rotationQuaternion = rotationQuaternion; // Appliquer la rotation

        // Calculer la taille de l'arrow en fonction de la distance
        const arrowHeight = Math.min(0.3 + length * 0.05, 3); // Hauteur de l'arrow (limite max à 2)
        const arrowBaseDiameter = Math.min(0.1 + length * 0.020, 0.5); // Diamètre de la base (limite max à 0.5)

        // Mettre à jour ou recréer la pointe du vecteur (cône)
        if (!this.arrow) {
            this.arrow = MeshBuilder.CreateCylinder(
                `${this.name}Arrow`,
                { height: arrowHeight, diameterTop: 0, diameterBottom: arrowBaseDiameter },
                this.scene
            );
            this.arrow.material = this.material;
            this.arrow.renderingGroupId = 2;
        } else {
            this.arrow.scaling.y = arrowHeight / this.arrow.getBoundingInfo().boundingBox.extendSize.y * 2; // Ajuster la hauteur
            this.arrow.scaling.x = this.arrow.scaling.z = arrowBaseDiameter / this.arrow.getBoundingInfo().boundingBox.extendSize.x * 2; // Ajuster le diamètre
        }
        this.arrow.position = endPoint; // Positionner à la fin
        this.arrow.rotationQuaternion = rotationQuaternion; // Appliquer la rotation
    }

    dispose() {
        if (this.body) {
            this.body.dispose();
            this.body = null;
        }
        if (this.arrow) {
            this.arrow.dispose();
            this.arrow = null;
        }
    }
}
