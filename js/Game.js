import { Constants } from "./Constants";

export class Game {
    constructor() {
        this.lastTimestamp = 0;
        this.isRunning = false;
        this.fps = Constants.FPS;
        this.updateInterval = 250; // 250ms = 4 times per second
        this.updateCounter = 0;
        this.speedMultiplier = 1;
        this.gameState = new GameState();
        console.info('Game created');
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

        const deltaTime = (timestamp - this.lastTimestamp) / 1000;
        this.lastTimestamp = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        // game logic update
    }

    render() {
        // render game
    }
}