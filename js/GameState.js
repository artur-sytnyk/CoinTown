import { Constants } from "./Constants.js";
import { Resident, Commercial, Factory, CentralNode } from './GameNode.js';
import { Connection } from "./Connection.js";
import { nodeDistance, removeItem } from "./utils.js";

export class GameState {
    constructor(size = Constants.SMALL_TOWN_SIZE, mode = Constants.GAME_MODE_NORMAL) {
        this.coins = Constants.STARTING_COINS;
        this.nodeCosts = {
            resident: 0,
            commercial: 0,
            factory: 0
        };
        this.size = size;
        this.mode = mode;
        this.nodes = [new CentralNode(size / 2, size / 2)];
        this.connections = [];
        this.onCoinsChange();
        this.onNodeCountChange();
        this.onCostsChange();
    }

    loadFromState(gameState) {
        this.coins = gameState.coins;
        this.nodeCosts = gameState.nodeCosts;
        this.size = gameState.size;
        this.mode = gameState.mode;
        this.nodes = [];
        this.connections = [];
        this.onCoinsChange();
        this.onNodeCountChange();
        this.onCostsChange();
    }

    // ### ### ### ### ### Node functions ### ### ### ### ###

    addNode(node) {
        this.nodes.push(node);
        this.onNodeCountChange();
    }

    removeNode(node) {
        node.connections.forEach(con => this.removeConnection(con));
        this.nodes = removeItem(this.nodes, node);
        this.onNodeCountChange();
    }

    spawnNode(node) {
        this.payForNode(node);
        this.connectNode(node);
        this.addNode(node);
        this.increaseCost(node);
        this.onCoinsChange();
        this.onCostsChange();
    }

    loadNode(node) {
        this.connectNode(node);
        this.addNode(node);
    }

    payForNode(node) {
        if (node instanceof Resident)
            this.coins -= this.nodeCosts.resident;
        else if (node instanceof Commercial)
            this.coins -= this.nodeCosts.commercial;
        else if (node instanceof Factory)
            this.coins -= this.nodeCosts.factory;
    }

    increaseCost(node) {
        if (node instanceof Resident)
            this.nodeCosts.resident += Constants.COST_INCREASE_R;
        else if (node instanceof Commercial)
            this.nodeCosts.commercial += Constants.COST_INCREASE_C;
        else if (node instanceof Factory)
            this.nodeCosts.factory += Constants.COST_INCREASE_F;
    }

    connectNode(newNode) {
        let minDistance = Infinity;
        let closestNode = null;
        this.nodes.forEach(node => {
            if (!node.isConnectable) return;
            let distance = nodeDistance(node, newNode);
            if (distance < minDistance) {
                minDistance = distance;
                closestNode = node;
            }
        });
        this.createConnection(closestNode, newNode);
    }

    createConnection(nodeA, nodeB) {
        const newCon = new Connection(nodeA, nodeB);
        nodeA.addConnection(newCon);
        nodeB.addConnection(newCon);
        this.connections.push(newCon);
    }

    removeConnection(con) {
        con.destroy();
        this.connections = removeItem(this.connections, con);
    }

    // ### ### ### ### ### Game logic ### ### ### ### ###

    addCoins(amount) {
        this.coins += amount;
        console.info("coins increased:",amount);
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

    findWorkplaceForResident(residentNode) {
        const workplace = this.nodes.find(node =>
            (node instanceof Commercial || node instanceof Factory) && !node.isFullyStaffed()
        );
        if (workplace) {
            residentNode.workplace = workplace;
            workplace.addWorker(residentNode);
        }
    }

    isNearFactory(residentNode) {
        return this.nodes.some(node => {
            return node instanceof Factory &&
                nodeDistance(residentNode, node) <= Constants.FACTORY_DISGUST_RANGE;
        });
    }

    createShoppingRoute(residentNode) {
        const shoppingRoute = [];
        let availableShops = this.nodes.filter(
            shop => shop instanceof Commercial && shop.hasProduct()
        );
        if (!availableShops.length) return shoppingRoute;

        // Find first commercial to shop
        let firstShop = availableShops.find(
            shop => nodeDistance(residentNode, shop) <= Constants.SHOPPING_RANGE
        );
        if (!firstShop) return shoppingRoute;
        shoppingRoute.push(firstShop);
        availableShops = removeItem(availableShops, firstShop);

        // Commercials to continue shopping
        let lastShop = firstShop;
        for (let i = 0; i < 7; i++) {
            const nextShop = availableShops.find(
                shop => nodeDistance(lastShop, shop) <= Constants.SHOPPING_CHAIN_RANGE
            );
            if (!nextShop) break;
            shoppingRoute.push(nextShop);
            availableShops = removeItem(availableShops, nextShop);
            lastShop = nextShop;
        }

        return shoppingRoute;
    }

    findCommercialsForFactory(factoryNode) {
        factoryNode.productBuyers = this.nodes
            .filter(node =>
                node instanceof Commercial &&
                node.canBuyProduct() &&
                nodeDistance(factoryNode, node) <= Constants.FACTORY_DELIVERY_RANGE
            )
            .sort((a, b) => nodeDistance(factoryNode, a) - nodeDistance(factoryNode, b));
    }

    // ### ### ### ### ### Additional functions ### ### ### ### ###

    // Additionally called each game.update()
    onCoinsChange() {
        document.getElementById('coins').innerText = this.coins;
        if (!this.canAffordResident()) document.getElementById('buyResidentBtn').classList.add("btn-disabled");
        else document.getElementById('buyResidentBtn').classList.remove("btn-disabled");
        if (!this.canAffordCommercial()) document.getElementById('buyCommercialBtn').classList.add("btn-disabled");
        else document.getElementById('buyCommercialBtn').classList.remove("btn-disabled");
        if (!this.canAffordFactory()) document.getElementById('buyFactoryBtn').classList.add("btn-disabled");
        else document.getElementById('buyFactoryBtn').classList.remove("btn-disabled");
    }

    onCostsChange() {
        document.getElementById('rCost').innerText = this.nodeCosts.resident;
        document.getElementById('cCost').innerText = this.nodeCosts.commercial;
        document.getElementById('fCost').innerText = this.nodeCosts.factory;
    }

    onNodeCountChange() {
        document.getElementById('node-score').innerText = this.nodes.length;
    }

    isWithinRange(nodeA, nodeB, range) {
        const distance = nodeDistance(nodeA, nodeB);
        return distance <= range;
    }
}