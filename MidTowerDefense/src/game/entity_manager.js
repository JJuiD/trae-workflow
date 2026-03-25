import { checkCollision, resolveCollision } from './entity.js';

class EntityManager {
    constructor() {
        this.entities = [];
        this.towers = [];
        this.enemies = [];
    }

    addEntity(entity) {
        this.entities.push(entity);

        if (entity.type === 'tower') {
            this.towers.push(entity);
        } else if (entity.type === 'enemy') {
            this.enemies.push(entity);
        }
    }

    removeEntity(entityId) {
        const index = this.entities.findIndex(e => e.id === entityId);
        if (index !== -1) {
            const entity = this.entities[index];
            this.entities.splice(index, 1);

            if (entity.type === 'tower') {
                const towerIndex = this.towers.findIndex(t => t.id === entityId);
                if (towerIndex !== -1) this.towers.splice(towerIndex, 1);
            } else if (entity.type === 'enemy') {
                const enemyIndex = this.enemies.findIndex(e => e.id === entityId);
                if (enemyIndex !== -1) this.enemies.splice(enemyIndex, 1);
            }
        }
    }

    getEntitiesByType(type) {
        return this.entities.filter(e => e.type === type);
    }

    getNearestEnemy(x, y) {
        let nearest = null;
        let nearestDist = Infinity;
        
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }
        return nearest;
    }

    getEnemiesInRange(x, y, range) {
        return this.enemies.filter(enemy => {
            if (!enemy.isAlive) return false;
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return dist <= range;
        });
    }

    getEntityById(id) {
        return this.entities.find(e => e.id === id);
    }

    update(deltaTime, crystal) {
        for (const entity of this.entities) {
            if (entity.type === 'tower') {
                entity.update(deltaTime, this.enemies);
            } else if (entity.type === 'enemy') {
                entity.update(deltaTime, this.towers, crystal);
            } else {
                entity.update(deltaTime);
            }
        }

        for (let i = 0; i < this.enemies.length; i++) {
            for (let j = i + 1; j < this.enemies.length; j++) {
                if (checkCollision(this.enemies[i], this.enemies[j])) {
                    resolveCollision(this.enemies[i], this.enemies[j]);
                }
            }
        }

        this.cleanup();
    }

    cleanup() {
        const deadEntities = this.entities.filter(e => !e.isAlive);
        for (const entity of deadEntities) {
            this.removeEntity(entity.id);
        }
    }

    render(ctx) {
        for (const entity of this.entities) {
            entity.render(ctx);
        }
    }

    clear() {
        this.entities = [];
        this.towers = [];
        this.enemies = [];
    }
}

export { EntityManager };
