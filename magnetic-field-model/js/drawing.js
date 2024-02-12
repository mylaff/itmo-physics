import { Vector2D } from "./space.js";

export class Drawable {
    adjustForZoom(value, camera, options) {
        if (options?.noZoomAdjustment)
            return value;
        return camera.getZoom() * value;
    }
    
    deducePointPosition(point, camera, options) {
        if (options?.noConvert)
            return point;
        return camera.worldToScreenSpace(point);
    }

    draw(camera, options) {}
}

export class CircleDrawable extends Drawable {
    constructor(center, radius) {
        super();

        this.center = center;
        this.radius = radius;
    }

    draw(camera, options) {
        const drawingCenter = this.deducePointPosition(this.center, camera, options);
        const drawingRadius = this.adjustForZoom(this.radius, camera, options);

        camera.context.beginPath();
        camera.context.arc(drawingCenter.x, drawingCenter.y, drawingRadius, 0, Math.PI * 2);
        camera.context.closePath();

        camera.context.lineWidth = options?.lineWidth || 2;
        camera.context.strokeStyle = options?.strokeStyle || "black";
        camera.context.fillStyle = options?.fillStyle || "black";

        camera.context.fill();
        camera.context.stroke();
    }
}

export class LineDrawable extends Drawable {
    constructor(start, end, width = 2) {
        super();

        this.start = start;
        this.end = end;
        this.width = width;
    }

    draw(camera, options) {
        const start = this.deducePointPosition(this.start, camera, options);
        const end = this.deducePointPosition(this.end, camera, options);

        camera.context.beginPath();
        camera.context.moveTo(start.x, start.y);
        camera.context.lineTo(end.x, end.y);

        camera.context.lineWidth = this.width * camera.getZoom();
        camera.context.strokeStyle = options?.strokeStyle || "black";

        camera.context.stroke();
    }
}

export class TriangleDrawable extends Drawable {
    constructor(center, angle, size) {
        super();

        this.center = center;
        this.angle = angle + Math.PI;
        this.size = size;
    }

    draw(camera, options) {
        const center = this.deducePointPosition(this.center, camera, options);
        const size = this.adjustForZoom(this.size, camera, options);

        const a = {
            x: center.x - size * Math.cos(this.angle),
            y: center.y - size * Math.sin(this.angle)
        };
        const b = {
            x: center.x - size * Math.cos(this.angle + 2 * Math.PI / 3),
            y: center.y - size * Math.sin(this.angle + 2 * Math.PI / 3),
        };
        const c = {
            x: center.x - size * Math.cos(this.angle - 2 * Math.PI / 3),
            y: center.y - size * Math.sin(this.angle - 2 * Math.PI / 3)
        };
    
        camera.context.beginPath();
        camera.context.moveTo(a.x, a.y);
        camera.context.lineTo(b.x, b.y);
        camera.context.lineTo(c.x, c.y);
        camera.context.lineTo(a.x, a.y);

        camera.context.fillStyle = options?.fillStyle || "black";
        
        camera.context.fill();
    
        if (options?.enableVertexDebug) {
            console.log(`Calculated theta deviation: ${this.angle}`);

            const baseOptions = { noConvert: true, lineWidth: 0 };

            (new CircleDrawable(a, 2)).draw(camera, {...baseOptions, fillStyle: "green"});
            (new CircleDrawable(b, 2)).draw(camera, {...baseOptions, fillStyle: "yellow"});
            (new CircleDrawable(c, 2)).draw(camera, {...baseOptions, fillStyle: "blue"});
            (new CircleDrawable(center, 2)).draw(camera, {...baseOptions, fillStyle: "red"});
       }
    }
}

export class RectangleDrawable extends Drawable {
    constructor(topLeft, bottomRight) {
        super();

        this.topLeft = topLeft;
        this.bottomRight = bottomRight;
    }

    draw(camera, options) {
        const topLeft = this.deducePointPosition(this.topLeft, camera, options);
        const bottomRight = this.deducePointPosition(this.bottomRight, camera, options);
        const rectangleSize = bottomRight.subtractPoint(topLeft);

        camera.context.beginPath();
        camera.context.rect(topLeft.x, topLeft.y, rectangleSize.dx, rectangleSize.dy);

        camera.context.lineWidth = options?.lineWidth || "6";
        camera.context.strokeStyle = options?.strokeStyle || "red";

        camera.context.stroke();
    }
}

export class VectorDrawable extends Drawable{
    constructor(start, vector, vectorMultiplier = 1.0) {
        super();

        this.start = start;
        this.vector = vector;
        this.vectorMultiplier = vectorMultiplier;
    }

    draw(camera, options) {
        const vectorToEnd = this.vector.getMultipliedByScalar(this.vectorMultiplier)
        const start = camera.worldToScreenSpace(this.start);
        const end = camera.worldToScreenSpace(this.start.addVector(vectorToEnd));
        
        // Дальнейший код нужен для корректного определния угла носика вектора
        // Можно было пытаться использовать Math.atan world-координатного вектора и множить на искажение
        // ... но зачем?
        const vectorScreenSpace = end.subtractPoint(start);
        
        const triangleSize = 4;
        const vectorAngle = Math.atan2(vectorScreenSpace.dy, vectorScreenSpace.dx);
        const normalizedVectorAngle = vectorAngle < 0 ? 2 * Math.PI + vectorAngle : vectorAngle;

        (new LineDrawable(start, end)).draw(camera, { noConvert: true, ...options});
        (new TriangleDrawable(end, normalizedVectorAngle, triangleSize)).draw(camera, { noConvert: true, ...options});
    }
}

export class ConductorLabelDrawable extends Drawable {
    constructor(conductor) {
        super();

        this.conductor = conductor;
    }

    deduceDrawingPosition(camera, options) {
        const conductorCenterScreenSpace = camera.worldToScreenSpace(this.conductor.center);
        const drawingPosition = conductorCenterScreenSpace.addVector(options?.prefferedOffset || new Vector2D(0, 40 * camera.getZoom()));

        return drawingPosition;
    }

    draw(camera, options) {
        const drawingPosition = this.deduceDrawingPosition(camera, options);

        camera.context.font = options?.font || "14 Arial";
        camera.context.textAlign = options?.textAlign || "center";
        camera.context.fillStyle = options?.fillStyle || "black";

        camera.context.fillText(this.conductor.amperage.toFixed(2), drawingPosition.x, drawingPosition.y);
    }
}

export class ConductorDrawable extends Drawable {
    constructor(conductor) {
        super();

        this.conductor = conductor;
    }

    draw(camera, options) {
        const circleRadius = 10;

        (new CircleDrawable(this.conductor.center, circleRadius)).draw(camera, { ...options, fillStyle: this.conductor.color });
        if (this.conductor.amperage > 0)
            (new CircleDrawable(this.conductor.center, (circleRadius / 4))).draw(camera, options);
        (new ConductorLabelDrawable(this.conductor)).draw(camera, options);
    }
}

export function clearCanvas(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}
