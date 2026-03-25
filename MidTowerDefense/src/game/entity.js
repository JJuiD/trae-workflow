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
    }

    update(deltaTime) {
        if (this.currentCooldown > 0) {
            this.currentCooldown -= deltaTime;
            if (this.currentCooldown < 0) {
                this.currentCooldown = 0;
            }
        }
    }

    render(ctx) {
    }

    takeDamage(amount) {
        const actualDamage = Math.max(1, amount * (1 - this.defense));
        this.hp -= actualDamage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
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

export { Entity, generateEntityId };
