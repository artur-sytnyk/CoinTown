import './utils.js';
import { GameController } from './GameController.js';
import { UIController } from './UIController.js';
import { SaveController } from './SaveController.js';

export class ControllerManager {
    constructor() {
        this.game = new GameController(this);
        this.ui = new UIController(this);
        this.save = new SaveController(this);
    }

    init() {
        this.game.init();
        this.ui.init();
        this.save.updateSaveSlots();
    }


    // Music
    startMusic() {
        this.game.startMusic();
    }

    stopMusic() {
        this.game.stopMusic();
    }

    // Game
    toggleGameLoop() {
        return this.game.toggleGameLoop();
    }

    restartGame() {
        this.game.restartGame();
    }

    nextGameLoopSpeed() {
        return this.game.nextSpeedMultiplier();
    }

    getGameState() {
        return this.game.getGameState();
    }

    loadGameRomSave(gameState) {
        this.game.loadFromState(gameState)
    }

    // Nodes
    placeGameNode(type) {
        this.game.placeNode(type)
    }

    // Saves
    setSaveAction(action) {
        this.save.setAction(action);
    }

    saveAction(slotId) {
        this.save.initAction(slotId);
    }

    deleteSave(slotId) {
        this.save.deleteGame(slotId);
    }

    saveNewTownName(name) {
        this.save.saveWithName(name);
    }

    // UI
    showSaveConfirmOverlay(message, confirmFunction) {
        this.ui.showSaveConfirmOverlay(message, confirmFunction);
    }

    showSaveNameFormOverlay() {
        this.ui.showSaveNameFormOverlay();
    }
}
