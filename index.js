const shouldMockBoard = process.env.BOARD === 'mock';

const five = shouldMockBoard ? require('./mocks').five : require('johnny-five');
const pixel = shouldMockBoard ? require('./mocks').pixel : require('node-pixel');
const chalk = require('chalk');
const config = require('./config');
const octopi = require('./octopi');
const { Simulation } = require('./state-model');
const states = require('./states');

var opts = {};
opts.port = process.argv[2] || '';

const board = new five.Board(opts);

function initStrip(board) {
    return new pixel.Strip({
        board,
        strips: [{ pin: 6, length: 8 }],
        controller: 'FIRMATA',
    });
}

const simulation = new Simulation();

simulation.states.push(
    states.idlingState,
    states.printingState,
);
simulation.setCurrentState('idling')

board.on('ready', () => {
    console.log('Board: ' + chalk.green('✓'));
    const strip = initStrip(board);

    const senseWorld = () => Promise.all([
        octopi.getJob()
    ]).then(([job]) => ({
        job,
        strip,
    }));

    strip.on('ready', () => {
        console.log('Strip: ' + chalk.green('✓'));
        setInterval(() => {
            senseWorld().then(world => simulation.tick(world));
        }, 1000);
    });
});