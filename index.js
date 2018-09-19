const shouldMockBoard = () => process.env.BOARD === 'mock'

var five = shouldMockBoard ? require('./mocks').five : require('johnny-five');
var pixel = shouldMockBoard ? require('./mocks').pixel : require('node-pixel');
var chalk = require('chalk');
var config = require('./config');
var octopi = require('./octopi');

var opts = {};
opts.port = process.argv[2] || '';

var board = new five.Board(opts);
var strip = null;

var percentage = 0;
const strips = [{ pin: 6, length: 8 }];
var divisor = 100 / strips[0].length;

function initStrip(board) {
    return new pixel.Strip({
        board,
        strips,
        controller: 'FIRMATA',
    });
}

board.on('ready', function () {
    console.log('Board: ' + chalk.green('✓'));
    strip = initStrip(board);

    strip.on('ready', function () {
        console.log('Strip: ' + chalk.green('✓'));

        setInterval(function () {
            octopi('job', function (body) {
                percentage = Math.round(body.progress.completion);
                strip.color('#000');
                var fullLeds = Math.floor(percentage / divisor);
                var partial = percentage % divisor;
                for (var i = 0; i < fullLeds; ++i) {
                    strip.pixel(i).color('white');
                }
                if (fullLeds < strip.length) {
                    var part = Math.round(128 * (partial / divisor));
                    strip.pixel(fullLeds).color([part, part, part]);
                }
                console.log('updating NeoPixels,',
                    percentage, '%,',
                    fullLeds, 'fully illuminated',
                    (fullLeds < strip.length ? 'and 1 partially' : '')
                );
                strip.show();
            });
        }, 1000);
    });
});