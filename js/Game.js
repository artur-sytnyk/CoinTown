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
        this.isRunning = true;
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    stop() {
        this.isRunning = false;
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
        // game logic update - node gains and checks
    }

    //  ### ### ### ### ### Additional Functions ### ### ### ### ###

    setTownSize(size) {
        this.gameState.size = size;
    }

    spawnNode(nodeType, x, y) {
        if (this.isAbleToSpawn(x, y)) {
            this.createNode(nodeType, x, y);
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

    createNode(nodeType, x, y) {
        switch (nodeType) {
            case 'resident':
                this.gameState.spawnNode(new Resident(x, y));
                break;
            case 'commercial':
                this.gameState.spawnNode(new Commercial(x, y));
                break;
            case 'factory':
                this.gameState.spawnNode(new Factory(x, y));
                break;
            default:
                alert.error('Unknown node type');
        }
    }
}