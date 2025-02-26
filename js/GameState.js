import { Constants } from "./Constants.js";
import { Resident, Commercial, Factory, CentralNode } from './GameNode.js';

export class GameState {
    constructor(size = Constants.SMALL_TOWN_SIZE) {
        this.coins = Constants.STARTING_COINS;
        this.nodeCosts = {
            resident: 0,
            commercial: 0,
            factory: 0
        };
        this.size = size;
        this.nodes = [ new CentralNode(size/2, size/2) ];
        this.onCoinsChange();
        console.info('GameState created');
    }

    // GameState / savegame functions
    restart() {
        this.coins = Constants.STARTING_COINS;
        this.nodeCosts = {
            resident: 0,
            commercial: 0,
            factory: 0
        };
        this.nodes = [];
        this.onCoinsChange();
    }

    load(data) { 
        if(!data) {
            log.warn('No data to load');
            return
        }
        this.coins = data.coins;
        this.nodeCosts = data.nodeCosts;
        this.nodes = data.nodes; // TODO not sure
        this.onCoinsChange();
    }

    // Node functions
    addNode(node) {
        this.nodes.push(node);
    }

    removeNode(node) {
        this.nodes = this.nodes.filter(n => n !== node);
    }

    spawnNode(node) {
        this.payForNode(node);
        this.addNode(node);
        this.increaseCost(node);
        this.onCoinsChange();
        this.onCostsChange();
    }

    payForNode(node) {
        if(node instanceof Resident)
            this.coins -= this.nodeCosts.resident;
        else if(node instanceof Commercial)
            this.coins -= this.nodeCosts.commercial;
        else if(node instanceof Factory)
            this.coins -= this.nodeCosts.factory;
    }

    increaseCost(node) {
        if(node instanceof Resident)
            this.nodeCosts.resident += Constants.COST_INCREASE_R;
        else if(node instanceof Commercial)
            this.nodeCosts.commercial += Constants.COST_INCREASE_C;
        else if(node instanceof Factory)
            this.nodeCosts.factory += Constants.COST_INCREASE_F;
    }

    // Game logic
    addCoins(amount) {
        this.coins += amount;
    }

    canAffordResident() {
        return this.coins >= this.nodeCosts.resident;
    }

    canAffordCommercial() {
        return this.coins >= this.nodeCosts.commercial;
    }

    canAffordFactory() {
        return this.coins >= this.nodeCosts.factory;
    }

    // Additional functions
    onCoinsChange() {
        document.getElementById('coins').innerText = this.coins;
        if(!this.canAffordResident()) document.getElementById('buyResidentBtn').classList.add("btn-disabled");
        else document.getElementById('buyResidentBtn').classList.remove("btn-disabled");
        if(!this.canAffordCommercial()) document.getElementById('buyCommercialBtn').classList.add("btn-disabled");
        else document.getElementById('buyCommercialBtn').classList.remove("btn-disabled");
        if(!this.canAffordFactory()) document.getElementById('buyFactoryBtn').classList.add("btn-disabled");
        else document.getElementById('buyFactoryBtn').classList.remove("btn-disabled");
    }

    onCostsChange() {
        document.getElementById('rCost').innerText = this.nodeCosts.resident;
        document.getElementById('cCost').innerText = this.nodeCosts.commercial;
        document.getElementById('fCost').innerText = this.nodeCosts.factory;
    }
}