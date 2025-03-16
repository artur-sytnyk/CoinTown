

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
        const MAX_FILE_SIZE_MB = 1;
        const ALLOWED_TYPES = ['application/json', 'text/plain'];

        return new Promise((resolve, reject) => {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return reject('Invalid file type! Please upload a JSON file.');
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                return reject(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit!`);
            }

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const dataString = reader.result;
                    const parsedData = JSON.parse(dataString);
                    if (!parsedData.name || !parsedData.gameState) {
                        return reject('Invalid save file structure!');
                    }
                    
                    localStorage.setItem('savegame' + slotId, dataString);
                    resolve(parsedData);
                } catch (e) {
                    reject('Invalid save file! Unable to parse JSON.');
                }
            };

            reader.onerror = () => reject('Error reading file');
            reader.readAsText(file);
        });
    }

}