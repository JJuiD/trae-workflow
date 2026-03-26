import { Map, TILE_SIZE, DEFAULT_MAP_SIZE, isDirectionOccupied, getAvailableDirections, getAllPlayerGridPositions } from './game/map.js';
import { Crystal } from './game/crystal.js';
import { MapRenderer } from './renderer/map_renderer.js';
import { Tower } from './game/tower.js';
import { Enemy } from './game/enemy.js';
import { EntityManager } from './game/entity_manager.js';
import { SkillManager } from './game/skill_manager.js';
import { ProjectileManager } from './game/projectile.js';
import { TowerFactory } from './game/tower_factory.js';
import { getTowerType, getAllTowerTypes } from './game/tower_types.js';
import { Gold, INITIAL_GOLD, getUpgradeCost, getRerollCost } from './game/gold.js';
import { getSkillPool, getRandomSkillFromPool } from './game/skill_pool.js';
import { createSkill, getSkillById } from './game/skill.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = DEFAULT_MAP_SIZE * TILE_SIZE;
canvas.height = DEFAULT_MAP_SIZE * TILE_SIZE;

let gameInstance = null;
let selectedTowerType = null;
let tempMap = null;
let tempRenderer = null;
let selectedSkillSlotIndex = -1;
let upgradeOptions = [];
let selectedUpgradeOption = -1;
let pendingSkillOptions = {};

function initGameUI() {
    renderSkillSlots();
    updateGoldDisplay();
    setupUIEvents();
}

function renderSkillSlots() {
    const slotsContainer = document.getElementById('skillSlots');
    if (!slotsContainer || !gameInstance) return;

    slotsContainer.innerHTML = '';
    const slots = gameInstance.skillManager.slots;

    for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        slot.className = 'skill-slot';
        slot.dataset.index = i;

        if (slots[i].skill) {
            const skill = slots[i].skill;
            const isTimed = skill.category === 'timed';
            const isTrigger = skill.category === 'trigger';

            if (isTimed) slot.classList.add('timed');
            if (isTrigger) slot.classList.add('trigger');

            slot.innerHTML = `
                <div class="skill-name">${skill.name || skill.id}</div>
                <div class="skill-level">Lv.${slots[i].level}</div>
            `;

            slot.addEventListener('mouseenter', (e) => showSkillSlotTooltip(e, skill));
            slot.addEventListener('mousemove', (e) => moveSkillSlotTooltip(e));
            slot.addEventListener('mouseleave', () => hideSkillSlotTooltip());
        } else {
            slot.className += ' empty';
            slot.innerHTML = '<div class="skill-name">空</div>';
        }

        if (i === selectedSkillSlotIndex) {
            slot.classList += ' selected';
        }

        slot.addEventListener('click', () => selectSkillSlot(i));
        slotsContainer.appendChild(slot);
    }
}

function showSkillSlotTooltip(e, skill) {
    let tooltip = document.getElementById('skillSlotTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'skillSlotTooltip';
        tooltip.className = 'skill-slot-tooltip';
        document.body.appendChild(tooltip);
    }

    const categoryLabels = {
        'passive': '被动',
        'timed': '主动',
        'trigger': '触发'
    };

    let effectText = '';
    if (skill.effect) {
        const effectType = skill.effect.type;
        const effectValue = skill.effect.value || skill.effect.damage || skill.effect.interval || '';
        const effectUnit = skill.effect.interval ? '秒' : (skill.effect.value ? '%' : '');
        effectText = `${effectType}: ${effectValue}${effectUnit}`;
    }

    tooltip.innerHTML = `
        <div class="tooltip-skill-name">${skill.name}</div>
        <div class="tooltip-skill-category">${categoryLabels[skill.category] || skill.category}</div>
        <div class="tooltip-skill-desc">${skill.description || ''}</div>
        <div class="tooltip-skill-effect">${effectText}</div>
    `;

    tooltip.classList.add('visible');
    moveSkillSlotTooltip(e);
}

function moveSkillSlotTooltip(e) {
    const tooltip = document.getElementById('skillSlotTooltip');
    if (!tooltip) return;
    tooltip.style.left = e.clientX + 15 + 'px';
    tooltip.style.top = e.clientY + 10 + 'px';
}

function hideSkillSlotTooltip() {
    const tooltip = document.getElementById('skillSlotTooltip');
    if (tooltip) tooltip.classList.remove('visible');
}

function selectSkillSlot(index) {
    selectedSkillSlotIndex = index;
    selectedUpgradeOption = -1;

    const slots = gameInstance.skillManager.slots;
    const upgradeBtn = document.getElementById('upgradeBtn');
    const rerollBtn = document.getElementById('rerollBtn');

    if (index >= 0 && index < 9) {
        const slot = slots[index];
        upgradeBtn.disabled = slot.level >= 5;
        rerollBtn.disabled = slot.level === 0;
    }

    renderSkillSlots();
    hideUpgradeOptions();
}

function showUpgradeOptions() {
    if (!gameInstance || selectedSkillSlotIndex < 0) return;

    const slot = gameInstance.skillManager.slots[selectedSkillSlotIndex];
    const currentLevel = slot.level;

    if (currentLevel >= 5) return;

    const cost = getUpgradeCost(currentLevel);
    if (!gameInstance.gold.spend(cost) && currentLevel > 0) {
        showMessage(`需要 ${cost} 金币`);
        return;
    }

    const nextLevel = currentLevel + 1;

    if (!pendingSkillOptions[selectedSkillSlotIndex] || pendingSkillOptions[selectedSkillSlotIndex].length === 0) {
        const pool = getSkillPool(nextLevel);
        if (!pool || pool.length === 0) {
            showMessage('技能池为空');
            return;
        }
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        pendingSkillOptions[selectedSkillSlotIndex] = shuffled.slice(0, 3);
    }

    const options = pendingSkillOptions[selectedSkillSlotIndex];
    if (!options || options.length === 0) {
        showMessage('技能选项为空');
        return;
    }

    upgradeOptions = options;
    selectedUpgradeOption = -1;

    const optionsContainer = document.getElementById('upgradeOptions');
    if (!optionsContainer) return;

    optionsContainer.innerHTML = '';

    const canAfford = currentLevel === 0 || gameInstance.gold.get(cost);

    options.forEach((skillId, idx) => {
        const skillConfig = getSkillById(skillId);
        const opt = document.createElement('div');
        opt.className = 'skill-item' + (canAfford ? '' : ' disabled');
        opt.dataset.skillId = skillId;
        opt.dataset.index = idx;

        const iconEmoji = getSkillIcon(skillId);
        opt.innerHTML = `
            <div class="skill-icon">${iconEmoji}</div>
            <div class="skill-name">${skillConfig ? skillConfig.name : skillId}</div>
        `;

        opt.addEventListener('click', () => {
            if (!canAfford) return;
            selectUpgradeOption(idx);
        });

        opt.addEventListener('mouseenter', (e) => {
            if (!skillConfig) return;
            showSkillTooltip(e, skillConfig);
        });

        opt.addEventListener('mousemove', (e) => {
            moveSkillTooltip(e);
        });

        opt.addEventListener('mouseleave', () => {
            hideSkillTooltip();
        });

        optionsContainer.appendChild(opt);
    });

    document.getElementById('currentUpgradeCost').textContent = currentLevel === 0 ? '免费' : cost;
    document.getElementById('confirmUpgradeBtn').disabled = true;

    const modal = document.getElementById('upgradeModal');
    if (modal) modal.classList.remove('hidden');
}

function getSkillIcon(skillId) {
    const icons = {
        'power_strike': '⚔️',
        'quick_shot': '🏹',
        'sharp_arrow': '🎯',
        'iron_will': '🛡️',
        'fireball': '🔥',
        'ice_arrow': '❄️',
        'poison_dart': '🌿',
        'lightning_bolt': '⚡',
        'chain_lightning': '🌩️',
        'meteor': '☄️',
        'frost_nova': '💠',
        'flame_wave': '🌊',
        'heal': '💖',
        'shield_aura': '🔮',
        'regeneration': '💚',
        'magic_barrier': '🛡️',
        'vampire': '🧛',
        'apocalypse': '💀',
        'thunder_storm': '⛈️',
        'inferno': '🔥'
    };
    return icons[skillId] || '✨';
}

function showSkillTooltip(e, skillConfig) {
    const tooltip = document.getElementById('skillTooltip');
    if (!tooltip) return;

    const effectText = getSkillEffectText(skillConfig);

    tooltip.querySelector('.tooltip-title').textContent = skillConfig.name;
    tooltip.querySelector('.tooltip-desc').textContent = skillConfig.description;
    tooltip.querySelector('.tooltip-effect').textContent = effectText;

    tooltip.classList.add('visible');
    moveSkillTooltip(e);
}

function moveSkillTooltip(e) {
    const tooltip = document.getElementById('skillTooltip');
    if (!tooltip) return;

    const x = e.clientX + 15;
    const y = e.clientY + 15;

    const rect = tooltip.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 10;
    const maxY = window.innerHeight - rect.height - 10;

    tooltip.style.left = Math.min(x, maxX) + 'px';
    tooltip.style.top = Math.min(y, maxY) + 'px';
}

function hideSkillTooltip() {
    const tooltip = document.getElementById('skillTooltip');
    if (tooltip) tooltip.classList.remove('visible');
}

function getSkillEffectText(skillConfig) {
    if (!skillConfig || !skillConfig.effect) return '';

    const effect = skillConfig.effect;
    const effectTexts = {
        'damage_boost': `伤害 +${(effect.value * 100).toFixed(0)}%`,
        'attack_speed': `攻速 +${(effect.value * 100).toFixed(0)}%`,
        'crit_rate': `暴击率 +${(effect.value * 100).toFixed(0)}%`,
        'defense': `防御力 +${(effect.value * 100).toFixed(0)}%`,
        'lifesteal': `吸血 +${(effect.value * 100).toFixed(0)}%`,
        'shield': `护盾 +${(effect.value * 100).toFixed(0)}%`
    };

    return effectTexts[effect.type] || `${effect.type}: +${effect.value}`;
}

function hideUpgradeOptions() {
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.classList.add('hidden');
    hideSkillTooltip();
    upgradeOptions = [];
    selectedUpgradeOption = -1;
}

function selectUpgradeOption(idx) {
    selectedUpgradeOption = idx;

    const options = document.querySelectorAll('.skill-item');
    options.forEach((opt, i) => {
        if (i === idx) opt.classList.add('selected');
        else opt.classList.remove('selected');
    });

    document.getElementById('confirmUpgradeBtn').disabled = false;
}

function confirmUpgrade() {
    if (selectedSkillSlotIndex < 0 || selectedUpgradeOption < 0) return;

    const slot = gameInstance.skillManager.slots[selectedSkillSlotIndex];
    const skillId = upgradeOptions[selectedUpgradeOption];
    const skill = createSkill(skillId);

    if (!skill) {
        showMessage('技能创建失败');
        return;
    }

    slot.setSkill(skill);
    delete pendingSkillOptions[selectedSkillSlotIndex];
    gameInstance.skillManager.recalculateBonus();

    // TODO: 多人游戏架构 - 需要根据当前玩家过滤，只应用技能到属于当前玩家的塔
    // 方案：gameInstance.entityManager.getEntitiesByType('tower').filter(t => t.owner === currentPlayerId).forEach(...)
    gameInstance.entityManager.getEntitiesByType('tower').forEach(t => t.applySkill(gameInstance));

    hideUpgradeOptions();
    renderSkillSlots();
    updateGoldDisplay();
    updateButtonsState();
}

function handleReroll() {
    if (!gameInstance || selectedSkillSlotIndex < 0) return;

    const slot = gameInstance.skillManager.slots[selectedSkillSlotIndex];
    const currentLevel = slot.level;

    if (currentLevel === 0) {
        showMessage('该槽位没有技能');
        return;
    }

    const cost = getRerollCost(currentLevel);
    if (!gameInstance.gold.spend(cost)) {
        showMessage(`需要 ${cost} 金币`);
        return;
    }

    const newSkillId = getRandomSkillFromPool(currentLevel);
    if (newSkillId) {
        const newSkill = createSkill(newSkillId);
        if (newSkill) {
            slot.setSkill(newSkill);
            gameInstance.skillManager.recalculateBonus();
        }
    }

    renderSkillSlots();
    updateGoldDisplay();
    updateButtonsState();
}

function showMessage(text) {
    const msgBox = document.getElementById('messageBox');
    if (!msgBox) return;

    msgBox.textContent = text;
    msgBox.classList.remove('hidden');

    msgBox.style.animation = 'none';
    msgBox.offsetHeight;
    msgBox.style.animation = 'fadeInOut 2s forwards';

    setTimeout(() => {
        msgBox.classList.add('hidden');
    }, 2000);
}

function updateGoldDisplay() {
    if (!gameInstance) return;
    const goldEl = document.getElementById('goldAmount');
    if (goldEl) {
        goldEl.textContent = gameInstance.gold.getAmount();
    }
}

function updateButtonsState() {
    if (!gameInstance || selectedSkillSlotIndex < 0) return;

    const slot = gameInstance.skillManager.slots[selectedSkillSlotIndex];
    const upgradeBtn = document.getElementById('upgradeBtn');
    const rerollBtn = document.getElementById('rerollBtn');

    upgradeBtn.disabled = slot.level >= 5;
    rerollBtn.disabled = slot.level === 0;
}

function setupUIEvents() {
    const upgradeBtn = document.getElementById('upgradeBtn');
    const rerollBtn = document.getElementById('rerollBtn');
    const confirmUpgradeBtn = document.getElementById('confirmUpgradeBtn');
    const cancelUpgradeBtn = document.getElementById('cancelUpgradeBtn');

    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            const slot = gameInstance?.skillManager?.slots[selectedSkillSlotIndex];
            if (slot && slot.level < 5) {
                showUpgradeOptions();
            }
        });
    }

    if (rerollBtn) {
        rerollBtn.addEventListener('click', handleReroll);
    }

    if (confirmUpgradeBtn) {
        confirmUpgradeBtn.addEventListener('click', () => {
            if (selectedUpgradeOption >= 0) {
                confirmUpgrade();
            }
        });
    }

    if (cancelUpgradeBtn) {
        cancelUpgradeBtn.addEventListener('click', () => {
            const slot = gameInstance?.skillManager?.slots[selectedSkillSlotIndex];
            const currentLevel = slot ? slot.level : 0;
            const cost = getUpgradeCost(currentLevel);
            if (currentLevel === 0 && cost === 0) {
            } else if (currentLevel > 0) {
                gameInstance.gold.earn(cost);
                updateGoldDisplay();
            }
            hideUpgradeOptions();
        });
    }
}

function updateTowerInfoPanel(tower) {
    const panel = document.getElementById('towerInfoPanel');
    if (!panel) return;

    if (tower) {
        panel.classList.remove('hidden');
        document.getElementById('towerTypeName').textContent = tower.towerTypeId || '默认';
        document.getElementById('towerDamage').textContent = tower.damage || '-';
        document.getElementById('towerAttackSpeed').textContent = tower.attackSpeed ? (1 / tower.attackCooldown).toFixed(1) + '/秒' : '-';
        document.getElementById('towerRange').textContent = tower.range || '-';
    } else {
        panel.classList.add('hidden');
    }
}

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
    let selectedGridX = -1;
    let selectedGridY = -1;

    function renderPreview() {
        ctx.fillStyle = '#16213e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerPos = tempMap.getCenterWorld();
        tempRenderer.renderMap(tempMap, { x: centerPos.x, y: centerPos.y, getColor: () => '#00fff5', isAlive: () => true }, []);

        const validPositions = getAllPlayerGridPositions();

        validPositions.forEach(pos => {
            const worldX = pos.gridX * TILE_SIZE + TILE_SIZE / 2;
            const worldY = pos.gridY * TILE_SIZE + TILE_SIZE / 2;
            const canPlaceHere = tempMap.canPlaceTower(pos.gridX, pos.gridY);

            const isSelected = pos.gridX === selectedGridX && pos.gridY === selectedGridY;
            const isHovered = pos.gridX === hoverGridX && pos.gridY === hoverGridY;

            if (isSelected) {
                ctx.fillStyle = 'rgba(74, 222, 128, 0.6)';
            } else if (isHovered && canPlaceHere) {
                ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
            } else {
                ctx.fillStyle = canPlaceHere ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.3)';
            }
            ctx.fillRect(pos.gridX * TILE_SIZE, pos.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            ctx.strokeStyle = isSelected ? '#22c55e' : (canPlaceHere ? '#4ade80' : '#ef4444');
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(pos.gridX * TILE_SIZE, pos.gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        });

        if (selectedGridX >= 0 && selectedGridY >= 0) {
            const worldX = selectedGridX * TILE_SIZE + TILE_SIZE / 2;
            const worldY = selectedGridY * TILE_SIZE + TILE_SIZE / 2;

            const towerType = getTowerType(selectedTowerType);
            if (towerType) {
                ctx.fillStyle = towerType.color || '#fbbf24';
                ctx.globalAlpha = 0.8;
                ctx.fillRect(worldX - 15, worldY - 15, 30, 30);
                ctx.globalAlpha = 1.0;

                ctx.strokeStyle = 'rgba(74, 144, 217, 0.3)';
                ctx.beginPath();
                ctx.arc(worldX, worldY, towerType.attackRange, 0, Math.PI * 2);
                ctx.stroke();
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
        canPlace = tempMap.canPlaceTower(hoverGridX, hoverGridY);
    }

    function handleClick(e) {
        if (hoverGridX >= 0 && hoverGridY >= 0 && canPlace) {
            selectedGridX = hoverGridX;
            selectedGridY = hoverGridY;
            confirmBtn.disabled = false;
        }
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    confirmBtn.addEventListener('click', () => {
        if (selectedGridX >= 0 && selectedGridY >= 0) {
            tempMap.setTile(selectedGridX, selectedGridY, 1);
            positionDiv.classList.add('hidden');
            startGame(selectedTowerType, selectedGridX, selectedGridY);
        }
    });

    positionDiv.classList.remove('hidden');
    renderPreview();
}

function startGame(towerTypeId, gridX, gridY) {
    gameInstance = new Game(canvas, ctx, towerTypeId, gridX, gridY);
    window.gameInstance = gameInstance;
    gameInstance.start();
    initGameUI();
    setupGameClickHandler();
}

function setupGameClickHandler() {
    canvas.addEventListener('click', (e) => {
        if (!gameInstance) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const towers = gameInstance.entityManager.getEntitiesByType('tower');
        let clickedTower = null;

        for (const tower of towers) {
            const dx = tower.x - x;
            const dy = tower.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= 20) {
                clickedTower = tower;
                break;
            }
        }

        gameInstance.selectedTower = clickedTower;
        updateTowerInfoPanel(clickedTower);
    });
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
        this.gold = new Gold(INITIAL_GOLD);
        this.projectiles = new ProjectileManager();
        this.selectedTower = null;
        this.selectedSkillSlotIndex = -1;

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

    spawnTowerAt(gridX, gridY, applySkills = true, owner = 'player') {
        const worldX = gridX * TILE_SIZE + TILE_SIZE / 2;
        const worldY = gridY * TILE_SIZE + TILE_SIZE / 2;
        const tower = new Tower(worldX, worldY, owner);
        
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

        const enemy = new Enemy(x, y, 'enemy');
        enemy.speed = 30 + Math.random() * 20;
        this.entityManager.addEntity(enemy);
    }

    getAvailableSpawnDirections() {
        return getAvailableDirections(this.occupiedDirections);
    }

    spawnTower(gridX, gridY, applySkills = true, owner = 'player') {
        const worldX = gridX * TILE_SIZE + TILE_SIZE / 2;
        const worldY = gridY * TILE_SIZE + TILE_SIZE / 2;
        const tower = new Tower(worldX, worldY, owner);
        
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
