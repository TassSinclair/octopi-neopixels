var request = require('request');
var config = require('./config');

const server = process.env.SERVER ? process.env.SERVER : 'octopi.local';

function getState(item) {
    return new Promise((resolve, reject) => {
        var stateCall = {
            url: `http://${server}/api/${item}`,
            headers: {
                'X-Api-Key': config.octopiApiKey,
            }
        };
        request(stateCall, (error, response, body) => {
            if (error) {
                console.log('error:', error);
                console.log('statusCode:', response && response.statusCode);
                reject();
            }
            if (body) {
                resolve(JSON.parse(body));
            }
        });
    });
}

module.exports = {
    getJob: () => getState('job')
}