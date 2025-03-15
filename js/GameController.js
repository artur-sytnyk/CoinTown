import { Game } from "./Game.js";
import { Screen } from "./Screen.js";

export class GameController {
    constructor() {
        this.game = new Game();
        this.screen = new Screen(this.game);
        this.game.setScreen(this.screen);
        this.bgMusic = new Audio("../assets/audio/bg-sound.wav");
    }

    init() {
        this.#musicInit();
    }

    // Music
    #musicInit() {
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.2;
    }

    startMusic() {
        this.bgMusic.play();
    }

    stopMusic() {
        this.bgMusic.pause();
    }

    // Screen
    placeNode(type) {
        this.screen.placeNode(type);
    }

    // Game
    toggleGameLoop() {
        if (this.game.isRunning) {
            this.game.stop();
        } else {
            this.game.start();
        }
        return this.game.isRunning;
    }

    restartGame() {
        this.game.restart();
    }

    loadFromState(gameState) {
        this.game.loadFromState(gameState);
        $('#gameStateToggle').text('Start');
    }

    nextSpeedMultiplier() {
        const speed = this.game.speedMultiplier;
        const newSpeed = (speed >= 4) ? 1 : speed * 2;
        this.game.setSpeedMultiplier(newSpeed);
        return newSpeed;
    }

    getGameState() {
        return this.game.getGameState();
    }
}