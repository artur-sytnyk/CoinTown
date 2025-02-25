
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
        this.startGame();
    }

    startGame() {
        this.game.start();
    }
    
    initGame(townSize) {
        this.game = new Game(townSize);
        this.screen = new Screen(this.game);
        this.game.setScreen(this.screen);
        // game initialized - alert user?
    }
}

window.onload = () => {
    const app = new App();
    app.init();
}