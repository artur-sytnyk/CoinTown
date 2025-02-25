import { Constants } from "./Constants.js";
import { Resident, Commercial, Factory } from './GameNode.js';

export class GameState {
    constructor(size = Constants.SMALL_TOWN_SIZE) {
        this.coins = Constants.STARTING_COINS;
        this.nodeCosts = {
            resident: 0,
            commercial: 0,
            factory: 0
        };
        this.nodes = [];
        this.size = size;
        console.info('GameState created');
    }

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

    restart() {
        this.coins = Constants.STARTING_COINS;
        this.nodeCosts = {
            resident: 0,
            commercial: 0,
            factory: 0
        };
        this.nodes = [];
    }

    load(data) { 
        if(!data) {
            log.warn('No data to load');
            return
        }
        this.coins = data.coins;
        this.nodeCosts = data.nodeCosts;
        this.nodes = data.nodes; // TODO not sure
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

}