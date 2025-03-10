import { Game } from './Game.js';
import { Screen } from './Screen.js';
import { SaveManager } from './SaveManager.js';
import './utils.js';
import { RandomCityApi } from './apis.js';

export class App {
    constructor() {
        this.game = new Game();
        this.screen = new Screen(this.game);
        this.game.setScreen(this.screen);
        this.bgMusic = null;
        this.savegamesAction = 'load'; // save / load
        this.saveSlot = 1;
        this.saveName = "";
    }

    init() {
        SaveManager.updateSaveslots();
        this.setupBgMusic();
        this.setupButtonListeners();
    }

    startGame() {
        this.game.start();
        $('#gameStateToggle').text('Stop');
    }

    stopGame() {
        this.game.stop();
        $('#gameStateToggle').text('Start');
    }

    saveGame(saveId) {
        const data = SaveManager.load(saveId);
        if (data) {
            this.showConfirmOverlay(
                "Are you sure to overwrite savefile?",
                () => { SaveManager.save(saveId, data.name, this.game.gameState); }
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
                "Are you sure to load another savefile? Current progress will be lost",
                () => {
                    this.saveSlot = saveId;
                    this.setTownName(data.name);
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
            "Are you sure you want to delete savefile?",
            () => { SaveManager.delete(saveId); }
        )
    }

    restartGame() {
        this.stopGame();
        this.game.restart();
    }

    setTownName(name) {
        this.saveName = name;
        $('#townNameDisplay').text(name);
    }

    setupBgMusic() {
        this.bgMusic = new Audio("../assets/audio/bg-sound.wav");
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.2;
    }

    setupButtonListeners() {
        $('#gameStateToggle').click(this.gameStateToggle.bind(this));
        $('#simulationSpeedBtn').click(this.speedToggle.bind(this));
        $('#restartBtn').click(this.restartGame.bind(this));

        $(document).keydown((event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
            if (event.code === 'Space') $('#gameStateToggle').click();
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
        $('#speed').text('x' + this.game.speedMultiplier);
    }

    setupBuyButtons() {
        $('#buyResidentBtn').click(() => this.buyNode('resident'));
        $('#buyCommercialBtn').click(() => this.buyNode('commercial'));
        $('#buyFactoryBtn').click(() => this.buyNode('factory'));
    }

    buyNode(type) {
        this.screen.placeNode(type);
    }

    setupMenuToggle() {
        $('#menuBtn').click(() => {
            $('#menuBtn').toggleClass('show');
        });
    }

    setupHelpToggle() {
        $('#helpBtn').click(() => {
            $('#helpBtn').toggleClass('show');
        });
    }

    setupSoundToggle() {
        $('#soundCheckbox').change(() => {
            if ($('#soundCheckbox').prop('checked')) {
                this.bgMusic.play();
                $('#soundIcon').text('🕪');
            } else {
                this.bgMusic.pause();
                $('#soundIcon').text('🕨');
            }
        });
    }

    setupSavegamesModal() {
        const saveGamesOverlay = $('#saveGamesOverlay');
        const saveGamesContent = saveGamesOverlay.find('.savegames-content');
        const loadGameBtn = $('#loadGameBtn');
        const saveGameBtn = $('#saveGameBtn');
        const saveNameFormOverlay = $('#saveNameFormOverlay');
        const saveNameContent = saveNameFormOverlay.find('.save-name-content');
        const saveBtn = $('#saveNameBtn');

        saveGamesOverlay.click(() => {
            saveGamesOverlay.removeClass('show');
        })
        saveGamesContent.click((event) => {
            event.stopPropagation();
        });

        loadGameBtn.click(() => {
            this.savegamesAction = 'load';
            saveGamesOverlay.addClass('show');
        });
        saveGameBtn.click(() => {
            this.savegamesAction = 'save';
            saveGamesOverlay.addClass('show');
        });

        saveNameFormOverlay.click(() => {
            saveNameFormOverlay.removeClass('show');
        });
        saveNameContent.click((event) => {
            event.stopPropagation();
        });
        saveBtn.click(() => { this.setSaveslotName(saveBtn); });

        $('#saveSlotBtn1').click(() => { this.saveSlotAction(1); });
        $('#saveSlotBtn2').click(() => { this.saveSlotAction(2); });
        $('#saveSlotBtn3').click(() => { this.saveSlotAction(3); });
        $('#deleteSave1').click(() => { this.deleteGame(1); });
        $('#deleteSave2').click(() => { this.deleteGame(2); });
        $('#deleteSave3').click(() => { this.deleteGame(3); });
        $('#townNameRandomizer').click(async () => {
            await this.RandomizeTownName();
        });
    }

    setSaveslotName(saveBtn) {
        let name = $('#townNameInput').val();
        if (name.trim() === '') {
            alert.error("Name cannot be empty");
            return;
        };
        this.setTownName(name);
        let saveFunc = $(saveBtn).data('saveFunc');
        if (saveFunc) saveFunc();
        $('#saveNameFormOverlay').removeClass('show');
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
        $('#saveGamesOverlay').click();
    }

    async RandomizeTownName() {
        const saveBtn = $('#saveNameBtn');
        saveBtn.prop('disabled', true);
        saveBtn.text("Wait..");

        const nameInput = $('#townNameInput');
        const randomName = await RandomCityApi.fetchRandomCity();
        nameInput.val(randomName);

        saveBtn.prop('disabled', false);
        saveBtn.text("Save");
    }

    showConfirmOverlay(message, confirmedFunc) {
        const overlay = $('#confirmOverlay');
        const textEl = overlay.find('#confirmText');
        const yesBtn = $('#confirmYes');
        const noBtn = $('#confirmNo');

        overlay.addClass('show');
        textEl.text(message);

        yesBtn.off('click').on('click', () => {
            overlay.removeClass('show');
            confirmedFunc();
        });

        noBtn.off('click').on('click', () => overlay.removeClass('show'));
    }

    showSaveNameFormOverlay(saveFunc) {
        $('#townNameInput').val("");
        $('#saveNameBtn').data('saveFunc', saveFunc);
        $('#saveNameFormOverlay').addClass('show');
        setTimeout(() => $('#townNameInput').focus(), 10);
    }
}
