import { Constants } from "./Constants.js";

export class Screen {
    constructor(game) {
        this.canvasWrapper = document.getElementById('canvasWrapper');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.game = game;

        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.canvasOffset = { x: 0, y: 0 };

        this.initCanvas();
        this.setupEventListeners();
    }

    initCanvas() {
        this.canvas.width = this.game.gameState.size;
        this.canvas.height = this.game.gameState.size;

        this.canvasOffset.x = (window.innerWidth / 2) - (this.canvas.width / 2);
        this.canvasOffset.y = (window.innerHeight / 2) - (this.canvas.height / 2);
        this.canvas.style.transform = `translate(${this.canvasOffset.x}px, ${this.canvasOffset.y}px)`;

        console.info('Canvas initialized');
    }

    setupEventListeners() {
        this.addDragEventListeners();
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw canvas border
        
        // Draw canvas bg
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Semi-transparent color for grid
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const gridSize = 50;
        for (let x = 0 + gridSize; x < this.canvas.width; x += gridSize) {
            for (let y = 0 + gridSize; y < this.canvas.height; y += gridSize) {
                this.ctx.fillText('+', x, y);
            }
        }

        // Draw node roads? (connections)

        // Draw nodes
        this.game.gameState.nodes.forEach(node => {
            if(this.isVisible(node)) {
                node.render(this.ctx);
            }
            else {console.log('Node not visible');
            }
        });

        // Draw other stuff like gained coins
    }

    // ### ### ### ### ### Additional Functions ### ### ### ### ###
    isVisible(node) {
        const nodeSize = Constants.NODE_SIZE * 2;
        return node.x + nodeSize > -this.canvasOffset.x && 
               node.x - nodeSize < -this.canvasOffset.x + window.innerWidth &&
               node.y + nodeSize > -this.canvasOffset.y && 
               node.y - nodeSize < -this.canvasOffset.y + window.innerHeight;
    }

    // ### ### ### ### ### Event Listeners ### ### ### ### ###
    addDragEventListeners() {
        this.canvasWrapper.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvasWrapper.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvasWrapper.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.canvas.style.cursor = "grabbing";
        this.canvasWrapper.style.cursor = "grabbing";
        this.dragStart.x = event.clientX - this.canvasOffset.x;
        this.dragStart.y = event.clientY - this.canvasOffset.y;
    }

    onMouseMove(event) {
        if (this.isDragging) {
            event.preventDefault();
            this.canvasOffset.x = event.clientX - this.dragStart.x;
            this.canvasOffset.y = event.clientY - this.dragStart.y;
            this.canvas.style.transform = `translate(${this.canvasOffset.x}px, ${this.canvasOffset.y}px)`;
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = "initial";
        this.canvasWrapper.style.cursor = "grab";
    }
}