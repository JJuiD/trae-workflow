import { Entity } from './entity.js';

class Tower extends Entity {
    constructor(x, y) {
        super(x, y, 'tower');

        this.range = 150;
        this.target = null;
        this.passiveSkill = null;

        this.damage = 25;
        this.attackCooldown = 1;
        this.critRate = 0.1;
        this.critDamage = 1.5;
    }

    update(deltaTime, enemies) {
        super.update(deltaTime);

        if (!this.isAlive) return;

        this.target = this.findTarget(enemies);

        if (this.target && this.currentCooldown <= 0) {
            this.attack(this.target);
            this.currentCooldown = this.attackCooldown / this.attackSpeed;
        }
    }

    findTarget(enemies) {
        let closest = null;
        let closestDist = Infinity;

        for (const enemy of enemies) {
            if (!enemy.isAlive) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= this.range && dist < closestDist) {
                closest = enemy;
                closestDist = dist;
            }
        }

        return closest;
    }

    attack(target) {
        let finalDamage = this.damage;

        if (Math.random() < this.critRate) {
            finalDamage *= this.critDamage;
        }

        target.takeDamage(finalDamage);
    }

    render(ctx) {
        if (!this.isAlive) return;

        ctx.fillStyle = '#4a90d9';
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);

        ctx.strokeStyle = '#2d5a87';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 15, this.y - 15, 30, 30);

        ctx.strokeStyle = 'rgba(74, 144, 217, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.stroke();
    }
}

export { Tower };
