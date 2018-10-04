class State {
    constructor(name, behaviour, transitions) {
        this.name = name;
        this.behaviour = behaviour;
        this.transitions = transitions;
        this._selfTransition = { name: this.name };
    }

    transitionTo(world) {
        const transition = this.transitions.find(transition => transition.condition(world)) || this._selfTransition;
        return transition.name;
    }
}

class Behaviour {
    start(world) {
    }
    act(world) {
    }
    stop(world) {
    }
}

class Transition {
    constructor(name, condition) {
        this.name = name;
        this.condition = condition;
    }
}
const dummyState = new State('dummy',
    new Behaviour(),
    []
);

class Simulation {
    constructor() {
        this.states = []
        this.currentState = dummyState;
    }

    setCurrentState(name) {
        const nextState = this.states.find(state => state.name === name) || dummyState;
        if (nextState != this.currentState) {
            console.log(`stopped: ${this.currentState.name}`);
            this.currentState.behaviour.stop();
            this.currentState = nextState;
            this.currentState.behaviour.start();
            console.log(`started: ${this.currentState.name}`);
        }
        this.currentState = this.states.find(state => state.name === name) || dummyState;
    }

    tick(world) {
        this.setCurrentState(this.currentState.transitionTo(world));
        console.log(`action:  ${this.currentState.name}`);
        this.currentState.behaviour.act(world);
    }

}

module.exports = {
    Simulation,
    State,
    Behaviour,
    Transition,
}