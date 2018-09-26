const shouldMockBoard = process.env.BOARD === 'mock';

const five = shouldMockBoard ? require('./mocks').five : require('johnny-five');
const pixel = shouldMockBoard ? require('./mocks').pixel : require('node-pixel');
const chalk = require('chalk');
const config = require('./config');
const octopi = require('./octopi');
const { Simulation, State, Transition } = require('./state-model');

var opts = {};
opts.port = process.argv[2] || '';

const board = new five.Board(opts);

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

const simulation = new Simulation();

const transitions = [
    new Transition('idling', (world) => !world.job),
    new Transition('printing', (world) => world.job),
]

const idlingState = new State('idling', () => { }, transitions)
const createPrintingState = (strip) => new State('printing',
    (world) => {

        percentage = Math.round(world.job.progress.completion);
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
    },
    transitions,
);

const senseWorld = () => Promise.all([
    octopi.getJob()
]).then(([job]) => ({
    job
}));

board.on('ready', () => {
    console.log('Board: ' + chalk.green('✓'));
    const strip = initStrip(board);

    strip.on('ready', () => {
        console.log('Strip: ' + chalk.green('✓'));
        simulation.states.push(idlingState, createPrintingState(strip));
        simulation.setCurrentState('idling')

        setInterval(() => {
            senseWorld().then(world => {
                simulation.tick(world);
            });
        }, 1000);
    });
});