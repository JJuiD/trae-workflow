let projectileIdCounter = 0;

function generateProjectileId() {
    return `projectile_${++projectileIdCounter}`;
}

class Projectile {
    constructor(config) {
        this.id = generateProjectileId();
        this.x = config.x;
        this.y = config.y;
        this.targetId = config.targetId;
        this.damage = config.damage || 10;
        this.speed = config.speed || 200;
        this.type = config.type || 'default';
        this.target = null;
        this.isActive = true;
    }

    update(deltaTime, entityManager) {
        if (!this.isActive) return;

        if (this.targetId) {
            this.target = entityManager.getEntityById(this.targetId);
        }

        if (!this.target || !this.target.isAlive) {
            this.isActive = false;
            return;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) {
            this.target.takeDamage(this.damage);
            this.isActive = false;
            return;
        }

        const moveX = (dx / dist) * this.speed * deltaTime;
        const moveY = (dy / dist) * this.speed * deltaTime;

        this.x += moveX;
        this.y += moveY;
    }

    render(ctx) {
        if (!this.isActive) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.type === 'fireball') {
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#ff6b35';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffdd59';
            ctx.fill();
        } else if (this.type === 'ice_arrow') {
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(4, 4);
            ctx.lineTo(-4, 4);
            ctx.closePath();
            ctx.fillStyle = '#7ed6df';
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }

        ctx.restore();
    }
}

class ProjectileManager {
    constructor() {
        this.projectiles = [];
    }

    spawn(config) {
        const projectile = new Projectile(config);
        this.projectiles.push(projectile);
        return projectile;
    }

    update(deltaTime, entityManager) {
        this.projectiles = this.projectiles.filter(p => p.isActive);
        this.projectiles.forEach(p => {
            p.update(deltaTime, entityManager);
        });
    }

    render(ctx) {
        this.projectiles.forEach(p => {
            p.render(ctx);
        });
    }

    clear() {
        this.projectiles = [];
    }

    getProjectileCount() {
        return this.projectiles.length;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Projectile, ProjectileManager };
}
