var request = require('request');
var config = require('./config');

const server = process.env.SERVER ? process.env.SERVER : 'octopi.local';

var getState = function (item, callback) {
    var stateCall = {
        url: `http://${server}/api/${item}`,
        headers: {
            'X-Api-Key': config.octopiApiKey,
        }
    };
    request(stateCall, function (error, response, body) {
        if (error) {
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
        }
        if (body) {
            callback(JSON.parse(body));
        }
    });
}

module.exports = getState