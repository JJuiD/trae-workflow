import { Map, TILE_SIZE, DEFAULT_MAP_SIZE, DIRECTION, getPlayerWorldPosition, isDirectionOccupied, getAvailableDirections } from './game/map.js';
import { Crystal } from './game/crystal.js';
import { MapRenderer } from './renderer/map_renderer.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = DEFAULT_MAP_SIZE * TILE_SIZE;
canvas.height = DEFAULT_MAP_SIZE * TILE_SIZE;

class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.lastTime = 0;
        this.map = new Map(DEFAULT_MAP_SIZE);
        const centerPos = this.map.getCenterWorld();
        this.crystal = new Crystal(centerPos.x, centerPos.y);
        this.mapRenderer = new MapRenderer(ctx, TILE_SIZE);
        this.occupiedDirections = [];
    }

    update(deltaTime) {
        this.crystal.update(deltaTime);
    }

    render() {
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.mapRenderer.renderMap(this.map, this.crystal, this.occupiedDirections);
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        requestAnimationFrame((time) => {
            this.lastTime = time;
            this.gameLoop(time);
        });
    }

    selectDirection(direction) {
        if (isDirectionOccupied(direction, this.occupiedDirections)) {
            return false;
        }
        this.occupiedDirections.push(direction);
        return true;
    }

    getAvailableDirections() {
        return getAvailableDirections(this.occupiedDirections);
    }

    resetGame() {
        this.occupiedDirections = [];
        this.crystal.reset();
    }
}

const gameInstance = new Game(canvas, ctx);
gameInstance.start();

window.gameInstance = gameInstance;