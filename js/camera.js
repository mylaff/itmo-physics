import { Point2D, Vector2D } from "./space.js";

export class Camera {
    constructor(context, center = new Point2D(0, 0), zoomMultiplier = 1) {
        this.center = center;
        this.context = context;

        this.setZoomMultiplier(zoomMultiplier);
    }

    moveByVector(vector) {
        this.center = this.center.addVector(vector);
    }

    resetPosition() {
        this.center = new Point2D(0, 0);
    }

    getZoom() {
        return this.zoomMultiplier;
    }

    setZoomMultiplier(zoomMultiplier) {
        if (zoomMultiplier < 0) return;

        this.zoomMultiplier = zoomMultiplier;
    }

    worldToCameraSpace(point) {
        return new Point2D(
            (point.x - this.center.x) * this.getZoom(),
            (point.y - this.center.y) * this.getZoom()
        );
    }

    cameraToScreenSpace(point) {
        return new Point2D(
            (point.x + 1) * this.context.canvas.width / 2,
            this.context.canvas.height - (point.y + 1) * this.context.canvas.height / 2
        );
    }

    worldToScreenSpace(point) {
        return new Point2D(
            ((point.x - this.center.x) * this.getZoom() + 1) * this.context.canvas.width / 2,
            this.context.canvas.height - ((point.y - this.center.y) * this.getZoom() + 1) * this.context.canvas.height / 2
        );
    }

    screenSpaceToWorld(point) {
        return new Point2D(
            (2 * point.x / this.context.canvas.width - 1) / this.getZoom() + this.center.x,
            - (2 * (point.y - this.context.canvas.height) / this.context.canvas.height + 1) / this.getZoom() + this.center.y
        );
    }

    isPointVisible(point) {
        const screenCoordinates = this.worldToScreenSpace(point);

        return (
            screenCoordinates.x < 0 || screenCoordinates.x > this.context.canvas.width ||
            screenCoordinates.y < 0 || screenCoordinates.y > this.context.canvas.height
        );
    }

    getVisibleRectangle() {
        const cameraWidth = (1 / this.getZoom());
        const cameraHeight = (1 / this.getZoom());

        return [
            this.center.addVector(new Vector2D(-cameraWidth, cameraHeight)),
            this.center.addVector(new Vector2D(cameraWidth, -cameraHeight))
        ];
    }
}
