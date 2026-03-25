import { Map, TILE_SIZE, DEFAULT_MAP_SIZE, isDirectionOccupied, getAvailableDirections } from './game/map.js';
import { Crystal } from './game/crystal.js';
import { MapRenderer } from './renderer/map_renderer.js';
import { Tower } from './game/tower.js';
import { Enemy } from './game/enemy.js';
import { EntityManager } from './game/entity_manager.js';
import { SkillManager } from './game/skill_manager.js';
import { ProjectileManager } from './game/projectile.js';
import { TowerFactory } from './game/tower_factory.js';
import { getAllTowerTypes } from './game/tower_types.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = DEFAULT_MAP_SIZE * TILE_SIZE;
canvas.height = DEFAULT_MAP_SIZE * TILE_SIZE;

let gameInstance = null;
let selectedTowerType = null;

function showTowerSelection() {
    const selectionDiv = document.getElementById('towerSelection');
    const towerCardsDiv = document.getElementById('towerCards');
    const startBtn = document.getElementById('startBtn');

    const towerTypes = getAllTowerTypes();

    towerCardsDiv.innerHTML = '';

    towerTypes.forEach(towerType => {
        const card = document.createElement('div');
        card.className = 'tower-card';
        card.dataset.typeId = towerType.id;

        card.innerHTML = `
            <div class="tower-icon" style="background: ${towerType.color}"></div>
            <div class="tower-name">${towerType.name}</div>
            <div class="tower-desc">${towerType.description}</div>
            <div class="tower-stats">
                <div>伤害: ${towerType.damage}</div>
                <div>攻速: ${(1 / towerType.attackCooldown).toFixed(1)}/秒</div>
                <div>范围: ${towerType.attackRange}</div>
            </div>
            <div class="tower-skill">初始技能: ${towerType.initialSkill}</div>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedTowerType = towerType.id;
            startBtn.disabled = false;
        });

        towerCardsDiv.appendChild(card);
    });

    startBtn.addEventListener('click', () => {
        if (selectedTowerType) {
            selectionDiv.classList.add('hidden');
            startGame(selectedTowerType);
        }
    });

    selectionDiv.classList.remove('hidden');
}

function startGame(towerTypeId) {
    gameInstance = new Game(canvas, ctx, towerTypeId);
    window.gameInstance = gameInstance;
    gameInstance.start();
}

class Game {
    constructor(canvas, ctx, initialTowerType = null) {
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

        if (initialTowerType) {
            this.spawnInitialTower(initialTowerType);
        }
    }

    spawnInitialTower(towerTypeId) {
        const centerPos = this.map.getCenterWorld();
        const tower = TowerFactory.create(towerTypeId, centerPos.x, centerPos.y, this);
        
        if (tower) {
            this.entityManager.addEntity(tower);
            return tower;
        }

        return this.spawnTower(12, 12, false);
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
        enemy.speed = 30 + Math.random() * 20;
        this.entityManager.addEntity(enemy);
    }

    getAvailableSpawnDirections() {
        return getAvailableDirections(this.occupiedDirections);
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
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    setOccupiedDirections(directions) {
        this.occupiedDirections = directions;
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

if (typeof window !== 'undefined') {
    showTowerSelection();
}
