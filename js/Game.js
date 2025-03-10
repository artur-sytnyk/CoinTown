import { Constants } from "./Constants.js";
import { GameState } from "./GameState.js";
import { Resident, Commercial, Factory, CentralNode } from "./GameNode.js";

export class Game {
    constructor(size, mode) {
        this.gameState = new GameState(size, mode);
        this.screen = null; // for screen DI
        this.isRunning = false;
        this.updateCounter = 0;
        this.updateInterval = 250; // 250ms base update
        this.speedMultiplier = 1;
        this.lastUpdateTime = performance.now();
    }

    setScreen(screen) {
        this.screen = screen;
        this.screen.render();
    }

    restart() {
        this.stop();
        this.gameState = new GameState(this.gameState.size, this.gameState.mode);
        this.isRunning = false;
        this.updateCounter = 0;
        this.lastUpdateTime = performance.now();
        this.screen.restart();
    }

    loadFromState(gameState) {
        this.stop();
        this.gameState.loadFromState(gameState);
        this.isRunning = false;
        this.updateCounter = 0;
        this.lastUpdateTime = performance.now();
        this.screen.setSize(gameState.size);
        // Filling nodes
        const nodeAnimation = this.screen.getNodeAnimationFunction();
        gameState.nodes.forEach(node =>
            this.loadNode(node.type, node.x, node.y, nodeAnimation)
        );
        this.screen.restart();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastUpdateTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return;

        // Calculate time difference (delta time)
        const deltaTime = timestamp - this.lastUpdateTime;

        // Check if it's time to update game logic
        if (deltaTime >= this.updateInterval / this.speedMultiplier) {
            this.update();
            this.lastUpdateTime = timestamp;
        }

        // Always render at max FPS for smooth visuals
        if (this.screen) this.screen.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update() {
        this.updateCounter++;

        this.gameState.nodes.forEach((node) => {
            node.update(this.updateCounter, this.gameState);
        });

        if (this.updateCounter === 24) {
            this.updateCounter = 0;
            this.gameState.dailyUpdate();
        }
        this.gameState.onCoinsChange();
    }

    setSpeedMultiplier(newSpeed) {
        this.speedMultiplier = newSpeed;
    }


    //  ### ### ### ### ### Additional Functions ### ### ### ### ###

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
            case 'central':
                this.gameState.spawnNode(new CentralNode(x, y));
                break;
            default:
                alert.error('Unknown node type');
        }
    }

    loadNode(nodeType, x, y, nodeAnimationFunc) {
        switch (nodeType) {
            case 'resident':
                this.gameState.loadNode(new Resident(x, y, nodeAnimationFunc));
                break;
            case 'commercial':
                this.gameState.loadNode(new Commercial(x, y, nodeAnimationFunc));
                break;
            case 'factory':
                this.gameState.loadNode(new Factory(x, y, nodeAnimationFunc));
                break;
            case 'central':
                this.gameState.loadNode(new CentralNode(x, y));
                break;
            default:
                alert.error('Unknown node type');
        }
    }
}