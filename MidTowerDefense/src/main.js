import { Map, TILE_SIZE, DEFAULT_MAP_SIZE, isDirectionOccupied, getAvailableDirections } from './game/map.js';
import { Crystal } from './game/crystal.js';
import { MapRenderer } from './renderer/map_renderer.js';
import { Tower } from './game/tower.js';
import { Enemy } from './game/enemy.js';
import { EntityManager } from './game/entity_manager.js';
import { SkillManager } from './game/skill_manager.js';
import { ProjectileManager } from './game/projectile.js';

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
        this.entityManager = new EntityManager();
        this.occupiedDirections = [];
        this.spawnTimer = 0;
        this.spawnInterval = 0.5;
        this.enemiesPerSpawn = 3;
        this.skillManager = new SkillManager();
        this.skillManager.initWithRandomSkills();
        this.projectiles = new ProjectileManager();

        this.spawnTower(12, 12);
    }

    update(deltaTime) {
        this.crystal.update(deltaTime);
        this.entityManager.update(deltaTime / 1000, this.crystal);
        this.projectiles.update(deltaTime / 1000, this.entityManager);

        this.spawnTimer += deltaTime / 1000;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            for (let i = 0; i < this.enemiesPerSpawn; i++) {
                this.spawnEnemy();
            }
        }
    }

    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: x = -30; y = Math.random() * canvas.height; break;
            case 1: x = canvas.width + 30; y = Math.random() * canvas.height; break;
            case 2: x = Math.random() * canvas.width; y = -30; break;
            case 3: x = Math.random() * canvas.width; y = canvas.height + 30; break;
        }

        const enemy = new Enemy(x, y);
        enemy.setTarget(this.crystal);
        this.entityManager.addEntity(enemy);
    }

    spawnTower(gridX, gridY, applySkills = true) {
        const worldX = gridX * TILE_SIZE + TILE_SIZE / 2;
        const worldY = gridY * TILE_SIZE + TILE_SIZE / 2;
        const tower = new Tower(worldX, worldY);
        
        if (applySkills) {
            tower.applySkill(this);
        }
        
        this.entityManager.addEntity(tower);
        return tower;
    }

    render() {
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.mapRenderer.renderMap(this.map, this.crystal, this.occupiedDirections);
        this.entityManager.render(this.ctx);
        this.projectiles.render(this.ctx);
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
        this.entityManager.clear();
        this.spawnTimer = 0;
    }
}

const gameInstance = new Game(canvas, ctx);
gameInstance.start();

window.gameInstance = gameInstance;