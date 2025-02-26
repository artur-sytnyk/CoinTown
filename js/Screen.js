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

        this.initCanvas();
        this.setupEventListeners();
    }

    initCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.offset.x = (window.innerWidth / 2) - (this.size / 2);
        this.offset.y = (window.innerHeight / 2) - (this.size / 2);
        console.info('Canvas initialized');
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        this.addDragEventListeners();
        this.addZoomEventListeners();
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
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Semi-transparent color for grid
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const gridSize = 50;
        for (let x = 0 + gridSize; x < this.size; x += gridSize) {
            for (let y = 0 + gridSize; y < this.size; y += gridSize) {
                this.ctx.fillText('+', x, y);
            }
        }

        // Draw node roads? (connections)

        // Draw nodes
        this.game.gameState.nodes.forEach(node => {
            if (this.isVisible(node)) {
                node.render(this.ctx);
            } else { console.log('Node not visible') }
        });

        // Draw other stuff like gained coins
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