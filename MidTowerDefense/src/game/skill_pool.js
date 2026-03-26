const SKILL_POOLS = {
    1: ['power_strike', 'quick_shot', 'sharp_arrow', 'iron_will'],
    2: ['fireball', 'ice_arrow', 'poison_dart', 'lightning_bolt'],
    3: ['chain_lightning', 'meteor', 'frost_nova', 'flame_wave'],
    4: ['heal', 'shield_aura', 'regeneration', 'magic_barrier'],
    5: ['vampire', 'apocalypse', 'thunder_storm', 'inferno'],
};

const SET_BONUSES = {
    3: {
        'chain_lightning+meteor': { damageBonus: 0.2 },
    },
    4: {
        'heal+shield_aura': { shieldBonus: 0.3 },
    },
    5: {
        'vampire+apocalypse': { lifestealBonus: 0.15 },
    },
};

function getSkillPool(level) {
    return SKILL_POOLS[level] || [];
}

function getRandomSkillFromPool(level) {
    const pool = getSkillPool(level);
    if (pool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
}

function getSetBonus(skillIds) {
    const count = skillIds.length;
    if (!SET_BONUSES[count]) return null;

    const bonuses = SET_BONUSES[count];
    const skillSet = skillIds.sort().join('+');

    return bonuses[skillSet] || null;
}

function checkSetBonus(slots) {
    const activeSkills = slots
        .filter(slot => slot.skill !== null)
        .map(slot => slot.skill.id);

    if (activeSkills.length < 3) return null;

    return getSetBonus(activeSkills);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SKILL_POOLS,
        SET_BONUSES,
        getSkillPool,
        getRandomSkillFromPool,
        getSetBonus,
        checkSetBonus
    };
}

export { SKILL_POOLS, SET_BONUSES, getSkillPool, getRandomSkillFromPool, getSetBonus, checkSetBonus };
