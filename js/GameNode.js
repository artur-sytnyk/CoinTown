import { Constants } from './Constants.js';
import { getRandomInt, removeItem } from './utils.js';


// Nodes are "Buildings"
export default class Node {
    constructor(x, y, nodeAnimation = null) {
        this.x = x;
        this.y = y;
        this.connections = [];
        this.nodeAnimation = nodeAnimation;
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


    wealthGainAnim(amount) {
        if (this.nodeAnimation) this.nodeAnimation(this, 'wealthGain', amount);
    }

    productGainAnim(amount) {
        if (this.nodeAnimation) this.nodeAnimation(this, 'productGain', amount);
    }

    happinessGainAnim(amount) {
        if (this.nodeAnimation) this.nodeAnimation(this, 'happinessGain', amount);
    }
}



// "Administration"
export class CentralNode extends Node {
    toJSON() {
        return {
            type: 'central',
            x: this.x,
            y: this.y
        }
    }

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
        if (gameState.mode = Constants.GAME_MODE_NORMAL &&
            updateCounter % Constants.CENTRAL_NODE_GAIN_DELAY === 0
        ) gameState.addCoins(1);
    }
}



// Residents
export class Resident extends Node {
    constructor(x, y, nodeAnimation = null, wealth = 2) {
        super(x, y, nodeAnimation);
        this.type = 'resident';
        this.workplace = null;
        this.wealth = wealth;
        this.happiness = 50;
        this.happinessChange = 0;
        this.isShopping = false;
    }

    toJSON() {
        return {
            type: this.type,
            x: this.x,
            y: this.y
        }
    }

    render(ctx) {
        super.render(ctx, Constants.COLOR_RESIDENT);
    }

    update(updateCounter, gameState) {
        if (!this.workplace) this.findWorkplace(gameState);

        if (this.wealth > 0 && updateCounter >= 8 && updateCounter <= 16) {
            if (this.isShopping) {
                this.continueShopping(gameState);
            } else {
                this.startShopping(gameState);
            }
        }
        else if (updateCounter === 17) {
            if (this.isShopping) {
                this.happinessChange += 10;
                this.happinessGainAnim(10);
            }
            this.isShopping = false;
        }
        else if (updateCounter === 24) {
            // -10 base, +10 wage, +10 if shopped, -5 if close to factory
            if (gameState.isNearFactory(this)) this.happinessChange -= 5;
            this.happiness = Math.min(
                this.happiness + this.happinessChange,
                Constants.HAPPINESS_LIMIT
            );
            this.happinessChange = -10;
        }

        if (this.happiness <= 0) this.destroy(gameState);
    }

    destroy(gameState) {
        this.leaveWorkplace();
        gameState.removeNode(this);
    }

    findWorkplace(gameState) {
        let workplace = gameState.findWorkplaceForResident(this);
        if (!workplace) return;
        this.workplace = workplace;
        this.workplace.addWorker(this);
    }

    leaveWorkplace() {
        if (this.workplace) this.workplace.removeWorker(this);
        this.workplace = null;
    }

    getPaid() {
        this.wealth++;
        this.happinessChange += 10;
    }

    startShopping(gameState) {
        let firstShop = gameState.findFirstShopForResident(this);
        if (!firstShop) return;
        this.visitShop(firstShop);
    }

    continueShopping(gameState) {
        let nextShop = gameState.findFirstShopForResident(this, Constants.SHOPPING_CHAIN_RANGE);
        if (!nextShop) return;
        this.visitShop(nextShop);
    }

    visitShop(shop) {
        shop.sellProduct();
        this.wealth--;
        this.isShopping = true;
    }
}



// Workplaces
export class Commercial extends Node {
    constructor(x, y, nodeAnimation = null, wealth = 3, productCount = 0, productLimit = 100, workerLimit = 1) {
        super(x, y, nodeAnimation);
        this.type = 'commercial';
        this.wealth = wealth;
        this.productCount = productCount;
        this.productLimit = productLimit;
        this.happiness = 50;
        this.happinessChange = 0;
        this.workplace = new WorkPlace(workerLimit);
    }

    toJSON() {
        return {
            type: this.type,
            x: this.x,
            y: this.y
        }
    }

    render(ctx) {
        super.render(ctx, Constants.COLOR_COMMERCIAL);
    }

    update(updateCounter, gameState) {
        if (updateCounter === 8) {
            this.payWorkers();
        } else if (updateCounter === 24) {
            // -5 base, +5 when worked, +2 for each sold product
            this.happiness = Math.min(
                this.happiness + this.happinessChange,
                Constants.HAPPINESS_LIMIT
            );
            this.happinessChange = -5;
        }

        if (this.happiness <= 0) this.destroy(gameState);
    }

    destroy(gameState) {
        if (Constants.DESTROYED_NODES_RETURN_WEALTH) gameState.addCoins(this.wealth);
        this.workplace.workers.forEach(worker => worker.leaveWorkplace());
        gameState.removeNode(this);
    }

    sellProduct() {
        this.wealth++;
        this.productCount--;
        this.happinessChange += Constants.SOLD_PRODUCT_HAPPINESS_CHANGE;
        this.wealthGainAnim(1);
    }

    canSell() {
        return this.isWorked() && this.productCount > 0;
    }

    canBuyProduct() {
        return this.productLimit > this.productCount && this.wealth > 0;
    }

    buyProducts(availableAmount) {
        let productSpaceLeft = this.productLimit - this.productCount;
        let maximumOrder = Math.floor(this.wealth / Constants.FACTORY_PRODUCT_PRICE);
        let orderedCount = Math.min(maximumOrder, availableAmount, productSpaceLeft);

        this.wealth -= orderedCount * Constants.FACTORY_PRODUCT_PRICE;
        this.productCount += orderedCount;
        this.productGainAnim(orderedCount);
        return orderedCount;
    }


    // Workplace methods
    isFullyStaffed() {
        return this.workplace.isFullyStaffed();
    }

    isWorked() {
        return this.workplace.isWorked();
    }

    addWorker(worker) {
        this.workplace.addWorker(worker);
    }

    removeWorker(worker) {
        this.workplace.removeWorker(worker);
    }

    payWorkers() {
        let wages = this.workplace.workers.length;
        if (this.wealth >= wages) {
            this.wealth -= wages;
            this.happinessChange += 5;
            this.workplace.payWorkers();
        }
    }
}



export class Factory extends Node {
    constructor(x, y, nodeAnimation = null, wealth = 2, productCount = 0, productLimit = 100, workerLimit = 1) {
        super(x, y, nodeAnimation);
        this.type = 'factory';
        this.wealth = wealth;
        this.productCount = productCount;
        this.productLimit = productLimit;
        this.productMultiplier = 2;
        this.happiness = 50;
        this.happinessChange = 0;
        this.workplace = new WorkPlace(workerLimit);
    }

    toJSON() {
        return {
            type: this.type,
            x: this.x,
            y: this.y
        }
    }

    render(ctx) {
        super.render(ctx, Constants.COLOR_FACTORY);
    }

    update(updateCounter, gameState) {
        if (this.productCount > 0) this.distributeProduct(gameState);

        if (updateCounter === 8) {
            let productAmount = this.workplace.workers.length * this.productMultiplier;
            this.produceProduct(productAmount);
            this.productGainAnim(productAmount);
            this.payWorkers();
        } else if (updateCounter === 24) {
            // -10 base, +10 when worked, +10 for product distribution
            this.happiness = Math.min(
                this.happiness + this.happinessChange,
                Constants.HAPPINESS_LIMIT);
            this.happinessChange = -10;
        }

        if (this.happiness <= 0) this.destroy(gameState);
    }

    destroy(gameState) {
        this.workplace.workers.forEach(worker => worker.leaveWorkplace());
        gameState.removeNode(this);
    }

    produceProduct(amount) {
        this.productCount = Math.min(this.productCount + amount, this.productLimit);
    }

    distributeProduct(gameState) {
        let commercials = gameState.findCommercialsForFactory(this);
        if (!commercials || commercials.length === 0) return;
        for (let commercial of commercials) {
            if (this.productCount <= 0) break;
            this.sellProduct(commercial);
        }
    }

    sellProduct(commercial) {
        let orderedCount = commercial.buyProducts(this.productCount);
        this.productCount -= orderedCount;
        this.wealth += orderedCount;
        this.wealthGainAnim(orderedCount);
        this.happinessChange += 10;
    }

    // Workplace methods
    isFullyStaffed() {
        return this.workplace.isFullyStaffed();
    }

    isWorked() {
        return this.workplace.isWorked();
    }

    addWorker(worker) {
        this.workplace.addWorker(worker);
    }

    removeWorker(worker) {
        this.workplace.removeWorker(worker);
    }

    payWorkers() {
        let wages = this.workplace.workers.length;
        if (this.wealth >= wages) {
            this.wealth -= wages;
            this.happinessChange += 10;
            this.workplace.payWorkers();
        }
    }
}



class WorkPlace {
    constructor(workerLimit = 1) {
        this.workers = [];
        this.workerLimit = workerLimit;
    }

    isFullyStaffed() {
        return this.workers.length >= this.workerLimit;
    }

    isWorked() {
        return this.workers.length > 0
    }

    addWorker(worker) {
        if (!this.isFullyStaffed()) this.workers.push(worker);
    }

    removeWorker(worker) {
        this.workers = removeItem(this.workers, worker);
    }

    payWorkers() {
        this.workers.forEach(worker => {
            worker.getPaid();
        })
    }
}
