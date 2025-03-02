import { Constants } from "./Constants.js";
import { GameState } from "./GameState.js";
import { Resident, Commercial, Factory } from "./GameNode.js";

export class Game {
    constructor(size) {
        this.gameState = new GameState(size);
        this.screen = null; // for screen DI
        this.isRunning = false;
        this.updateCounter = 0;
        this.updateInterval = 250; // 250ms = 4 times per second
        this.lastTimestamp = 0;
        this.lastUpdateDeltaTime = 0;
        this.speedMultiplier = 1;
        console.info('Game created');
    }

    setScreen(screen) {
        this.screen = screen;
        this.screen.render();
    }

    start() {
        if(this.isRunning) return;
        this.isRunning = true;
        this.lastTimestamp = performance.now();
        this.lastUpdateDeltaTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    stop() {
        this.isRunning = false;
        this.lastUpdateDeltaTime = 0;
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;
        const speedAffectedInterval = this.updateInterval / this.speedMultiplier;

        // Accumulate update delta time

        this.lastUpdateDeltaTime += (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        // Update if interval reached.
        if (this.lastUpdateDeltaTime >= speedAffectedInterval / 1000) {
            this.update(); 
            if (this.screen) this.screen.render();
            this.lastUpdateDeltaTime -= speedAffectedInterval / 1000;
        }
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update() {
        this.updateCounter++;

        this.gameState.nodes.forEach(node => {
            node.update(this.updateCounter, this.gameState);
        });
        this.gameState.onCoinsChange();

        if(this.updateCounter === 24) this.updateCounter = 0;
    }

    //  ### ### ### ### ### Additional Functions ### ### ### ### ###

    setTownSize(size) {
        this.gameState.size = size;
    }

    spawnNode(nodeType, x, y, nodeAnimationFunc) {
        if (this.isAbleToSpawn(x, y)) {
            this.createNode(nodeType, x, y, nodeAnimationFunc);
            alert.success(nodeType.capitalize() + ' built');
        } else {
            alert.error('Cannot build there');
        }
    }

    isAbleToSpawn(x, y) {
        // Cannot spawn on top of other nodes, inverse search
        const onTopOfNode = this.gameState.nodes.some(node => {
            return Math.hypot(node.x - x, node.y - y) < Constants.NODE_SIZE * 2;
        });
        // Must be in spawning range near other nodes which can connect
        const inSpawningRange = this.gameState.nodes.some(node => {
            return node.isConnectable() &&
                Math.hypot(node.x - x, node.y - y) <= Constants.NODE_RANGE;
        });
        // Must be in town area
        const inTownArea = x - Constants.NODE_SIZE > 0 &&
            x + Constants.NODE_SIZE < this.gameState.size &&
            y - Constants.NODE_SIZE > 0 &&
            y + Constants.NODE_SIZE < this.gameState.size;
        return !onTopOfNode && inSpawningRange && inTownArea;
    }

    createNode(nodeType, x, y, nodeAnimationFunc) {
        switch (nodeType) {
            case 'resident':
                this.gameState.spawnNode(new Resident(x, y, nodeAnimationFunc));
                break;
            case 'commercial':
                this.gameState.spawnNode(new Commercial(x, y, nodeAnimationFunc));
                break;
            case 'factory':
                this.gameState.spawnNode(new Factory(x, y, nodeAnimationFunc));
                break;
            default:
                alert.error('Unknown node type');
        }
    }
}