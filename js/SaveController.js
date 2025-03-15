import { SaveManager } from "./SaveManager.js"

export class SaveController {
    static instance = null;
    manager = null;
    #saveSlotId;
    #saveName;
    #saveAction;

    constructor(manager) {
        if (SaveController.instance) {
            return SaveController.instance;
        }
        SaveController.instance = this;
        this.manager = manager;
        this.#saveSlotId = 1;
        this.#saveName = "";
        this.#saveAction = 'load';
    }

    updateSaveSlots() {
        for (let i = 1; i <= 3; i++) {
            const data = SaveManager.load(i);
            const hasData = (!data) ? false : true;

            document.getElementById('saveSlotBtn' + i).innerText = (hasData) ? data.name : 'Empty save';
            document.getElementById('deleteSave' + i).classList.toggle('show', hasData);
        }
    }

    #setSlotId(id) {
        if (id < 1 || id > 3) return;
        this.#saveSlotId = id;
    }

    #setName(name) {
        this.#saveName = name;
        $('#townNameDisplay').text(name);
    }

    setAction(action) {
        this.#saveAction = action;
    }

    hasSave(slotId) {
        return SaveManager.load(slotId) != null;
    }

    #saveGame() {
        SaveManager.save(this.#saveSlotId, this.#saveName, this.manager.getGameState());
        this.updateSaveSlots();
    }

    #loadGame() {
        const data = SaveManager.load(this.#saveSlotId);
        if(!data) {
            alert.error("Cannot load empty save");
            return;
        }
        this.#setName(data.name);
        this.manager.loadGameRomSave(data.gameState);
    }

    saveWithName(name) {
        this.#setName(name);
        this.#saveGame();
    }

    deleteGame(slotId) {
        SaveManager.delete(slotId);
        this.updateSaveSlots();
    }

    initAction(slotId) {
        this.#setSlotId(slotId);
        if (this.#saveAction === 'save') {
            this.#saveGameAction()
        } else if (this.#saveAction === 'load') {
            this.#loadGameAction()
        }
    }

    #doAction() {
        if (this.#saveAction === 'load') {
            this.#loadGame();
        } else if (this.#saveAction === 'save') {
            this.#saveGame();
        }
    }

    #saveGameAction() {
        if (this.hasSave(this.#saveSlotId)) {
            this.manager.showSaveConfirmOverlay(
                "Are you sure to overwrite savefile?",
                () => this.#doAction()
            );
        } else {
            this.manager.showSaveNameFormOverlay();
        }
    }

    #loadGameAction() {
        if (this.hasSave(this.#saveSlotId)) {
            this.manager.showSaveConfirmOverlay(
                "Are you sure to load another savefile? Current progress will be lost.",
                () => this.#doAction()
            );
        } else {
            alert.error("Cannot load empty save");
        }
    }

}