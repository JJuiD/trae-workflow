const CRYSTAL_COLOR = '#00fff5';
const CRYSTAL_SIZE = 20;

class Crystal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.maxHealth = 1000;
        this.health = this.maxHealth;
        this.size = CRYSTAL_SIZE;
        this.collisionRadius = CRYSTAL_SIZE / 2;
        this.hitFlashTime = 0;
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.hitFlashTime = 200;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    update(deltaTime) {
        if (this.hitFlashTime > 0) {
            this.hitFlashTime -= deltaTime;
        }
    }

    getColor() {
        if (this.hitFlashTime > 0) {
            return '#ff0000';
        }
        return CRYSTAL_COLOR;
    }

    isAlive() {
        return this.health > 0;
    }

    reset() {
        this.health = this.maxHealth;
        this.hitFlashTime = 0;
    }
}

export { Crystal, CRYSTAL_COLOR, CRYSTAL_SIZE };