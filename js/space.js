export class Vector2D {
    constructor(dx, dy) {
        if (typeof dx !== "number" || typeof dy !== "number")
            throw new Error();

        this.dx = dx;
        this.dy = dy;
    }

    addVector(other) {
        return new Vector2D(this.dx + other.dx, this.dy + other.dy);
    }

    length() {
        return Math.sqrt(this.dx ** 2 + this.dy ** 2); 
    }

    getNormal(toLeft, normalize = true) {
        const normal = toLeft ? new Vector2D(-this.dy, this.dx) : new Vector2D(this.dy, -this.dx);

        if (normalize) normal.normalize();

        return normal;
    }

    normalize() {
        this.multiplyByScalar(1 / this.length())
        return this;
    }

    multiplyByScalar(multiplier) {
        this.dx *= multiplier;
        this.dy *= multiplier;
        return this;
    }

    getMultipliedByScalar(multiplier) {
        return new Vector2D(this.dx * multiplier, this.dy * multiplier);
    }

    scaleToSize(size) {
        return this.multiplyByScalar(size / this.length());
    }
}

export class Point2D {
    constructor(x, y) {
        if (typeof x !== "number" || typeof y !== "number")
            throw new Error();

        this.x = x;
        this.y = y;
    }

    addVector(vector) {
        return new Point2D(this.x + vector.dx, this.y + vector.dy);
    }

    subtractPoint(other) {
        return new Vector2D(this.x - other.x, this.y - other.y);
    }
}

export function getRandomPointInRectangle(topLeft, bottomRight) {
    const x = Math.random() * (bottomRight.x - topLeft.x) + topLeft.x;
    const y = Math.random() * (topLeft.y - bottomRight.y) + bottomRight.y;

    return { x: x, y: y };
}