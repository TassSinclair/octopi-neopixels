const WebSocket = require('ws')

const five = {
    Board: class Board {
        on(event, callback) {
            callback()
        }
    }
}

const wss = new WebSocket.Server({
    port: 3001
});

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data)
        }
    })
};

const send = (event, data) => wss.broadcast(
    JSON.stringify({ event, data })
);

const pixel = {
    Strip: class Strip {
        constructor() {
            this.pixels = ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000']
        }
        _setAll(color) {
            this.pixels.forEach((_, pixel) => this._set(pixel, color));
        }
        _set(pixel, color) {
            this.pixels[pixel] = Array.isArray(color) ? `rgb(${color.join(',')})` : color
        }
        on(event, callback) {
            callback()
        }
        show() {
            send('update', this.pixels);
        }
        color(color) {
            this._setAll(color)
        }
        pixel(pixel) {
            return {
                color: (color) => this._set(pixel, color)
            }
        }
        get length() { return this.pixels.length }
    }
}

module.exports = {
    five,
    pixel,
}