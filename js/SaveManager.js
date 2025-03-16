

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
    }

    static delete(slotId) {
        localStorage.removeItem(this.#getKey(slotId));
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
        return new Promise((resolve, reject) => {
            reader.onload = () => {
                try {
                    const dataString = reader.result
                    localStorage.setItem('savegame' + slotId, dataString);
                    resolve(JSON.parse(dataString));
                } catch (e) {
                    reject('Invalid save file');
                }
            };
            reader.onerror = () => reject("Error reading file");
            reader.readAsText(file);
        });
    }
}