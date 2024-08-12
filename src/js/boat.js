export class Boat {
    constructor(model) {
        this.model = model;
        this.weight = 1000; // Default weight
    }

    setWeight(newWeight) {
        this.weight = newWeight;
        // Update the boat's properties based on the weight
        this.model.scale.setScalar(Math.cbrt(newWeight / 1000)); // Scale based on weight
    }
}
