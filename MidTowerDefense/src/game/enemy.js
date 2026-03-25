import { Entity } from './entity.js';

class Enemy extends Entity {
    constructor(x, y) {
        super(x, y, 'enemy');

        this.speed = 60;
        this.damageToCrystal = 10;
        this.isTakingDamage = false;
        this.damageFlashTimer = 0;
        this.target = null;
        this.originalTarget = null;
    }

    setTarget(target) {
        this.originalTarget = target;
        this.target = target;
    }

    update(deltaTime, towers, crystal) {
        if (!this.isAlive) return;

        if (!this.target || !this.target.isAlive) {
            this.target = crystal;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 5) {
            const moveX = (dx / dist) * this.speed * deltaTime;
            const moveY = (dy / dist) * this.speed * deltaTime;
            this.x += moveX;
            this.y += moveY;
        } else {
            if (this.target.type === 'crystal') {
                this.attackCrystal(this.target);
            } else if (this.target.type === 'tower') {
                this.attackTower(this.target);
            }
        }

        this.checkTowerInRange(towers, crystal);
    }

    checkTowerInRange(towers, crystal) {
        let closestTower = null;
        let closestDist = Infinity;

        for (const tower of towers) {
            if (!tower.isAlive) continue;

            const dx = tower.x - this.x;
            const dy = tower.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= tower.range && dist < closestDist) {
                closestTower = tower;
                closestDist = dist;
            }
        }

        if (closestTower) {
            this.target = closestTower;
        }
    }

    attackCrystal(crystal) {
        crystal.takeDamage(this.damageToCrystal);
        this.isAlive = false;
    }

    attackTower(tower) {
        if (this.currentCooldown <= 0) {
            tower.takeDamage(this.damage);
            this.currentCooldown = this.attackCooldown / this.attackSpeed;
        }
    }

    render(ctx) {
        if (!this.isAlive) return;

        if (this.isTakingDamage) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = '#e74c3c';
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
        ctx.fill();

        if (!this.isTakingDamage) {
            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (this.target && this.target.type === 'tower') {
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        if (this.hp < this.maxHp) {
            const barWidth = 24;
            const barHeight = 4;
            const barX = this.x - barWidth / 2;
            const barY = this.y - 20;

            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const hpRatio = this.hp / this.maxHp;
            ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.25 ? '#f39c12' : '#e74c3c';
            ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
        }
    }
}

export { Enemy };
