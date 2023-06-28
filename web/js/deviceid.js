function getDeviceId() {
    const cyrb53 = (str, seed = 0) => {
        let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for(let i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
        h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
        h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    };

    var CANVAS_TEXT = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz 1234567890 !@#$%^&*()_-+=";
    var CANVAS_FONT_SIZE = 16;
    var CANVAS_FONT_FACE = 'Arial';

    var canvas = document.createElement('canvas');
    var width = CANVAS_FONT_SIZE * (CANVAS_TEXT.length + 2);
    var height = CANVAS_FONT_SIZE * 2;
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    var ctx = canvas.getContext('2d');

    ctx.font = CANVAS_FONT_SIZE + 'px \'' + CANVAS_FONT_FACE + '\'';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillStyle = "#f60";
    ctx.fillRect(((3 * width) / 8), 0, width / 4, height);

    ctx.fillStyle = "#069";
    ctx.fillText(CANVAS_TEXT, width / 2, height / 2);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(CANVAS_TEXT, (width / 2) + 2, (height / 2) + 2);

    var base64png = canvas.toDataURL('image/png');
    return cyrb53(base64png).toString(16);
}