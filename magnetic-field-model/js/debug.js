let isDebug = false;

export function setDebugFlag(value) {
    isDebug = value;
}

export function debug(...data) {
    if (isDebug) console.log(...data);
}

export function isDebugEnabled() {
    return isDebug;
}

export function debugCoordinate(coordinates, decimalSize = 2, enableParenthesis = true) {
    const x = coordinates.x.toFixed(decimalSize);
    const y = coordinates.y.toFixed(decimalSize);

    return enableParenthesis ? `(${x}, ${y})` : `${x}, ${y}`;
}