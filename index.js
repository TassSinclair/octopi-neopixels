var five = require('johnny-five');
var pixel = require('node-pixel');
var request = require('request');
var config = require('./config');

var opts = {};
opts.port = process.argv[2] || '';

var board = new five.Board(opts);
var strip = null;

var percentage = 0;
var stripLength = 8;
var divisor = 100/ stripLength;

var jobCall = {
    url: 'http://octopi.local/api/job',
    headers: {
        'X-Api-Key': config.octopiApiKey
    }
}

board.on('ready', function() {
    console.log('Board ready');

    strip = new pixel.Strip({
        data: 6,
        length: stripLength,
        color_order: pixel.COLOR_ORDER.GRB,
        board: this,
        controller: 'FIRMATA',
    });

    strip.on('ready', function() {
        console.log('Strip ready');

        setInterval(function() {
            request(jobCall, function (error, response, body) {
                if (error) {
                    console.log('error:', error);
                    console.log('statusCode:', response && response.statusCode);
                }
                if (body) {
                    percentage = Math.round(JSON.parse(body).progress.completion);
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
                        percentage,'%,',
                        fullLeds, 'fully illuminated',
                        (fullLeds < strip.length ? 'and 1 partially' : '')
                    );
                    strip.show();
                }
            });
        }, 10000);
    });
});