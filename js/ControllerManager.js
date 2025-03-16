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

    loadGameFromSave(gameState) {
        this.game.loadFromState(gameState)
    }

    // Nodes

    placeGameNode(type) {
        this.game.placeNode(type)
    }

    // Saves

    updateSaveSlots(){
        this.save.updateSaveSlots();
    }

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

    exportGame(slotId) {
        this.save.exportSave(slotId);
    }

    importGame(slotId, file) {
        this.save.importSave(slotId, file);
    }

    // UI
    
    showSaveConfirmOverlay(message, confirmFunction) {
        this.ui.showSaveConfirmOverlay(message, confirmFunction);
    }

    showSaveNameFormOverlay() {
        this.ui.showSaveNameFormOverlay();
    }

    hideSaveSlotOverlay() {
        this.ui.hideSaveSlotOverlay();
    }
}
