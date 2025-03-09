

export class SaveManager {
    static hasSave = { 1: false, 2: false, 3: false }

    static updateSaveslots() {
        for (let i = 1; i <= 3; i++) {
            const data = this.load(i);
            const hasData = (!data) ? false : true;
            this.hasSave[i] = (hasData) ? true : false;
            document.getElementById('saveBtn' + i).innerText = (hasData) ? data.name : 'Empty save';
            if (hasData) document.getElementById('deleteSave' + i).classList.add('show');
            else document.getElementById('deleteSave' + i).classList.remove('show');
        }
    }

    static load(slotId) {
        const data = localStorage.getItem(this.getKey(slotId));
        if (!data) return null;
        return JSON.parse(data);
    }

    static save(slotId, saveName, gameState) {
        const saveObject = {
            name: saveName,
            gameState: gameState
        }
        const data = JSON.stringify(saveObject);
        localStorage.setItem(this.getKey(slotId), data);
        this.updateSaveslots();
        alert.success('Game saved');
    }

    static delete(slotId) {
        localStorage.removeItem(this.getKey(slotId));
        this.updateSaveslots();
        alert.success('Game deleted');
    }

    static getKey(slotId) {
        return 'savegame' + slotId;
    }
}