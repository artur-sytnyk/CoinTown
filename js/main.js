
import { Constants } from './Constants.js';
import { Game } from './Game.js';
import { Screen } from './Screen.js';
import { GameState } from './GameState.js';

class App {
    constructor() {
        this.game = new Game(Constants.SMALL_TOWN_SIZE);
        this.screen = new Screen(this.game);
        this.game.setScreen(this.screen);
    }

    init() {
        console.info('App initialized');
        this.setupButtonListeners();
    }

    initGame(townSize) {
        this.game = new Game(townSize);
        this.screen = new Screen(this.game);
        this.game.setScreen(this.screen);
        // game initialized - alert user?
    }

    startGame() {
        this.game.start();
    }

    stopGame() {
        this.game.stop();
    }

    restartGame() {
        this.initGame(Constants.SMALL_TOWN_SIZE)
        // TODO define exactly
    }

    loadGame() {
        // TODO
    }

    setupButtonListeners() {
        document.getElementById('gameStateToggle').addEventListener('click', this.gameStateToggle.bind(this));
        document.getElementById('simulationSpeedBtn').addEventListener('click', this.speedToggle.bind(this));
        document.getElementById('restartBtn').addEventListener('click', this.restartGame.bind(this));
    }

    gameStateToggle() {
        if (this.game.isRunning) {
            this.stopGame();
            document.getElementById('gameStateToggle').innerText = 'Start';
        } else {
            this.startGame();
            document.getElementById('gameStateToggle').innerText = 'Stop';
        }
    }

    speedToggle() {
        if(this.game.speedMultiplier >= 4) {
            this.game.speedMultiplier = 1;
        } else {
            this.game.speedMultiplier *= 2;
        }
        document.getElementById('speed').innerText = 'x' + this.game.speedMultiplier;
    }
}

window.onload = () => {
    const app = new App();
    app.init();
}