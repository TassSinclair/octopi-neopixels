const { State, Behaviour, Transition } = require('./state-model');

const transitions = [
    new Transition('idling', (world) => !world.job.progress),
    new Transition('printing', (world) => world.job.progress),
]

class PrintingBehaviour extends Behaviour {
    act({ job, strip }) {
        var divisor = 100 / strip.length;
        const percentage = Math.round(job.progress.completion);
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
        strip.show();
    }
}

class IdlingBehaviour extends Behaviour {
    constructor() {
        super();
        this.firstTick = false;
    }
    start() {
        this.firstTick = true;
    }
    act({ strip }) {
        if (this.firstTick) {
            strip.color('#000');
            this.firstTick = false;
        }
        const r = Math.round(Math.random() * 255)
        const g = Math.round(Math.random() * 255)
        const b = Math.round(Math.random() * 255)
        strip.pixel(Math.round(Math.random() * 7))
            .color([r, g, b]);
        strip.show();
    }
}

const printingState = new State(
    'printing',
    new PrintingBehaviour(),
    transitions,
);

const idlingState = new State(
    'idling',
    new IdlingBehaviour(),
    transitions,
);

module.exports = {
    printingState,
    idlingState,
}