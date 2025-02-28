import { Constants } from "./Constants.js";

// Roads between buildings
export class Connection{
    constructor(nodeA, nodeB) {
        this.nodeA = nodeA;
        this.nodeB = nodeB
    }

    render(ctx) {
        ctx.strokeStyle = Constants.COLOR_ROAD;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.nodeA.x, this.nodeA.y);
        ctx.lineTo(this.nodeB.x, this.nodeB.y);
        ctx.stroke();
    }

    destroy() {
        this.nodeA.removeConnection(this);
        this.nodeB.removeConnection(this);
        this.nodeA = null;
        this.nodeB = null;
    }
}