

export class SaveManager {
    static hasSave = { 1: false, 2: false, 3: false }

    static init() {
        for (let i = 1; i <= 3; i++) {
            const data = this.load(i);
            if (!data) continue;
            this.hasSave[i] = true;
            const btn = document.getElementById('save' + i);
            if(btn) btn.innerText = data.name;
        }
    }

    static load(slotId) {
        const data = localStorage.getItem(this.getKey(slotId));
        if (!data) return null;
        return JSON.parse(data);
    }

    static save(slotId, gameState) {
        const saveObject = {
            name: "my save name",
            gameState: gameState
        }
        const data = JSON.stringify(saveObject);
        localStorage.setItem(this.getKey(slotId), data);
        this.hasSave[slotId] = true;
        alert.success('Game saved');
    }
    
    static delete(slotId) {
        localStorage.removeItem(this.getKey(slotId));
    }

    static getKey(slotId) {
        return 'savegame' + slotId;
    }
}