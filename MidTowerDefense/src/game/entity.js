let entityIdCounter = 0;

function generateEntityId() {
    return `entity_${++entityIdCounter}`;
}

class Entity {
    constructor(x, y, type) {
        this.id = generateEntityId();
        this.type = type;
        this.x = x;
        this.y = y;
        this.collisionRadius = 15;
        this.hasCollision = true;

        this.hp = 100;
        this.maxHp = 100;
        this.mp = 0;
        this.maxMp = 0;
        this.defense = 0;

        this.damage = 10;
        this.critRate = 0;
        this.critDamage = 1.5;
        this.attackSpeed = 1;
        this.attackCooldown = 1;
        this.currentCooldown = 0;

        this.isAlive = true;
        this.isTakingDamage = false;
        this.damageFlashTimer = 0;

        this.eventListeners = {};
        this.skillTimers = {};
        this.skillHandlers = {};
        this.shield = 0;
        this.lastShieldTime = 0;
        this.lastHealTime = 0;
        this.rageActive = false;
        this.attackRange = 0;
    }

    on(event, handler) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);
    }

    off(event, handler) {
        if (!this.eventListeners[event]) return;
        const index = this.eventListeners[event].indexOf(handler);
        if (index > -1) {
            this.eventListeners[event].splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.eventListeners[event]) return;
        this.eventListeners[event].forEach(handler => handler(data));
    }

    addShield(value) {
        this.shield += value;
    }

    heal(value) {
        this.hp = Math.min(this.hp + value, this.maxHp);
    }

    update(deltaTime) {
        if (this.currentCooldown > 0) {
            this.currentCooldown -= deltaTime;
            if (this.currentCooldown < 0) {
                this.currentCooldown = 0;
            }
        }

        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= deltaTime;
            if (this.damageFlashTimer <= 0) {
                this.isTakingDamage = false;
            }
        }
    }

    render(ctx) {
    }

    takeDamage(amount) {
        const actualDamage = Math.max(1, amount * (1 - this.defense));
        this.hp -= actualDamage;

        this.isTakingDamage = true;
        this.damageFlashTimer = 0.2;

        this.emit('damaged', { damage: actualDamage, originalDamage: amount });

        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
            this.emit('death');
        }
        return actualDamage;
    }

    reset() {
        this.hp = this.maxHp;
        this.mp = this.maxMp;
        this.isAlive = true;
        this.currentCooldown = 0;
    }
}

function checkCollision(entityA, entityB) {
    if (!entityA.hasCollision || !entityB.hasCollision) return false;

    const dx = entityA.x - entityB.x;
    const dy = entityA.y - entityB.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < entityA.collisionRadius + entityB.collisionRadius;
}

function resolveCollision(entityA, entityB) {
    const dx = entityA.x - entityB.x;
    const dy = entityA.y - entityB.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = entityA.collisionRadius + entityB.collisionRadius;

    if (dist < minDist && dist > 0) {
        const overlap = minDist - dist;
        const moveX = (dx / dist) * (overlap / 2);
        const moveY = (dy / dist) * (overlap / 2);

        entityA.x += moveX;
        entityA.y += moveY;
        entityB.x -= moveX;
        entityB.y -= moveY;
    }
}

export { Entity, generateEntityId, checkCollision, resolveCollision };
