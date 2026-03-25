class SkillSlot {
    constructor(index) {
        this.index = index;
        this.skill = null;
        this.level = 0;
    }

    setSkill(skill) {
        this.skill = skill;
        this.level = skill ? skill.level : 0;
    }

    upgrade(availableSkills) {
        if (this.level >= 5) return false;

        const nextLevel = this.level + 1;
        const pool = availableSkills.filter(s => s.level === nextLevel);

        if (pool.length === 0) return false;

        const randomSkill = pool[Math.floor(Math.random() * pool.length)];
        this.setSkill(randomSkill);
        return true;
    }

    canUpgrade() {
        return this.level < 5;
    }

    isEmpty() {
        return this.skill === null;
    }

    clear() {
        this.skill = null;
        this.level = 0;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SkillSlot };
}
