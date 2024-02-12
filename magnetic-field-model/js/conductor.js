import { Point2D, getRandomPointInRectangle } from "./space.js";
import { formatColorRGB, converHSLToRGB, getRandomColorHSL, generateId, roundToDigits } from "./utils.js"

export class Conductor {
    constructor(id, center, amperage, color) {
        this.id = id;
        this.center = center;
        this.amperage = amperage;

        this.color = color || formatColorRGB(converHSLToRGB(getRandomColorHSL()));
    }

    calculateInductionVectorInPoint(point, magneticPenetration = 1.0) {
        const magneticConstant = 4 * Math.PI * 10 ** -7;
        const radiusVector = point.subtractPoint(this.center);
        const inductionModule = (magneticConstant * magneticPenetration / (4 * Math.PI)) * (2 * this.amperage / radiusVector.length());
        // Инверсия для поправки на направление оси Z
        const inductionVector = radiusVector.getNormal().scaleToSize(-inductionModule);

        return inductionVector;
    }
}

export function createRandomConductor(positionBounds) {
    const amperageLower = -100;
    const amperageUpper = 100;

    const id = generateId();
    const center = getRandomPointInRectangle(...positionBounds);
    const amperage = roundToDigits(Math.random() * (amperageUpper - amperageLower) + amperageLower, 2);

    center.x = roundToDigits(center.x, 2);
    center.y = roundToDigits(center.y, 2);

    return new Conductor(id, center, amperage);
}

export class ConductorArray {
    constructor(initial) {
        if (initial !== undefined) {
            this.array = Array.isArray(initial) ? [...initial] : [initial];
        } else {
            this.array = [];
        }
    }

    addConductor(conductor) {
        this.array.push(conductor);
    }

    removeConductorById(id) {
        this.array = this.array.filter(c => c.id != id);
    }

    getConductorById(id) {
        return this.array.find(c => c.id == id);
    }

    get() {
        return this.array;
    }

    calculateTotalInductionVectorInPoint(point, magneticPenetration = 1.0) {
        return this.array
            .map(c => c.calculateInductionVectorInPoint(point, magneticPenetration))
            .reduce((accumulator, induction) => accumulator.addVector(induction));
    }
}

export function calculateInductionMatrix(conductors, width, height, magneticPenetration = 1.0) {
    const matrix = Array(height).fill().map(() => Array(width).fill());

    for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++)
            matrix[y][x] = conductors.calculateTotalInductionVectorInPoint(new Point2D(1 / width * x, 1 / height * y), magneticPenetration);

    return matrix;
}

export function calculateInductionMatrixForRegion(conductors, region, width, height, magneticPenetration = 1.0) {
    const [ topLeft, bottomRight ] = region;
    const matrix = Array(height).fill().map(() => Array(width).fill());

    const horizontalDelta = Math.abs(topLeft.x - bottomRight.x) / width;
    const verticalDelta = Math.abs(topLeft.y - bottomRight.y) / height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pointOfInduction = new Point2D(topLeft.x + horizontalDelta * x, topLeft.y - verticalDelta * y);

            matrix[y][x] = { 
                point: pointOfInduction, 
                vector: conductors.calculateTotalInductionVectorInPoint(pointOfInduction, magneticPenetration)
            };
        }
    }

    return matrix;
}