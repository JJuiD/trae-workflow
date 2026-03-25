import { Map, TILE_SIZE, DEFAULT_MAP_SIZE, isDirectionOccupied, getAvailableDirections } from './game/map.js';
import { Crystal } from './game/crystal.js';
import { MapRenderer } from './renderer/map_renderer.js';
import { Tower } from './game/tower.js';
import { Enemy } from './game/enemy.js';
import { EntityManager } from './game/entity_manager.js';
import { SkillManager } from './game/skill_manager.js';
import { ProjectileManager } from './game/projectile.js';
import { TowerFactory } from './game/tower_factory.js';
import { getTowerType, getAllTowerTypes } from './game/tower_types.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = DEFAULT_MAP_SIZE * TILE_SIZE;
canvas.height = DEFAULT_MAP_SIZE * TILE_SIZE;

let gameInstance = null;
let selectedTowerType = null;
let tempMap = null;
let tempRenderer = null;

function showTowerSelection() {
    const selectionDiv = document.getElementById('towerSelection');
    const positionDiv = document.getElementById('positionSelection');
    const towerCardsDiv = document.getElementById('towerCards');
    const startBtn = document.getElementById('startBtn');
    const backBtn = document.getElementById('backBtn');

    positionDiv.classList.add('hidden');
    selectionDiv.classList.remove('hidden');

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
            showPositionSelection();
        }
    });

    backBtn.addEventListener('click', () => {
        positionDiv.classList.add('hidden');
        selectionDiv.classList.remove('hidden');
    });
}

function showPositionSelection() {
    const positionDiv = document.getElementById('positionSelection');
    const backBtn = document.getElementById('backBtn');
    const confirmBtn = document.getElementById('confirmBtn');

    confirmBtn.disabled = true;

    tempMap = new Map(DEFAULT_MAP_SIZE);
    tempRenderer = new MapRenderer(ctx, TILE_SIZE);

    let hoverGridX = -1;
    let hoverGridY = -1;
    let canPlace = false;

    function renderPreview() {
        ctx.fillStyle = '#16213e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerPos = tempMap.getCenterWorld();
        tempRenderer.renderMap(tempMap, { x: centerPos.x, y: centerPos.y, getColor: () => '#00fff5', isAlive: () => true }, []);

        const validPositions = [
            { gridX: 12, gridY: 11 },
            { gridX: 12, gridY: 13 },
            { gridX: 11, gridY: 12 },
            { gridX: 13, gridY: 12 }
        ];

        validPositions.forEach(pos => {
            const worldX = pos.gridX * TILE_SIZE + TILE_SIZE / 2;
            const worldY = pos.gridY * TILE_SIZE + TILE_SIZE / 2;
            const canPlaceHere = tempMap.canPlaceTower(pos.gridX, pos.gridY);

            ctx.fillStyle = canPlaceHere ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)';
            ctx.fillRect(pos.gridX * TILE_SIZE, pos.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            ctx.strokeStyle = canPlaceHere ? '#4ade80' : '#ef4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(pos.gridX * TILE_SIZE, pos.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        });

        if (hoverGridX >= 0 && hoverGridY >= 0) {
            canPlace = tempMap.canPlaceTower(hoverGridX, hoverGridY);

            if (canPlace) {
                const worldX = hoverGridX * TILE_SIZE + TILE_SIZE / 2;
                const worldY = hoverGridY * TILE_SIZE + TILE_SIZE / 2;

                const towerType = getTowerType(selectedTowerType);
                if (towerType) {
                    ctx.fillStyle = towerType.color || '#fbbf24';
                    ctx.globalAlpha = 0.7;
                    ctx.fillRect(worldX - 15, worldY - 15, 30, 30);
                    ctx.globalAlpha = 1.0;

                    ctx.strokeStyle = 'rgba(74, 144, 217, 0.3)';
                    ctx.beginPath();
                    ctx.arc(worldX, worldY, towerType.attackRange, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }

        if (!positionDiv.classList.contains('hidden')) {
            requestAnimationFrame(renderPreview);
        }
    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        hoverGridX = Math.floor(mouseX / TILE_SIZE);
        hoverGridY = Math.floor(mouseY / TILE_SIZE);
    }

    function handleClick(e) {
        if (hoverGridX >= 0 && hoverGridY >= 0 && canPlace) {
            const worldX = hoverGridX * TILE_SIZE + TILE_SIZE / 2;
            const worldY = hoverGridY * TILE_SIZE + TILE_SIZE / 2;

            tempMap.setTile(hoverGridX, hoverGridY, 1);

            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleClick);

            confirmBtn.disabled = false;
        }
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    confirmBtn.addEventListener('click', () => {
        positionDiv.classList.add('hidden');
        startGame(selectedTowerType, hoverGridX, hoverGridY);
    });

    positionDiv.classList.remove('hidden');
    renderPreview();
}

function startGame(towerTypeId, gridX, gridY) {
    gameInstance = new Game(canvas, ctx, towerTypeId, gridX, gridY);
    window.gameInstance = gameInstance;
    gameInstance.start();
}

class Game {
    constructor(canvas, ctx, initialTowerType = null, initialGridX = null, initialGridY = null) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.lastTime = 0;
        this.map = new Map(DEFAULT_MAP_SIZE);

        if (initialGridX !== null && initialGridY !== null) {
            this.map.setTile(initialGridX, initialGridY, 1);
        }

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

        if (initialTowerType && initialGridX !== null && initialGridY !== null) {
            this.spawnInitialTower(initialTowerType, initialGridX, initialGridY);
        }
    }

    spawnInitialTower(towerTypeId, gridX, gridY) {
        const worldX = gridX * TILE_SIZE + TILE_SIZE / 2;
        const worldY = gridY * TILE_SIZE + TILE_SIZE / 2;
        const tower = TowerFactory.create(towerTypeId, worldX, worldY, this);
        
        if (tower) {
            this.entityManager.addEntity(tower);
            return tower;
        }

        const centerPos = this.map.getCenterWorld();
        return this.spawnTowerAt(centerPos.x / TILE_SIZE, centerPos.y / TILE_SIZE, false);
    }

    spawnTowerAt(gridX, gridY, applySkills = true) {
        const worldX = gridX * TILE_SIZE + TILE_SIZE / 2;
        const worldY = gridY * TILE_SIZE + TILE_SIZE / 2;
        const tower = new Tower(worldX, worldY);
        
        if (applySkills) {
            tower.applySkill(this);
        }
        
        this.entityManager.addEntity(tower);
        return tower;
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
