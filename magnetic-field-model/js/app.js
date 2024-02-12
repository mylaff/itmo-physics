import { Camera } from "./camera.js";
import { ConductorArray, createRandomConductor, calculateInductionMatrixForRegion } from "./conductor.js";
import { CircleDrawable, ConductorDrawable, RectangleDrawable, TriangleDrawable, VectorDrawable, clearCanvas } from "./drawing.js";
import { Point2D, Vector2D } from "./space.js";
import { renderConductorList, parseConductorFromElement } from "./ui.js";

let canvas;
let inductionValueInPointElement;

let context;
let camera;
let conductors = new ConductorArray();

let debugOptions = {
    showWorldRectangle: false,
    showCameraRectangle: false
};

let displayOptions = {
    baseFieldVectorLengthMultiplier: 1000,
    fieldInPointVectorLengthMultiplier: 1000,
    exponentialFractionDigits: 3
}

function renderCameraVisibleRectangle(camera) {
    (new RectangleDrawable(...camera.getVisibleRectangle())).draw(camera, {strokeStyle: "yellow"});
}

function renderWorldRectangle(camera) {
    (new RectangleDrawable(new Point2D(-1, 1), new Point2D(1, -1))).draw(camera);
}

function renderMatrix(camera, matrix, width, height) {
    const vectorLengthMultiplier = displayOptions.baseFieldVectorLengthMultiplier;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const { point, vector } = matrix[y][x];
            const vectorDrawable = new VectorDrawable(point, vector, vectorLengthMultiplier);

            vectorDrawable.draw(camera, {});
        }
    }
}

function getMatrixFittingScreen() {
    const resolution = Math.round(40 / camera.getZoom());
    const region = camera.getVisibleRectangle();
    const matrix = calculateInductionMatrixForRegion(conductors, region, resolution, resolution);

    return [resolution, resolution, matrix];
}

function render() {
    clearCanvas(context);

    const [matrixWidth, matrixHeight, matrix] = getMatrixFittingScreen();
    renderMatrix(camera, matrix, matrixWidth, matrixHeight);

    for (const conductor of conductors.get()) {
        const conductorDrawable = new ConductorDrawable(conductor);

        conductorDrawable.draw(camera);
    }

    if (debugOptions.showWorldRectangle) renderWorldRectangle(camera);
    if (debugOptions.showCameraRectangle) renderCameraVisibleRectangle(camera);
}

function resizeCanvasToScreen() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function initializeCanvas() {
    if (context !== undefined) return;

    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    camera = new Camera(context);

    resizeCanvasToScreen();

    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('resize', () => {
        resizeCanvasToScreen();
        render();
    });
}

function initializeAppControlBindings() {
    const zoomIn = () => camera.setZoomMultiplier(camera.zoomMultiplier + 0.1);
    const zoomOut = () => camera.setZoomMultiplier(camera.zoomMultiplier - 0.1);

    document.addEventListener('wheel', (e) => {
        if (Math.sign(e.deltaY) < 0) zoomIn();
        else zoomOut();

        render();
    })
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case 'KeyW':
                camera.moveByVector(new Vector2D(0.0, 0.1));
                render();
                break;
            case 'KeyS':
                camera.moveByVector(new Vector2D(0.0, -0.1));
                render();
                break;
            case 'KeyA':
                camera.moveByVector(new Vector2D(-0.1, 0.0));
                render();
                break;
            case 'KeyD':
                camera.moveByVector(new Vector2D(0.1, 0.0));
                render();
                break;
            case 'Space':
                camera.resetPosition();
                render();
                break;
        }
    })
}

function initializeHTMLControls() {
    inductionValueInPointElement = document.getElementById('induction-value');
    const addControlsButton = document.getElementById('add-button');

    addControlsButton.addEventListener('click', handleAddButtonClick);
}

function handleCanvasClick(event) {
    const translated = camera.screenSpaceToWorld(new Point2D(event.pageX, event.pageY));

    for (const conductor of conductors.get()) {
        const vectorLengthMultiplier = displayOptions.fieldInPointVectorLengthMultiplier;
        const inductionVector = conductor.calculateInductionVectorInPoint(translated);

        const vectorDrawable = new VectorDrawable(translated, inductionVector, vectorLengthMultiplier);

        vectorDrawable.draw(camera, {strokeStyle: conductor.color, fillStyle: conductor.color});
    }

    const totalInductionVectorInPoint = conductors.calculateTotalInductionVectorInPoint(translated);

    inductionValueInPointElement.innerText = totalInductionVectorInPoint.length().toExponential(displayOptions.exponentialFractionDigits);  
}

function handleAddButtonClick(event) {
    conductors.addConductor(createRandomConductor(camera.getVisibleRectangle()));
    renderConductorList(conductors, handleConductorUpdate, handleConductorRemoveClick);

    render();
}

function handleConductorRemoveClick(id) {
    if (conductors.get().length == 1) return;

    removeConductorById(id);
    renderConductorList(conductors, handleConductorUpdate, handleConductorRemoveClick);

    render();
}

function handleConductorUpdate(id) {
    const controlsElement = document.querySelector(`[data-id="${id}"]`);
    const parsed = parseConductorFromElement(controlsElement);
    const conductor = conductors.getConductorById(id);

    Object.assign(conductor, parsed);

    render();
}

window.onload = function () {
    initializeCanvas();
    initializeHTMLControls();
    initializeAppControlBindings();
    
    conductors.addConductor(createRandomConductor(camera.getVisibleRectangle()));

    renderConductorList(conductors, handleConductorUpdate, handleConductorRemoveClick);
    render();
}