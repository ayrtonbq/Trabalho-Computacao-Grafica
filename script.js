document.addEventListener('DOMContentLoaded', () => {
    const rgbR = document.getElementById('rgbR');
    const rgbG = document.getElementById('rgbG');
    const rgbB = document.getElementById('rgbB');
    const rgbRValue = document.getElementById('rgbRValue');
    const rgbGValue = document.getElementById('rgbGValue');
    const rgbBValue = document.getElementById('rgbBValue');
    const colorDisplay = document.getElementById('colorDisplay');

    const hue = document.getElementById('hue');
    const saturation = document.getElementById('saturation');
    const value = document.getElementById('value');
    const hueValue = document.getElementById('hueValue');
    const saturationValue = document.getElementById('saturationValue');
    const valueValue = document.getElementById('valueValue');

    const cmyC = document.getElementById('cmyC');
    const cmyM = document.getElementById('cmyM');
    const cmyY = document.getElementById('cmyY');
    const cmyK = document.getElementById('cmyK');
    const cmyCValue = document.getElementById('cmyCValue');
    const cmyMValue = document.getElementById('cmyMValue');
    const cmyYValue = document.getElementById('cmyYValue');
    const cmyKValue = document.getElementById('cmyKValue');

    const saturationFilter = document.getElementById('saturationFilter');
    const valueFilter = document.getElementById('valueFilter');
    const saturationFilterValue = document.getElementById('saturationFilterValue');
    const valueFilterValue = document.getElementById('valueFilterValue');
    const imageInput = document.getElementById('imageInput');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');

    function rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, v = max;

        const d = max - min;
        s = max === 0 ? 0 : d / max;

        if (max === min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
    }

    function rgbToCmyk(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const k = 1 - Math.max(r, g, b);
        const c = (1 - r - k) / (1 - k) || 0;
        const m = (1 - g - k) / (1 - k) || 0;
        const y = (1 - b - k) / (1 - k) || 0;

        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    }

    function updateColorDisplay() {
        const r = parseInt(rgbR.value);
        const g = parseInt(rgbG.value);
        const b = parseInt(rgbB.value);
        rgbRValue.textContent = r;
        rgbGValue.textContent = g;
        rgbBValue.textContent = b;

        colorDisplay.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

        const { h, s, v } = rgbToHsv(r, g, b);
        hue.value = h;
        saturation.value = s;
        value.value = v;
        hueValue.textContent = h;
        saturationValue.textContent = s;
        valueValue.textContent = v;

        const { c, m, y, k } = rgbToCmyk(r, g, b);
        cmyC.value = c;
        cmyM.value = m;
        cmyY.value = y;
        cmyK.value = k;
        cmyCValue.textContent = c;
        cmyMValue.textContent = m;
        cmyYValue.textContent = y;
        cmyKValue.textContent = k;
    }

    function updateColorConversions() {
        const h = parseInt(hue.value);
        const s = parseInt(saturation.value) / 100;
        const v = parseInt(value.value) / 100;

        const c = (1 - s) * v;
        const m = (1 - ((v - c) / (1 - c)));
        const y = (1 - ((v - c) / (1 - c)));

        const r = v;
        const g = m;
        const b = y;

        const { r: rgbRVal, g: rgbGVal, b: rgbBVal } = hsvToRgb(h, s, v);
        colorDisplay.style.backgroundColor = `rgb(${Math.round(rgbRVal)}, ${Math.round(rgbGVal)}, ${Math.round(rgbBVal)})`;

        const { c: cmyCVal, m: cmyMVal, y: cmyYVal, k: cmyKVal } = rgbToCmyk(Math.round(rgbRVal), Math.round(rgbGVal), Math.round(rgbBVal));
        cmyC.value = cmyCVal;
        cmyM.value = cmyMVal;
        cmyY.value = cmyYVal;
        cmyK.value = cmyKVal;
        cmyCValue.textContent = cmyCVal;
        cmyMValue.textContent = cmyMVal;
        cmyYValue.textContent = cmyYVal;
        cmyKValue.textContent = cmyKVal;
    }

    function updateFilter() {
        if (imageCanvas) {
            const image = new Image();
            image.src = imageInput.files[0] ? URL.createObjectURL(imageInput.files[0]) : '';

            image.onload = function() {
                ctx.drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);

                const imgData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
                const data = imgData.data;

                const sFactor = parseFloat(saturationFilter.value);
                const vFactor = parseFloat(valueFilter.value);

                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i];
                    let g = data[i + 1];
                    let b = data[i + 2];

                    let hsv = rgbToHsv(r, g, b);

                    hsv.s *= sFactor;
                    hsv.v *= vFactor;

                    let rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
                    data[i] = rgb.r;
                    data[i + 1] = rgb.g;
                    data[i + 2] = rgb.b;
                }

                ctx.putImageData(imgData, 0, 0);
            }
        }
    }

    function hsvToRgb(h, s, v) {
        h /= 360;
        s /= 100;
        v /= 100;

        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        const mod = i % 6;

        let r, g, b;
        switch (mod) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    rgbR.addEventListener('input', updateColorDisplay);
    rgbG.addEventListener('input', updateColorDisplay);
    rgbB.addEventListener('input', updateColorDisplay);

    hue.addEventListener('input', updateColorConversions);
    saturation.addEventListener('input', updateColorConversions);
    value.addEventListener('input', updateColorConversions);

    saturationFilter.addEventListener('input', () => {
        saturationFilterValue.textContent = saturationFilter.value;
        updateFilter();
    });
    valueFilter.addEventListener('input', () => {
        valueFilterValue.textContent = valueFilter.value;
        updateFilter();
    });

    imageInput.addEventListener('change', updateFilter);

    updateColorDisplay();
});
