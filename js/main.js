
import { Constants } from './Constants.js';
import { Game } from './Game.js';
import { Screen } from './Screen.js';
import { Alert } from './Alert.js';
import './utils.js'; // prototyped capitalization

class App {
    constructor() {
        this.game = new Game(Constants.SMALL_TOWN_SIZE);
        this.screen = new Screen(this.game);
        this.game.setScreen(this.screen);
        this.sound = false;
    }

    init() {
        console.info('App initialized');
        this.setupButtonListeners();
        // this.gameStateToggle(); // manual start
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

    saveGame() {
        // TODO
    }

    loadGame() {
        // TODO
    }

    restartGame() {
        this.initGame(Constants.SMALL_TOWN_SIZE)
        // TODO define exactly
    }

    setupButtonListeners() {
        document.getElementById('gameStateToggle').addEventListener('click', this.gameStateToggle.bind(this));
        document.getElementById('simulationSpeedBtn').addEventListener('click', this.speedToggle.bind(this));
        document.getElementById('saveGameBtn').addEventListener('click', this.saveGame.bind(this));
        document.getElementById('restartBtn').addEventListener('click', this.restartGame.bind(this));
        document.addEventListener('keydown', function (event) {
            if (event.key === ' ') document.getElementById('gameStateToggle').click();
        });
        this.setupBuyButtons();
        this.setupMenuToggle();
        this.setupSoundToggle();
        this.setupSavegamesModal();
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
        const speed = this.game.speedMultiplier;
        if (speed >= 4) {
            this.game.setSpeedMultiplier(1);
        } else {
            this.game.setSpeedMultiplier(speed * 2);
        }
        document.getElementById('speed').innerText = 'x' + this.game.speedMultiplier;
    }

    setupBuyButtons() {
        document.getElementById('buyResidentBtn').addEventListener('click', () => this.buyNode('resident'));
        document.getElementById('buyCommercialBtn').addEventListener('click', () => this.buyNode('commercial'));
        document.getElementById('buyFactoryBtn').addEventListener('click', () => this.buyNode('factory'));
    }

    buyNode(type) {
        this.screen.placeNode(type);
    }

    setupMenuToggle() {
        const menuBtn = document.getElementById('menuBtn');
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('show');
        });
    }

    setupSoundToggle() {
        const soundBtn = document.getElementById('soundBtn');
        const bgMusic = new Audio("../assets/audio/bg-sound.wav");
        bgMusic.loop = true;
        bgMusic.volume = 0.2;

        soundBtn.addEventListener('click', () => {
            if (this.sound) bgMusic.pause();
            else bgMusic.play();
            this.sound = !this.sound;
            soundBtn.innerText = (this.sound) ? '🕪' : '🕨';
        });
    }

    setupSavegamesModal() {
        const saveGamesOverlay = document.getElementById('saveGamesOverlay');
        const saveGamesContent = saveGamesOverlay.querySelector('.savegames-content');
        const loadGameBtn = document.getElementById('loadGameBtn');

        saveGamesOverlay.addEventListener('click', () => {
            saveGamesOverlay.classList.remove('show');
        })
        saveGamesContent.addEventListener('click', (event) => {
            event.stopPropagation()
        });
        loadGameBtn.addEventListener('click', () => {
            saveGamesOverlay.classList.add('show');
        });

    }
}

window.onload = () => {
    const alert = new Alert();
    window.alert = alert;
    const app = new App();
    window.app = app; // TODO - for tests
    app.init();
}