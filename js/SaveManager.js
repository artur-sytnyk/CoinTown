

export class SaveManager {

    static load(slotId) {
        const data = localStorage.getItem(this.#getKey(slotId));
        if (!data) return null;
        return JSON.parse(data);
    }

    static save(slotId, saveName, gameState) {
        const saveObject = {
            name: saveName,
            gameState: gameState
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
}