import { Constants } from "./Constants.js";

export class Screen {
    constructor(game) {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.game = game;
        this.size = game.gameState.size;

        this.zoomLevel = 1.0;
        this.dragStart = { x: 0, y: 0 };
        this.offset = { x: 0, y: 0 };

        this.isDragging = false;
        this.placingNode = null;
        this.mouse = { x: -1000, y: -1000 };

        this.animations = [];
        this.icons = {
            disgust: new Image(),
            work: new Image(),
            product: new Image(),
            shop: new Image(),
            coin: new Image(),
            happy: new Image(),
        }
        this.initIcons();
        this.initCanvas();
        this.setupEventListeners();
    }

    initIcons() {
        this.icons.disgust.src = "../assets/img/icon-disgust.png";
        this.icons.work.src = "../assets/img/icon-work.png";
        this.icons.product.src = "../assets/img/icon-product.png";
        this.icons.shop.src = "../assets/img/icon-shop.png";
        this.icons.coin.src = "../assets/img/coin.png";
        this.icons.happy.src = "../assets/img/icon-happy.png";
    }

    initCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.offset.x = (window.innerWidth / 2) - (this.size / 2);
        this.offset.y = (window.innerHeight / 2) - (this.size / 2);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        this.addDragEventListeners();
        this.addZoomEventListeners();
    }

    setSize(size) {
        this.size = size;
    }

    restart() {
        this.animations = [];
        this.render();
    }

    render() {
        // Clear the canvas
        this.ctx.setTransform(this.zoomLevel, 0, 0, this.zoomLevel, this.offset.x, this.offset.y);
        this.ctx.clearRect(-this.offset.x / this.zoomLevel, -this.offset.y / this.zoomLevel, this.canvas.width / this.zoomLevel, this.canvas.height / this.zoomLevel); // Clear the canvas

        // Town border
        this.ctx.strokeStyle = '#505050';
        this.ctx.lineWidth = 5;
        this.ctx.strokeRect(0, 0, this.size, this.size);

        // Town background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.size, this.size);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const gridSize = 50;
        for (let x = 0 + gridSize; x < this.size; x += gridSize) {
            for (let y = 0 + gridSize; y < this.size; y += gridSize) {
                this.ctx.fillText('+', x, y);
            }
        }

        // Roads
        this.game.gameState.connections.forEach(con => {
            if (this.isVisible(con.nodeA) && this.isVisible(con.nodeB)) {
                con.render(this.ctx);
            }
        });

        // Visible nodes
        this.game.gameState.nodes.forEach(node => {
            if (this.isVisible(node)) {
                node.render(this.ctx);
            }
        });

        // Draw other stuff like gained coins

        // New node placing
        if (this.placingNode) {
            const mouseX = (this.mouse.x - this.offset.x) / this.zoomLevel;
            const mouseY = (this.mouse.y - this.offset.y) / this.zoomLevel;

            // Placing area
            this.ctx.fillStyle = '#ffe34530';
            this.ctx.beginPath();
            this.ctx.arc(mouseX, mouseY, Constants.NODE_RANGE, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.strokeStyle = '#ffe34599';
            this.ctx.stroke();

            // Per type ranges
            this.renderPlacementRanges(this.placingNode, mouseX, mouseY);

            // New node itself
            let color = this.getNodeColor(this.placingNode);
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(mouseX, mouseY, Constants.NODE_SIZE, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        // Node animations
        const now = performance.now();
        this.animations = this.animations.filter(anim => now - anim.startTime < 1000);
        this.animations.forEach(anim => {
            if (!this.isVisible(anim.node)) return;

            const progress = (now - anim.startTime) / 1000;
            const alpha = 1 - progress;
            const offsetY = -progress * 20 - Constants.NODE_SIZE * 2;
            const sign = anim.amount > 0 ? "+" : "-";
            const amountText = `${sign}${Math.abs(anim.amount)}`;

            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = "#505050";
            this.ctx.font = "20px Arial";
            const textWidth = this.ctx.measureText(amountText).width;
            const centerX = anim.node.x - textWidth / 2;
            this.ctx.fillText(amountText, centerX, anim.node.y + offsetY);
            if (anim.image) {
                this.ctx.drawImage(anim.image, anim.node.x, anim.node.y + offsetY - 8, 16, 16);
            }

            this.ctx.globalAlpha = 1;
        });

    }

    renderPlacementRanges(nodeType, mouseX, mouseY) {
        this.getNodeInteractionRanges(nodeType).forEach(range => {
            this.ctx.beginPath();
            this.ctx.arc(mouseX, mouseY, range.distance, 0, 2 * Math.PI);
            this.ctx.strokeStyle = range.color;
            this.ctx.stroke();

            const iconY = mouseY + range.distance + 2;
            this.ctx.drawImage(range.icon, mouseX - 10, iconY, 20, 20);
        });
    }

    getNodeInteractionRanges(nodeType) {
        const ranges = [];
        switch (nodeType) {
            case 'resident':
                ranges.push(
                    {
                        distance: Constants.RESIDENT_COMMUTE_RANGE,
                        color: Constants.COLOR_RESIDENT,
                        icon: this.icons.work
                    },
                    {
                        distance: Constants.SHOPPING_RANGE,
                        color: Constants.COLOR_COMMERCIAL,
                        icon: this.icons.shop
                    },
                    {
                        distance: Constants.FACTORY_DISGUST_RANGE,
                        color: Constants.COLOR_FACTORY,
                        icon: this.icons.disgust
                    }
                );
                break;
            case 'commercial':
                ranges.push(
                    {
                        distance: Constants.RESIDENT_COMMUTE_RANGE,
                        color: Constants.COLOR_RESIDENT,
                        icon: this.icons.work
                    },
                    {
                        distance: Constants.SHOPPING_RANGE,
                        color: Constants.COLOR_RESIDENT,
                        icon: this.icons.shop
                    },
                    {
                        distance: Constants.FACTORY_DELIVERY_RANGE,
                        color: Constants.COLOR_FACTORY,
                        icon: this.icons.product
                    }
                );
                break;
            case 'factory':
                ranges.push(
                    {
                        distance: Constants.RESIDENT_COMMUTE_RANGE,
                        color: Constants.COLOR_RESIDENT,
                        icon: this.icons.work
                    },
                    {
                        distance: Constants.FACTORY_DELIVERY_RANGE,
                        color: Constants.COLOR_COMMERCIAL,
                        icon: this.icons.product
                    },
                    {
                        distance: Constants.FACTORY_DISGUST_RANGE,
                        color: Constants.COLOR_RESIDENT,
                        icon: this.icons.disgust
                    }
                );
                break;
        }
        return ranges;
    }

    addNodeAnimation(node, type, amount) {
        const animImage = {
            wealthGain: this.icons.coin,
            productGain: this.icons.product,
            happinessGain: this.icons.happy
        }[type];
        this.animations.push({
            node: node,
            amount: amount,
            startTime: performance.now(),
            image: animImage
        });
    }


    // ### ### ### ### ### Screen <=> Town position coords. ### ### ### ### ###

    screenToTown(screenX, screenY) {
        return {
            x: (screenX - this.offset.x) / this.zoomLevel,
            y: (screenY - this.offset.y) / this.zoomLevel
        };
    }

    townToScreen(townX, townY) {
        return {
            x: (townX * this.zoomLevel) + this.offset.x,
            y: (townY * this.zoomLevel) + this.offset.y
        };
    }

    // ### ### ### ### ### Additional Functions ### ### ### ### ###

    isVisible(node) {
        const nodeSize = Constants.NODE_SIZE * this.zoomLevel;
        const left = (-this.offset.x) / this.zoomLevel;
        const right = (-this.offset.x + window.innerWidth) / this.zoomLevel;
        const top = (-this.offset.y) / this.zoomLevel;
        const bottom = (-this.offset.y + window.innerHeight) / this.zoomLevel;

        return (node.x + nodeSize > left && node.x - nodeSize < right &&
            node.y + nodeSize > top && node.y - nodeSize < bottom);
    }

    getNodeColor(nodeType) {
        switch (nodeType) {
            case 'resident':
                return Constants.COLOR_RESIDENT;
            case 'commercial':
                return Constants.COLOR_COMMERCIAL;
            case 'factory':
                return Constants.COLOR_FACTORY;
            default:
                return 'transparent';
        }
    }

    zoom(delta, x, y) {
        const newZoomLevel = this.zoomLevel + delta;
        if (newZoomLevel >= Constants.ZOOM_MAX || newZoomLevel <= Constants.ZOOM_MIN) return;
        const zoomFactor = newZoomLevel / this.zoomLevel;
        this.offset.x = x - (x - this.offset.x) * zoomFactor;
        this.offset.y = y - (y - this.offset.y) * zoomFactor;
        this.zoomLevel = newZoomLevel;
        this.updateZoomDisplay();
        this.render();
    }

    updateZoomDisplay() {
        const zoomLevelEl = document.getElementById('zoomLevel');
        zoomLevelEl.innerText = this.zoomLevel.toFixed(2);
    }

    placeNode(type) {
        this.placingNode = type;
        const handleClick = (event) => {
            this.spawnNode(type, event);
            this.canvas.removeEventListener('click', handleClick);
        };
        this.canvas.addEventListener('click', handleClick);
    }

    spawnNode(nodeType, event) {
        this.placingNode = null;
        this.mouse.x = -1000;
        this.mouse.y = -1000;
        const x = (event.clientX - this.offset.x) / this.zoomLevel;
        const y = (event.clientY - this.offset.y) / this.zoomLevel;
        this.game.spawnNode(nodeType, x, y, this.addNodeAnimation.bind(this));
        this.render();
    }

    getNodeAnimationFunction() {
        return this.addNodeAnimation.bind(this);
    }

    // ### ### ### ### ### Event Listeners ### ### ### ### ###

    onResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.offset.x = (window.innerWidth / 2) - (this.size / 2) * this.zoomLevel;
        this.offset.y = (window.innerHeight / 2) - (this.size / 2) * this.zoomLevel;
        this.render();
    }

    addDragEventListeners() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.canvas.style.cursor = "grabbing";
        this.dragStart.x = event.clientX - this.offset.x;
        this.dragStart.y = event.clientY - this.offset.y;
    }

    onMouseMove(event) {
        if (this.isDragging) {
            event.preventDefault();
            this.offset.x = event.clientX - this.dragStart.x;
            this.offset.y = event.clientY - this.dragStart.y;
            this.render();
        }
        if (this.placingNode) {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
            this.render();
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = "initial";
    }

    addZoomEventListeners() {
        this.canvas.addEventListener('wheel', this.onMouseZoom.bind(this));
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.zoom(Constants.ZOOM_BTN_FACTOR, window.innerWidth / 2, window.innerHeight / 2);
        });
        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.zoom(-Constants.ZOOM_BTN_FACTOR, window.innerWidth / 2, window.innerHeight / 2);
        });
    }

    onMouseZoom(event) {
        event.preventDefault();
        let deltaSgn = event.deltaY < 0 ? 1 : -1;
        this.zoom(deltaSgn * Constants.ZOOM_MOUSE_FACTOR, event.clientX, event.clientY);
    }
}