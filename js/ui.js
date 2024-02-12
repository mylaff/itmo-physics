import { Conductor } from "./conductor.js";
import { Point2D } from "./space.js";

export function parseConductorFromElement(element) {
    const amperageElement = element.querySelector('.amperage-row input');
    const [xElement, yElement] = element.querySelectorAll('.coordinates-row input');
    const colorElement = element.querySelector('input[type="color"]');

    return new Conductor(
        parseInt(element.dataset.id),
        new Point2D(
            parseFloat(xElement.value), 
            parseFloat(yElement.value)
        ),  
        parseFloat(amperageElement.value),
        colorElement.value
    );
}

function setAttributes(element, attributes) {
    for (var key in attributes)
        element.setAttribute(key, attributes[key]);
}

function renderConductorHTMLControlsInput(attributes) {
    const inputBorderElement = document.createElement('div');
    const inputElement = document.createElement('input');

    setAttributes(inputElement, attributes);
    inputBorderElement.appendChild(inputElement);
    inputBorderElement.classList.add('input-border');

    return inputBorderElement;
}

export function renderConductorHTMLControls(conductor, updateFunction, removeFunction) {
    const amperageElement = renderConductorHTMLControlsInput({'type': 'number', 'step': '0.1', 'placeholder': 'Сила тока', 'value': conductor.amperage});
    const xElement = renderConductorHTMLControlsInput({'type': 'number', 'step': '0.01', 'placeholder': 'X', 'value': conductor.center.x});
    const yElement = renderConductorHTMLControlsInput({'type': 'number', 'step': '0.01', 'placeholder': 'Y', 'value': conductor.center.y});

    const conductorControlElement = document.createElement('div');
    conductorControlElement.classList.add('conductor');
    conductorControlElement.setAttribute('data-id', conductor.id);

    const amperageRow = document.createElement('div');
    amperageRow.classList.add('amperage-row');
    amperageRow.appendChild(amperageElement);

    const coordinatesRow = document.createElement('div');
    coordinatesRow.classList.add('coordinates-row');
    coordinatesRow.appendChild(xElement);
    coordinatesRow.appendChild(yElement);

    const colorRow = document.createElement('div');
    colorRow.classList.add('color-row');
    colorRow.appendChild(renderConductorHTMLControlsInput({'type': 'color', 'value': conductor.color}));

    const closeButton = document.createElement('div');
    closeButton.classList.add('close');
    closeButton.onclick = () => removeFunction(conductor.id);

    conductorControlElement.appendChild(amperageRow);
    conductorControlElement.appendChild(coordinatesRow);
    conductorControlElement.appendChild(closeButton);
    conductorControlElement.appendChild(colorRow);

    Array.from(conductorControlElement.getElementsByTagName('input')).forEach(e => e.onchange = () => updateFunction(conductor.id));

    return conductorControlElement;
}

export function renderConductorList(condcutors, updateFunction, removeFunction) {
    document.getElementById('conductor-list').replaceChildren(...condcutors.get().map(c => renderConductorHTMLControls(c, updateFunction, removeFunction)));
}