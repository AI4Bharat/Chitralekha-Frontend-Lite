import { isPlaying } from '../utils';

function matrixCallback(callback) {
    try {
        const result = [];
        const x = 10;
        const y = 5;
        for (let xIndex = 0; xIndex < x; xIndex += 1) {
            for (let yIndex = 0; yIndex < y; yIndex += 1) {
                if (xIndex === 0 || xIndex === x - 1 || yIndex === 0 || yIndex === y - 1) {
                    // console.log(xIndex, yIndex);
                    result.push(callback(xIndex, yIndex, x, y));
                }
            }
        }
        // console.log('Result is ', result);
        return result;
    } catch (e) {
        console.log(e);
    }
}

function getColors($canvas, $video, width, height) {
    try {
        const ctx = $canvas.getContext('2d');
        $canvas.width = width;
        $canvas.height = height;
        ctx.drawImage($video, 0, 0);
        return matrixCallback((xIndex, yIndex, x, y) => {
            const itemW = width / x;
            const itemH = height / y;
            const itemX = xIndex * itemW;
            const itemY = yIndex * itemH;
            if (itemW < 1 || itemH < 1) return { r: 0, g: 0, b: 0 };
            const { data } = ctx.getImageData(itemX, itemY, itemW, itemH);
            console.log(data);
            let r = 0;
            let g = 0;
            let b = 0;
            for (let i = 0, l = data.length; i < l; i += 4) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
            }
            r = Math.floor(r / (data.length / 4));
            g = Math.floor(g / (data.length / 4));
            b = Math.floor(b / (data.length / 4));
            return { r, g, b };
        });
    } catch (e) {
        console.log(e);
    }
}

function creatMatrix(parent) {
    try {
        return matrixCallback((xIndex, yIndex, x, y) => {
            const $box = document.createElement('div');
            $box.style.position = 'absolute';
            $box.style.left = `${(xIndex * 100) / x}%`;
            $box.style.top = `${(yIndex * 100) / y}%`;
            $box.style.width = `${100 / x}%`;
            $box.style.height = `${100 / y}%`;
            $box.style.borderRadius = '50%';
            $box.style.transition = 'all .2s ease';
            parent.appendChild($box);
            return {
                $box,
                left: xIndex === 0,
                right: xIndex === x - 1,
                top: yIndex === 0,
                bottom: yIndex === y - 1,
            };
        });
    } catch (e) {
        console.log(e);
    }
}

function setStyle(element, key, value) {
    try {
        element.style[key] = value;
        return element;
    } catch (e) {
        console.log(e);
    }
}

function setStyles(element, styles) {
    try {
        Object.keys(styles).forEach((key) => {
            setStyle(element, key, styles[key]);
        });
        return element;
    } catch (e) {
        console.log(e);
    }
}

export default function backlight($player, $video) {
    try {
        const $backlight = document.createElement('div');
        $backlight.classList.add('backlight');
        setStyles($backlight, {
            position: 'absolute',
            zIndex: 9,
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
        });

        const matrix = creatMatrix($backlight);
        const $canvas = document.createElement('canvas');
        $player.insertBefore($backlight, $video);

        function run() {
            const { clientWidth, clientHeight } = $video;
            const colors = getColors($canvas, $video, clientWidth, clientHeight);
            if (colors) {
                colors.forEach(({ r, g, b }, index) => {
                    const { $box, left, right, top, bottom } = matrix[index];
                    const x = left ? '-64px' : right ? '64px' : '0';
                    const y = top ? '-64px' : bottom ? '64px' : '0';
                    $box.style.boxShadow = `rgb(${r}, ${g}, ${b}) ${x} ${y} 128px`;
                });
            }
        }

        $video.addEventListener('seeked', run);
        $video.addEventListener('loadedmetadata', () => setTimeout(run, 1000));

        (function loop() {
            window.requestAnimationFrame(() => {
                if (isPlaying($video)) {
                    run();
                }
                loop();
            });
        })();
    } catch (e) {
        console.log(e);
    }
}
