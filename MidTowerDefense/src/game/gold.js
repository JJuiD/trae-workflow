class Gold {
    constructor(initialAmount = 100) {
        this.amount = initialAmount;
    }

    get(amount) {
        return this.amount >= amount;
    }

    spend(amount) {
        if (this.amount >= amount) {
            this.amount -= amount;
            return true;
        }
        return false;
    }

    earn(amount) {
        this.amount += amount;
    }

    getAmount() {
        return this.amount;
    }
}

const INITIAL_GOLD = 100;
const UPGRADE_BASE_COST = 10;
const REROLL_BASE_COST = 5;

function getUpgradeCost(currentLevel) {
    if (currentLevel === 0) return 0;
    return currentLevel * UPGRADE_BASE_COST;
}

function getRerollCost(currentLevel) {
    return currentLevel * REROLL_BASE_COST;
}

export { Gold, INITIAL_GOLD, UPGRADE_BASE_COST, REROLL_BASE_COST, getUpgradeCost, getRerollCost };
