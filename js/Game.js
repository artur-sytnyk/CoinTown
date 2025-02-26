import { Constants } from "./Constants.js";
import { GameState } from "./GameState.js";

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
            if(this.screen) this.screen.render();
            console.log('interval render', speedAffectedInterval)
            this.lastUpdateDeltaTime -= speedAffectedInterval / 1000;
        }

        
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update() {
        this.updateCounter++;
        // game logic update - node gains and checks
    }



    // Additional Functions
    setTownSize(size) {
        this.gameState.size = size;
    }
}