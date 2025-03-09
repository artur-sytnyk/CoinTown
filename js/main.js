
import { Constants } from './Constants.js';
import { Game } from './Game.js';
import { Screen } from './Screen.js';
import { Alert } from './Alert.js';
import { SaveManager } from './SaveManager.js';
import './utils.js';

class App {
    constructor() {
        this.game = new Game();
        this.screen = new Screen(this.game);
        this.game.setScreen(this.screen);
        this.sound = false;
        this.savegamesAction = 'load'; // save / load
        this.saveSlot = 1;
        this.saveName = "";
    }

    init() {
        SaveManager.updateSaveslots();
        this.setupButtonListeners();
    }

    startGame() {
        this.game.start();
        document.getElementById('gameStateToggle').innerText = 'Stop';
    }

    stopGame() {
        this.game.stop();
        document.getElementById('gameStateToggle').innerText = 'Start';
    }

    saveGame(saveId) {
        if (SaveManager.hasSave[saveId]) {
            this.showConfirmOverlay(
                "Are you sure to overwrite savefile?",
                () => { SaveManager.save(saveId, this.saveName, this.game.gameState); }
            );
        } else {
            this.showSaveNameFormOverlay(
                () => SaveManager.save(saveId, this.saveName, this.game.gameState)
            );
        }
    }

    loadGame(saveId) {
        const data = SaveManager.load(saveId);
        if (data) {
            this.showConfirmOverlay(
                "Are you sure to load another savefile? Current proggress will be lost",
                () => {
                    this.saveSlot = saveId;
                    this.saveName = data.name;
                    this.stopGame();
                    this.game.loadFromState(data.gameState);
                }
            );
        } else {
            alert.error("Cannot load empty save");
        }
    }

    deleteGame(saveId) {
        this.showConfirmOverlay(
            "Are you sure want to delete savefile?",
            () => { SaveManager.delete(saveId); }
        )
    }

    restartGame() {
        this.stopGame();
        this.game.restart();
    }

    setupButtonListeners() {
        document.getElementById('gameStateToggle').addEventListener('click', this.gameStateToggle.bind(this));
        document.getElementById('simulationSpeedBtn').addEventListener('click', this.speedToggle.bind(this));
        document.getElementById('restartBtn').addEventListener('click', this.restartGame.bind(this));
        document.addEventListener('keydown', function (event) {
            if (event.key === ' ') document.getElementById('gameStateToggle').click();
        });
        this.setupBuyButtons();
        this.setupMenuToggle();
        this.setupHelpToggle();
        this.setupSoundToggle();
        this.setupSavegamesModal();
    }

    gameStateToggle() {
        if (this.game.isRunning) {
            this.stopGame();
        } else {
            this.startGame();
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

    setupHelpToggle() {
        const helpBtn = document.getElementById('helpBtn');
        helpBtn.addEventListener('click', () => {
            helpBtn.classList.toggle('show');
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
        const saveGameBtn = document.getElementById('saveGameBtn');
        const saveBtn = document.getElementById('saveNameBtn');

        saveGamesOverlay.addEventListener('click', () => {
            saveGamesOverlay.classList.remove('show');
        })
        saveGamesContent.addEventListener('click', (event) => {
            event.stopPropagation()
        });
        loadGameBtn.addEventListener('click', () => {
            this.savegamesAction = 'load';
            saveGamesOverlay.classList.add('show');
        });
        saveGameBtn.addEventListener('click', () => {
            this.savegamesAction = 'save';
            saveGamesOverlay.classList.add('show');
        });

        document.getElementById('saveBtn1').addEventListener('click', () => { this.saveSlotAction(1); });
        document.getElementById('saveBtn2').addEventListener('click', () => { this.saveSlotAction(2); });
        document.getElementById('saveBtn3').addEventListener('click', () => { this.saveSlotAction(3); });
        document.getElementById('deleteSave1').addEventListener('click', () => { this.deleteGame(1); });
        document.getElementById('deleteSave2').addEventListener('click', () => { this.deleteGame(2); });
        document.getElementById('deleteSave3').addEventListener('click', () => { this.deleteGame(3); });
        saveBtn.addEventListener('click', () => { this.setSaveName(saveBtn); });

    }

    setSaveName(saveBtn) {
        let name = document.getElementById('townNameInput').value;
        if (name.trim() === '') {
            alert.error("Name cannot be empty");
            return;
        };
        this.saveName = document.getElementById('townNameInput').value;
        if (saveBtn._saveFunc) saveBtn._saveFunc();
        document.getElementById('saveNameFormOverlay').classList.remove('show');
    }

    saveSlotAction(saveId) {
        switch (this.savegamesAction) {
            case 'save': {
                this.saveGame(saveId);
                break;
            }
            case 'load': {
                this.loadGame(saveId);
                break;
            }
            default: alert.error("Wrong save slot action");
        }
    }

    showConfirmOverlay(message, confirmedFunc) {
        const overlay = document.getElementById('confirmOverlay');
        const textEl = overlay.querySelector('#confirmText');
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
        // modal
        overlay.classList.add('show');
        textEl.innerText = message;
        // buttons functionality
        yesBtn.removeEventListener('click', yesBtn._listener);
        noBtn.removeEventListener('click', noBtn._listener);

        yesBtn._listener = () => {
            confirmedFunc();
            overlay.classList.remove('show');
        };
        noBtn._listener = () => overlay.classList.remove('show');

        yesBtn.addEventListener('click', yesBtn._listener);
        noBtn.addEventListener('click', noBtn._listener);
    }

    showSaveNameFormOverlay(saveFunc) {
        document.getElementById('townNameInput').value = "";
        document.getElementById('saveNameBtn')._saveFunc = saveFunc;
        document.getElementById('saveNameFormOverlay').classList.add('show');
    }
}

window.onload = () => {
    const alert = new Alert();
    window.alert = alert;
    const app = new App();
    window.app = app; // TODO - for tests
    app.init();
}