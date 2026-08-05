import { Constants } from "./Constants.js";
import { Resident, Commercial, Factory, CentralNode } from './GameNode.js';
import { Connection } from "./Connection.js";
import { nodeDistance, removeItem } from "./utils.js";

export class GameState {
    #coins;
    #nodeCosts;
    #size;
    #mode;
    #nodes;
    #connections;

    constructor(size = Constants.SMALL_TOWN_SIZE, mode = Constants.GAME_MODE_NORMAL) {
        this.#coins = Constants.STARTING_COINS;
        this.#nodeCosts = {
            resident: 0,
            commercial: 0,
            factory: 0
        };
        this.#size = size;
        this.#mode = mode;
        this.#nodes = [new CentralNode(size / 2, size / 2)];
        this.#connections = [];
        this.onCoinsChange();
        this.#onNodeCountChange();
        this.#onCostsChange();
    }

    loadFromState(gameState) {
        this.#coins = gameState.coins;
        this.#nodeCosts = gameState.nodeCosts;
        this.#size = gameState.size;
        this.#mode = gameState.mode;
        this.#nodes = [];
        this.#connections = [];
        this.onCoinsChange();
        this.#onNodeCountChange();
        this.#onCostsChange();
    }

    toJSON() {
        return {
            coins: this.#coins,
            nodeCosts: this.#nodeCosts,
            size: this.#size,
            mode: this.#mode,
            nodes: this.#nodes.map(node => node.toJSON()),
        };
    }

    // ### ### ### ### ### Get Set ### ### ### ### ###

    get nodes() {
        return this.#nodes;
    }

    get connections() {
        return this.#connections;
    }

    get size() {
        return this.#size;
    }

    set size(size) {
        this.#size = size;
    }

    get mode() {
        return this.#mode;
    }

    set mode(mode) {
        this.#mode = mode;
    }

    get nodeCosts() {
        return this.#nodeCosts;
    }

    // ### ### ### ### ### Node functions ### ### ### ### ###

    #addNode(node) {
        this.#nodes.push(node);
        this.#onNodeCountChange();
    }

    removeNode(node) {
        node.connections.forEach(con => this.#removeConnection(con));
        this.#nodes = removeItem(this.#nodes, node);
        this.#onNodeCountChange();
    }

    spawnNode(node) {
        this.#payForNode(node);
        this.#connectNode(node);
        this.#addNode(node);
        this.#increaseCost(node);
        this.onCoinsChange();
        this.#onCostsChange();
    }

    loadNode(node) {
        this.#connectNode(node);
        this.#addNode(node);
    }

    #payForNode(node) {
        if (node instanceof Resident)
            this.#coins -= this.#nodeCosts.resident;
        else if (node instanceof Commercial)
            this.#coins -= this.#nodeCosts.commercial;
        else if (node instanceof Factory)
            this.#coins -= this.#nodeCosts.factory;
    }

    #increaseCost(node) {
        if (node instanceof Resident)
            this.#nodeCosts.resident += Constants.COST_INCREASE_R;
        else if (node instanceof Commercial)
            this.#nodeCosts.commercial += Constants.COST_INCREASE_C;
        else if (node instanceof Factory)
            this.#nodeCosts.factory += Constants.COST_INCREASE_F;
    }

    #connectNode(newNode) {
        let minDistance = Infinity;
        let closestNode = null;
        this.#nodes.forEach(node => {
            if (!node.isConnectable) return;
            let distance = nodeDistance(node, newNode);
            if (distance < minDistance) {
                minDistance = distance;
                closestNode = node;
            }
        });
        if (closestNode) this.#createConnection(closestNode, newNode);
    }

    #createConnection(nodeA, nodeB) {
        const newCon = new Connection(nodeA, nodeB);
        nodeA.addConnection(newCon);
        nodeB.addConnection(newCon);
        this.#connections.push(newCon);
    }

    #removeConnection(con) {
        con.destroy();
        this.#connections = removeItem(this.#connections, con);
    }

    // ### ### ### ### ### Game logic ### ### ### ### ###

    dailyUpdate() {
        this.addCoins(this.#nodes.length);
    }

    addCoins(amount) {
        this.#coins += amount;
    }

    #canAffordResident() {
        return this.#coins >= this.#nodeCosts.resident;
    }

    #canAffordCommercial() {
        return this.#coins >= this.#nodeCosts.commercial;
    }

    #canAffordFactory() {
        return this.#coins >= this.#nodeCosts.factory;
    }

    // ### ### ### Public functions for nodes interaction ### ### ###

    findWorkplaceForResident(residentNode) {
        return this.#nodes.find(node =>
            (node instanceof Commercial || node instanceof Factory) &&
            !node.isFullyStaffed() &&
            this.#isWithinRange(residentNode, node, Constants.RESIDENT_COMMUTE_RANGE)
        );
    }

    isNearFactory(residentNode) {
        return this.#nodes.some(node => {
            return node instanceof Factory &&
                this.#isWithinRange(residentNode, node, Constants.FACTORY_DISGUST_RANGE)
        });
    }

    findShopsForResident(residentNode, range) {
        return this.#nodes.filter(
            shop => shop instanceof Commercial && shop.canSell() &&
                this.#isWithinRange(residentNode, shop, range)
        );
    }

    findFirstShopForResident(residentNode) {
        return this.findShopsForResident(residentNode, Constants.SHOPPING_RANGE)[0];
    }

    findCommercialsForFactory(factoryNode) {
        return this.#nodes
            .filter(node =>
                node instanceof Commercial &&
                node.canBuyProduct() &&
                this.#isWithinRange(factoryNode, node, Constants.FACTORY_DELIVERY_RANGE)
            )
            .sort((a, b) => nodeDistance(factoryNode, a) - nodeDistance(factoryNode, b));
    }

    // ### ### ### ### ### Additional functions ### ### ### ### ###

    // Additionally called each game.update()
    onCoinsChange() {
        $('#coins').text(this.#coins);
        $('#buyResidentBtn').toggleClass('btn-disabled', !this.#canAffordResident());
        $('#buyCommercialBtn').toggleClass('btn-disabled', !this.#canAffordCommercial());
        $('#buyFactoryBtn').toggleClass('btn-disabled', !this.#canAffordFactory());
    }

    #onCostsChange() {
        $('#rCost').text(this.#nodeCosts.resident);
        $('#cCost').text(this.#nodeCosts.commercial);
        $('#fCost').text(this.#nodeCosts.factory);
    }

    #onNodeCountChange() {
        let popsCount = this.#nodes.filter(node => node instanceof Resident).length;
        $('#node-score').text(popsCount);
    }

    #isWithinRange(nodeA, nodeB, range) {
        const distance = nodeDistance(nodeA, nodeB);
        return distance <= range;
    }
}