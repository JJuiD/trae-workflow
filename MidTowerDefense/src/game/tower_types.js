const TOWER_TYPES = {
    archer: {
        id: 'archer',
        name: '箭塔',
        description: '攻速快，伤害低',
        damage: 15,
        attackCooldown: 0.5,
        attackRange: 180,
        attackType: 'physical',
        critRate: 0.15,
        critDamage: 1.5,
        initialSkill: 'quick_shot',
        color: '#4ade80',
        projectileColor: '#22c55e'
    },
    mage: {
        id: 'mage',
        name: '法师塔',
        description: '伤害高，攻速慢',
        damage: 40,
        attackCooldown: 1.5,
        attackRange: 150,
        attackType: 'magic',
        critRate: 0.1,
        critDamage: 2.0,
        initialSkill: 'power_strike',
        color: '#a78bfa',
        projectileColor: '#8b5cf6'
    },
    cannon: {
        id: 'cannon',
        name: '炮塔',
        description: '范围伤害',
        damage: 25,
        attackCooldown: 2.0,
        attackRange: 120,
        attackType: 'aoe',
        critRate: 0.05,
        critDamage: 1.8,
        initialSkill: 'range_boost',
        color: '#f97316',
        projectileColor: '#ea580c'
    },
    guardian: {
        id: 'guardian',
        name: '守卫塔',
        description: '近战，高防御',
        damage: 30,
        attackCooldown: 1.2,
        attackRange: 60,
        attackType: 'physical',
        critRate: 0.1,
        critDamage: 1.5,
        initialSkill: 'shield_aura',
        color: '#60a5fa',
        projectileColor: '#3b82f6'
    },
    support: {
        id: 'support',
        name: '辅助塔',
        description: '治疗/增益/减益/驱散',
        damage: 0,
        attackCooldown: 1.0,
        attackRange: 100,
        attackType: 'support',
        critRate: 0,
        critDamage: 1.0,
        initialSkill: 'heal_aura',
        color: '#34d399',
        projectileColor: '#10b981'
    }
};

function getTowerType(typeId) {
    return TOWER_TYPES[typeId] || null;
}

function getAllTowerTypes() {
    return Object.values(TOWER_TYPES);
}

function isValidTowerType(typeId) {
    return typeId in TOWER_TYPES;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TOWER_TYPES,
        getTowerType,
        getAllTowerTypes,
        isValidTowerType
    };
}

export { TOWER_TYPES, getTowerType, getAllTowerTypes, isValidTowerType };
