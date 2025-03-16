

export class SaveManager {

    static load(slotId) {
        const data = localStorage.getItem(this.#getKey(slotId));
        if (!data) return null;
        return JSON.parse(data);
    }

    static save(slotId, saveName, gameState) {
        const saveObject = {
            name: saveName,
            gameState: gameState.toJSON()
        }
        const data = JSON.stringify(saveObject);
        localStorage.setItem(this.#getKey(slotId), data);
        alert.success('Game saved');
    }

    static delete(slotId) {
        localStorage.removeItem(this.#getKey(slotId));
        alert.success('Game deleted');
    }

    static #getKey(slotId) {
        return 'savegame' + slotId;
    }

    static exportSave(slotId) {
        const data = localStorage.getItem(this.#getKey(slotId));
        const blob = new Blob([data], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `CoinTown_save_${slotId}.json`;
        link.click();
    }

    static importSave(slotId, file) {
        const reader = new FileReader();
        reader.onload = function () {
            try {
                localStorage.setItem('savegame' + slotId, reader.result);
            } catch (e) {
                alert.error('Invalid save file!');
            }
        };
        reader.readAsText(file);
        return true;
    }
}