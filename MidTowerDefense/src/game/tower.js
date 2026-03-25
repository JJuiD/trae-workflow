import { Entity } from './entity.js';

class Tower extends Entity {
    constructor(x, y) {
        super(x, y, 'tower');

        this.range = 150;
        this.target = null;
        this.passiveSkill = null;
        this.collisionRadius = 15;

        this.damage = 25;
        this.attackCooldown = 1;
        this.critRate = 0.1;
        this.critDamage = 1.5;
        this.lastAttackTarget = null;
        this.attackFlashTimer = 0;
    }

    update(deltaTime, enemies) {
        super.update(deltaTime);

        if (this.attackFlashTimer > 0) {
            this.attackFlashTimer -= deltaTime;
        }

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
        this.lastAttackTarget = target;
        this.attackFlashTimer = 0.15;
    }

    render(ctx) {
        if (!this.isAlive) return;

        if (this.isTakingDamage) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = '#4a90d9';
        }
        ctx.fillRect(this.x - 15, this.y - 15, 30, 30);

        if (!this.isTakingDamage) {
            ctx.strokeStyle = '#2d5a87';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 15, this.y - 15, 30, 30);
        }

        if (this.attackFlashTimer > 0 && this.lastAttackTarget) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.lastAttackTarget.x, this.lastAttackTarget.y);
            ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(74, 144, 217, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.stroke();

        if (this.hp < this.maxHp) {
            const barWidth = 30;
            const barHeight = 4;
            const barX = this.x - barWidth / 2;
            const barY = this.y + 20;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const hpRatio = this.hp / this.maxHp;
            ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
            ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
        }
    }
}

export { Tower };
