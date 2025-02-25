
import { Game } from './Game.js';
import { Screen } from './Screen.js';

class App {
    constructor() {
        this.game = new Game();
        this.screen = new Screen();
    }

    init() {
        //this.game.start();
        console.info('App initialized');
    }
}

window.onload = () => {
    const app = new App();
    window.app = app;
    app.init();
}