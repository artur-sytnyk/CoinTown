import { Constants } from './Constants.js';

export default class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.connections = [];
        console.log('Node created at', x, y);
    }

    render(ctx, color = 'black') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Constants.NODE_SIZE, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

export class CentralNode extends Node {
    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Constants.NODE_SIZE * 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#d0d0d0';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

export class Resident extends Node {
    constructor(x, y, constants, state = 'idling', workplace = null, wealth = 0, happiness = 50) {
        super(x, y);
        this.constants = constants;
        this.state = state;
        this.workplace = workplace;
        this.wealth = wealth;
        this.happiness = happiness;
        this.workTicks = 0;
    }

    render(ctx) {
        super.render(ctx, Constants.COLOR_RESIDENT);
    }
}

export class Commercial extends Node {
    constructor(x, y, workers = [], wealth = 0, productCount = 0, productLimit = 100, happiness = 50) {
        super(x, y);
        this.workers = workers;
        this.wealth = wealth;
        this.productCount = productCount;
        this.productLimit = productLimit;
        this.happiness = happiness;
        this.workerLimit = 1;
    }

    render(ctx) {
        super.render(ctx, Constants.COLOR_COMMERCIAL);
    }
}

export class Factory extends Node { 
    constructor(x, y, workers = [], commercials = [], happiness = 50) {
        super(x, y);
        this.workers = workers;
        this.commercials = commercials;
        this.happiness = happiness;
        this.workerLimit = 1;
        this.productMultiplier = 2;
    }

    render(ctx) {
        super.render(ctx, Constants.COLOR_FACTORY);
    }
}