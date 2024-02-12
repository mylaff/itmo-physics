let lastGeneratedId = 0;

export function ensureValueInRange(value, min, max) {
    if (value < min) return min;
    else if (value > max) return max;
    else return value;
}

export function getRandomColorHSL(saturation, lightness) {
    return {
        h: Math.floor(Math.random() * 360), 
        s: saturation || Math.floor(Math.random() * 100), 
        l: lightness || Math.floor(Math.random() * 100)
    };
}

export function getRandomColorRGB({ minR = 0, maxR = 255, minG = 0, maxG = 255, minB = 0, maxB = 255 }) {
    function generateComponent(min, max) {
        return ensureValueInRange(Math.floor(Math.random() * 255), min, max);
    }

    return {r: generateComponent(minR, maxR), g: generateComponent(minG, maxG), b: generateComponent(minB, maxB)};
}

export function formatColorHSL({h, s, l}) {
    return `hsl(${h}deg ${s}% ${l}%)`;
}

export function formatColorRGB({r, g, b}) {
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function converHSLToRGB({h, s, l}) {
    h /= 360;
    s /= 100;
    l /= 100;

    let red, green, blue;

    if (s === 0) {
      red = green = blue = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      red = hue2rgb(p, q, h + 1 / 3);
      green = hue2rgb(p, q, h);
      blue = hue2rgb(p, q, h - 1 / 3);
    }

    return {r: red, g: green, b: blue}
}

export function generateId() {
    return ++lastGeneratedId;
}

export function roundToDigits(value, digits = 2) {
    return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
}