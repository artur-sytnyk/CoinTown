import { Constants } from './Constants.js';
import { getRandomInt, removeItem } from './utils.js';

// Nodes are "Buildings"
export default class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.connections = [];
        console.log('Node created at', x, y);
    }

    render(ctx, color = 'black') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Constants.NODE_SIZE, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    addConnection(node) {
        this.connections.push(node);
    }

    removeConnection(node) {
        this.connections = removeItem(this.connections, node);
    }

    isConnectable() {
        return this.connections.length < Constants.CONNECTIONS_LIMIT;
    }

    update() { }
}

// "Administration"
export class CentralNode extends Node {
    render(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Constants.NODE_SIZE * 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#d0d0d0';
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    update(updateCounter, gameState) {
        if (updateCounter % 4 === 0) gameState.addCoins(1);
    }
}

// Residents
export class Resident extends Node {
    constructor(x, y, wealth = 0) {
        super(x, y);
        this.workplace = null;
        this.wealth = wealth;
        this.happiness = 50;
        this.isShopping = false;
        this.shoppedToday = 0;
        this.shoppingRoute = [];
    }

    render(ctx) {
        super.render(ctx, Constants.COLOR_RESIDENT);
    }

    update(updateCounter, gameState) {
        if (!this.workplace) gameState.findWorkplaceForResident(this);
        else if (updateCounter <= 8) this.workplace.work();
        else if (updateCounter <= 16) {
            if (this.isShopping) {
                this.continueShopping();
            } else {
                this.startShopping(gameState);
            }
        }

        if (updateCounter === 24) {
            let happinessChange = (this.shoppedToday > 0) ? 10 + 5 * (this.shoppedToday - 1) : -10;
            if (gameState.isNearFactory(this)) happinessChange -= 15;
            this.happiness = Math.min(this.happiness + happinessChange, Constants.HAPPINESS_LIMIT);
        }
        if (this.happiness <= 0) this.destroy(gameState);
    }

    destroy(gameState) {
        this.leaveWorkplace();
        this.shoppingRoute = [];
        gameState.removeNode(this);
    }

    leaveWorkplace() {
        this.workplace.removeWorker(this);
        this.workplace = null;
    }

    addWealth(amount) {
        this.wealth += amount;
    }

    startShopping(gameState) {
        this.isShopping = true;
        if (this.wealth <= 0) return;
        this.shoppingRoute = gameState.createShoppingRoute(this);
        this.visitShop();
    }

    continueShopping() {
        this.shoppingRoute = this.shoppingRoute.filter(shop => shop.hasProduct());
        if (this.shoppingRoute.length <= 0) return;
        this.visitShop();
        if (this.shoppingRoute.length === 1 && getRandomInt(3) > 0) {
            this.shoppingRoute.shift();
        }
    }

    visitShop() {
        this.shoppingRoute[0].shop();
        this.wealth--;
        this.shoppedToday++;
    }
}

// Workplaces
export class Commercial extends Node {
    constructor(x, y, wealth = 0, productCount = 0, productLimit = 100, workerLimit = 1) {
        super(x, y);
        this.wealth = wealth;
        this.wealthToday = 0;
        this.productCount = productCount;
        this.productLimit = productLimit;
        this.happiness = 50;
        this.happinessChange = 0;
        this.workplace = new WorkPlace(workerLimit);
    }

    render(ctx) {
        super.render(ctx, Constants.COLOR_COMMERCIAL);
    }

    update(updateCounter, gameState) {
        if (updateCounter === 24) {
            // Wealth
            this.distributeWealth(gameState);
            this.wealthToday = 0;

            // Worked today
            this.happinessChange += (this.workplace.workedToday) ? 10 : -10;
            this.workplace.workedToday = false;

            // Hapiness calc
            this.happiness += this.happinessChange;
            this.happinessChange = 0;
        }

        if (this.happiness <= 0) this.destroy(gameState);
    }

    destroy(gameState) {
        this.wealthToday += this.wealth;
        this.distributeWealth(gameState);
        this.workplace.workers.forEach(worker => worker.leaveWorkplace());
        gameState.removeNode(this);
    }

    shop() {
        this.wealthToday++;
        this.productCount--;
        this.happinessChange++;
    }

    hasProduct() {
        return this.productCount > 0;
    }

    canBuyProduct() {
        return (this.productLimit > this.productCount) && this.wealth > 0;
    }

    buyProducts(availableAmount) {
        let productSpaceLeft = this.productLimit - this.productCount;
        let orderCount = Math.min(this.wealth, availableAmount, productSpaceLeft);
        this.wealth -= orderCount;
        this.productCount += orderCount;
        return orderCount;
    }

    distributeWealth(gameState) {
        if (this.wealthToday <= 0) {
            this.happinessChange -= 10;
            return;
        }

        let totalWorkers = this.workplace.workers.length;
        if (totalWorkers === 0) {
            let tax = Math.floor(this.wealthToday / 3);
            gameState.addCoins(tax);
            this.wealth += this.wealthToday - tax;
            return;
        }
        if (this.wealthToday >= totalWorkers) this.happinessChange += 10;

        // Wealth split
        let portion = Math.floor(this.wealthToday / 3);
        // Wages
        let workerPayment = Math.floor(portion / totalWorkers);
        this.workplace.workers.forEach(worker => worker.addWealth(workerPayment));
        // Taxes
        gameState.addCoins(portion);
        // Own growth
        this.wealth += portion;
        this.wealth += this.wealthToday - (portion * 3);
    }

    // Workplace methods
    isFullyStaffed() {
        return this.workplace.isFullyStaffed();
    }

    addWorker(worker) {
        this.workplace.addWorker(worker);
    }

    removeWorker(worker) {
        this.workplace.removeWorker(worker);
    }

    work() {
        this.workplace.work();
    }
}

export class Factory extends Node {
    constructor(x, y, wealth = 0, productCount = 0, productLimit = 100, workerLimit = 1) {
        super(x, y);
        this.wealth = wealth;
        this.productCount = productCount;
        this.productLimit = productLimit;
        this.productMultiplier = 2;
        this.productBuyers = [];
        this.distributedToday = false;
        this.happiness = 50;
        this.happinessChange = 0;
        this.workplace = new WorkPlace(workerLimit);
    }

    render(ctx) {
        super.render(ctx, Constants.COLOR_FACTORY);
    }

    update(updateCounter, gameState) {
        // Start of day - distribute product
        if (this.productCount > 0) this.distributeProduct(gameState);
        // Worker shift end, + product, - wages
        if (updateCounter === 8) {
            let totalWorkers = this.workplace.workers.length;
            this.addProduct(totalWorkers * this.productMultiplier);
            if (this.wealth >= totalWorkers * this.productMultiplier) {
                this.happinessChange += 5;
                this.workplace.workers.forEach(worker => {
                    this.wealth -= this.productMultiplier;
                    worker.addWealth(this.productMultiplier);
                });
            } else {
                this.happinessChange -= 10;
            }
        }
        // Day end
        if (updateCounter === 24) {
            // Worked and/or sold today
            this.happinessChange += (this.workplace.workedToday) ? 10 : -10;
            this.happinessChange += (this.distributedToday) ? + 10 : -10;
            this.workplace.workedToday = false;
            this.distributedToday = false;
            // Hapiness calc
            this.happiness += this.happinessChange;
            this.happinessChange = 0;
        }

        if (this.happiness <= 0) this.destroy();
    }

    destroy() {
        this.workplace.workers.forEach(worker => worker.leaveWorkplace());
        gameState.removeNode(this);
    }

    addProduct(amount) {
        this.productCount = Math.min(this.productCount + amount, this.productLimit);
    }

    distributeProduct(gameState) {
        if (this.productCount <= 0) return;
        gameState.findCommercialsForFactory(this);
        if (this.productBuyers.length <= 0) return;
        for (let commercial of this.productBuyers) {
            if (this.productCount <= 0 || !commercial.canBuyProduct()) break;
            let orderCount = commercial.buyProducts(this.productCount);
            this.productCount -= orderCount;
            this.wealth += orderCount;
        }
    }

    // Workplace methods
    isFullyStaffed() {
        return this.workplace.isFullyStaffed();
    }

    addWorker(worker) {
        this.workplace.addWorker(worker);
    }

    removeWorker(worker) {
        this.workplace.removeWorker(worker);
    }

    work() {
        this.workplace.work();
    }
}

class WorkPlace {
    constructor(workerLimit = 1) {
        this.workers = [];
        this.workerLimit = workerLimit;
        this.workedToday = false;
    }

    isFullyStaffed() {
        return this.workers.length >= workerLimit;
    }

    addWorker(worker) {
        if (!this.isFullyStaffed()) this.workers.push(worker);
    }

    removeWorker(worker) {
        this.workers = removeItem(this.workers, worker);
    }

    work() {
        this.workedToday = true;
    }
}
