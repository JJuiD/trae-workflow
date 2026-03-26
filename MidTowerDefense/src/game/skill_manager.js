import { SkillSlot } from './skill_slot.js';
import { createSkill, getSkillsByLevel } from './skill.js';
import { getRandomSkillFromPool, checkSetBonus } from './skill_pool.js';

class SkillManager {
    constructor() {
        this.slots = [];
        for (let i = 0; i < 9; i++) {
            this.slots.push(new SkillSlot(i));
        }
        this.bonus = null;
    }

    initWithRandomSkills() {
        for (let i = 0; i < 9; i++) {
            const level = Math.floor(Math.random() * 3) + 1;
            const skillId = getRandomSkillFromPool(level);
            if (skillId) {
                const skill = createSkill(skillId);
                this.slots[i].setSkill(skill);
            }
        }
        this.recalculateBonus();
    }

    initWithSkill(level, slotIndex = null) {
        const skillId = getRandomSkillFromPool(level);
        if (!skillId) return false;

        const skill = createSkill(skillId);

        if (slotIndex !== null && slotIndex >= 0 && slotIndex < 9) {
            this.slots[slotIndex].setSkill(skill);
        } else {
            const emptySlot = this.slots.find(s => s.isEmpty());
            if (emptySlot) {
                emptySlot.setSkill(skill);
            } else {
                return false;
            }
        }

        this.recalculateBonus();
        return true;
    }

    setSkill(slotIndex, skillId) {
        if (slotIndex < 0 || slotIndex >= 9) return false;

        const skill = createSkill(skillId);
        if (!skill) return false;

        this.slots[slotIndex].setSkill(skill);
        this.recalculateBonus();
        return true;
    }

    upgradeSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 9) return false;

        const slot = this.slots[slotIndex];
        if (!slot.canUpgrade()) return false;

        const nextLevel = slot.level + 1;
        const availableSkills = getSkillsByLevel(nextLevel);

        if (availableSkills.length === 0) return false;

        const upgraded = slot.upgrade(availableSkills);
        if (upgraded) {
            this.recalculateBonus();
        }
        return upgraded;
    }

    removeSkill(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 9) return false;
        this.slots[slotIndex].clear();
        this.recalculateBonus();
        return true;
    }

    applyAllSkills(game, entity) {
        // TODO: 多人游戏架构 - 需要根据 entity.owner 过滤，只应用属于该玩家的技能
        this.slots.forEach(slot => {
            if (slot.skill) {
                slot.skill.apply(game, entity);
            }
        });
    }

    recalculateBonus() {
        this.bonus = checkSetBonus(this.slots);
    }

    calculateBonuses() {
        const bonuses = {
            damageBonus: 0,
            attackSpeedBonus: 0,
            rangeBonus: 0,
            shieldBonus: 0,
            lifestealBonus: 0,
        };

        this.slots.forEach(slot => {
            if (!slot.skill) return;

            const effect = slot.skill.effect;
            if (slot.skill.category === 'passive') {
                if (effect.type === 'damage_boost') {
                    bonuses.damageBonus += effect.value;
                } else if (effect.type === 'attack_speed') {
                    bonuses.attackSpeedBonus += effect.value;
                } else if (effect.type === 'range_boost') {
                    bonuses.rangeBonus += effect.value;
                }
            }
        });

        if (this.bonus) {
            Object.keys(this.bonus).forEach(key => {
                if (bonuses.hasOwnProperty(key)) {
                    bonuses[key] += this.bonus[key];
                }
            });
        }

        return bonuses;
    }

    getSlotInfo() {
        return this.slots.map((slot, index) => ({
            index,
            skill: slot.skill ? {
                id: slot.skill.id,
                name: slot.skill.name,
                level: slot.skill.level,
                category: slot.skill.category,
                description: slot.skill.description
            } : null,
            level: slot.level,
            canUpgrade: slot.canUpgrade()
        }));
    }

    getActiveSkillCount() {
        return this.slots.filter(s => !s.isEmpty()).length;
    }

    getTotalLevel() {
        return this.slots.reduce((sum, slot) => sum + slot.level, 0);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SkillManager };
}

export { SkillManager };
