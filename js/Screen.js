import { Constants } from "./Constants.js";

export class Screen {
    constructor(game) {
        this.canvasWrapper = document.getElementById('canvasWrapper');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.game = game;

        this.initCanvas();
        this.setupEventListeners();
    }

    initCanvas() {
        this.canvas.width = this.game.gameState.size;
        this.canvas.height = this.game.gameState.size;
    }

    setupEventListeners() {
        // event listeners - drag, add, remove, scroll, zoom ...
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw canvas border
        
        // Draw canvas bg
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Semi-transparent color for grid
        this.ctx.font = '12px Arial';
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
        console.log('Nodes should be rendered', this.game.gameState.nodes.size);

        // Draw other stuff like gained coins
    }

}