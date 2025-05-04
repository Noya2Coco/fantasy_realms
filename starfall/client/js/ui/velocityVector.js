import { MeshBuilder, Color3, StandardMaterial, Vector3, Quaternion } from "@babylonjs/core";

export class VelocityVector {
    constructor(scene, name = "velocityVector") {
        this.scene = scene;
        this.name = name;
        this.body = null; // Cylinder representing the vector body
        this.arrow = null; // Cone representing the vector arrowhead

        // Shared material for the vector
        this.material = new StandardMaterial(`${name}Material`, scene);
        this.material.emissiveColor = new Color3(1, 0, 1);
        this.material.disableLighting = true;
    }

    update(startPoint, velocity, damping) {
        // Calculate the future position (endPoint) considering deceleration
        const velocityLength = velocity.length();
        const endPoint = startPoint.add(
            velocity.scale(velocityLength / (1 - damping))
        );

        const direction = endPoint.subtract(startPoint);
        const length = direction.length();
        const normalizedDirection = direction.normalize();

        // Compute rotation to align the vector with the direction
        const up = new Vector3(0, 1, 0); // Default cylinder axis (Y)
        const axis = Vector3.Cross(up, normalizedDirection).normalize();
        const angle = Math.acos(Vector3.Dot(up, normalizedDirection));
        const rotationQuaternion = Quaternion.RotationAxis(axis, angle);

        // Update or create the vector body (cylinder)
        if (!this.body) {
            this.body = MeshBuilder.CreateCylinder(
                `${this.name}Body`,
                { height: 1, diameter: 0.1 },
                this.scene
            );
            this.body.material = this.material;
            this.body.renderingGroupId = 2;
        }
        this.body.scaling.y = length; // Adjust height
        this.body.position = startPoint.add(normalizedDirection.scale(length / 2)); // Position at the midpoint
        this.body.rotationQuaternion = rotationQuaternion;

        // Calculate arrowhead size based on vector length
        const arrowHeight = Math.min(0.3 + length * 0.05, 3);
        const arrowBaseDiameter = Math.min(0.1 + length * 0.020, 0.5);

        // Update or create the vector arrowhead (cone)
        if (!this.arrow) {
            this.arrow = MeshBuilder.CreateCylinder(
                `${this.name}Arrow`,
                { height: arrowHeight, diameterTop: 0, diameterBottom: arrowBaseDiameter },
                this.scene
            );
            this.arrow.material = this.material;
            this.arrow.renderingGroupId = 2;
        } else {
            this.arrow.scaling.y = arrowHeight / this.arrow.getBoundingInfo().boundingBox.extendSize.y * 2;
            this.arrow.scaling.x = this.arrow.scaling.z = arrowBaseDiameter / this.arrow.getBoundingInfo().boundingBox.extendSize.x * 2;
        }
        this.arrow.position = endPoint; // Position at the endpoint
        this.arrow.rotationQuaternion = rotationQuaternion;
    }

    dispose() {
        // Dispose of vector components
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
