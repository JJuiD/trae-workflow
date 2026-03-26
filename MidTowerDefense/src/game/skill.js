const MS_PER_SECOND = 1000;

const PASSIVE_EFFECTS = {
    damage_boost: (entity, value) => {
        entity.damage *= (1 + value);
    },
    attack_speed: (entity, value) => {
        entity.attackSpeed *= (1 + value);
    },
    range_boost: (entity, value) => {
        entity.attackRange *= (1 + value);
    },
};

const TIMED_EFFECTS = {
    fireball: (game, entity, config) => {
        const intervalId = setInterval(() => {
            if (!entity.isAlive) {
                clearInterval(intervalId);
                return;
            }
            const target = game.entityManager.getNearestEnemy(entity.x, entity.y);
            if (target) {
                game.projectiles.spawn({
                    x: entity.x,
                    y: entity.y,
                    targetId: target.id,
                    damage: config.damage,
                    speed: config.speed,
                    type: 'fireball'
                });
            }
        }, config.interval * MS_PER_SECOND);

        const cleanup = () => clearInterval(intervalId);
        entity.on('death', cleanup);
        entity.skillCleanup = entity.skillCleanup || [];
        entity.skillCleanup.push(cleanup);

        return intervalId;
    },
    lightning_strike: (game, entity, config) => {
        const intervalId = setInterval(() => {
            if (!entity.isAlive) {
                clearInterval(intervalId);
                return;
            }
            const targets = game.entityManager.getEnemiesInRange(
                entity.x, entity.y, config.range
            );
            targets.forEach(target => {
                target.takeDamage(config.damage);
            });
        }, config.interval * MS_PER_SECOND);

        const cleanup = () => clearInterval(intervalId);
        entity.on('death', cleanup);
        entity.skillCleanup = entity.skillCleanup || [];
        entity.skillCleanup.push(cleanup);

        return intervalId;
    },
    heal_aura: (game, entity, config) => {
        const intervalId = setInterval(() => {
            if (!entity.isAlive) {
                clearInterval(intervalId);
                return;
            }
            const towers = game.entityManager.towers || [];
            towers.forEach(tower => {
                if (!tower.isAlive) return;
                const dx = tower.x - entity.x;
                const dy = tower.y - entity.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= config.range) {
                    tower.heal(config.healValue);
                }
            });
            if (game.crystal && game.crystal.isAlive && game.crystal.isAlive()) {
                const dx = game.crystal.x - entity.x;
                const dy = game.crystal.y - entity.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= config.range) {
                    game.crystal.heal(config.healValue);
                }
            }
        }, config.interval * MS_PER_SECOND);

        const cleanup = () => clearInterval(intervalId);
        entity.on('death', cleanup);
        entity.skillCleanup = entity.skillCleanup || [];
        entity.skillCleanup.push(cleanup);

        return intervalId;
    },
};

const TRIGGER_EFFECTS = {
    shield_on_hit: (entity, config) => {
        const handler = (damageData) => {
            const now = Date.now();
            const lastTime = entity.lastShieldTime || 0;
            if (now - lastTime >= config.cooldown * MS_PER_SECOND) {
                entity.addShield(config.shieldValue);
                entity.lastShieldTime = now;
            }
        };
        entity.on('damaged', handler);
        return handler;
    },
    heal_on_kill: (entity, config) => {
        const handler = () => {
            const now = Date.now();
            const lastTime = entity.lastHealTime || 0;
            if (now - lastTime >= config.cooldown * MS_PER_SECOND) {
                entity.heal(config.healValue);
                entity.lastHealTime = now;
            }
        };
        entity.on('killEnemy', handler);
        return handler;
    },
    rage_below_30hp: (entity, config) => {
        const handler = () => {
            const ratio = entity.hp / entity.maxHp;
            if (ratio < 0.3 && !entity.rageActive) {
                entity.damage *= (1 + config.damageBoost);
                entity.rageActive = true;
            }
        };
        entity.on('healthChanged', handler);
        return handler;
    },
};

class PassiveSkill {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.level = config.level;
        this.category = config.category;
        this.effect = config.effect;
    }

    apply(game, entity) {
        const effectType = this.effect.type;
        const effectConfig = { ...this.effect };
        delete effectConfig.type;

        if (this.category === 'passive') {
            const effectFn = PASSIVE_EFFECTS[effectType];
            if (effectFn) {
                effectFn(entity, effectConfig.value);
            }
        } else if (this.category === 'timed') {
            const effectFn = TIMED_EFFECTS[effectType];
            if (effectFn) {
                const timerId = effectFn(game, entity, effectConfig);
                entity.skillTimers = entity.skillTimers || {};
                entity.skillTimers[this.id] = timerId;
            }
        } else if (this.category === 'trigger') {
            const effectFn = TRIGGER_EFFECTS[effectType];
            if (effectFn) {
                const handler = effectFn(entity, effectConfig);
                entity.skillHandlers = entity.skillHandlers || {};
                entity.skillHandlers[this.id] = handler;
            }
        }
    }

    remove(entity) {
        if (entity.skillTimers && entity.skillTimers[this.id]) {
            clearInterval(entity.skillTimers[this.id]);
            delete entity.skillTimers[this.id];
        }
        if (entity.skillHandlers && entity.skillHandlers[this.id]) {
            entity.off('damaged', entity.skillHandlers[this.id]);
            entity.off('killEnemy', entity.skillHandlers[this.id]);
            entity.off('healthChanged', entity.skillHandlers[this.id]);
            delete entity.skillHandlers[this.id];
        }
    }
}

const SKILL_CONFIGS = {
    'power_strike': {
        id: 'power_strike',
        name: '强力一击',
        description: '提升攻击力',
        category: 'passive',
        level: 1,
        effect: { type: 'damage_boost', value: 0.2 }
    },
    'quick_shot': {
        id: 'quick_shot',
        name: '快速射击',
        description: '提升攻击速度',
        category: 'passive',
        level: 1,
        effect: { type: 'attack_speed', value: 0.15 }
    },
    'range_boost': {
        id: 'range_boost',
        name: '视野增强',
        description: '提升攻击范围',
        category: 'passive',
        level: 1,
        effect: { type: 'range_boost', value: 0.2 }
    },
    'heal_aura': {
        id: 'heal_aura',
        name: '治疗光环',
        description: '周期性治疗范围内友军',
        category: 'timed',
        level: 1,
        effect: {
            type: 'heal_aura',
            interval: 2,
            healValue: 10,
            range: 100
        }
    },
    'fireball': {
        id: 'fireball',
        name: '火球术',
        description: '每隔3秒发射一个火球',
        category: 'timed',
        level: 2,
        effect: {
            type: 'fireball',
            interval: 3,
            damage: 50,
            speed: 200
        }
    },
    'ice_arrow': {
        id: 'ice_arrow',
        name: '寒冰箭',
        description: '每隔2.5秒发射寒冰箭',
        category: 'timed',
        level: 2,
        effect: {
            type: 'fireball',
            interval: 2.5,
            damage: 40,
            speed: 250
        }
    },
    'chain_lightning': {
        id: 'chain_lightning',
        name: '链式闪电',
        description: '每隔2秒对范围内敌人造成伤害',
        category: 'timed',
        level: 3,
        effect: {
            type: 'lightning_strike',
            interval: 2,
            damage: 30,
            range: 100
        }
    },
    'meteor': {
        id: 'meteor',
        name: '陨石',
        description: '每隔5秒召唤陨石',
        category: 'timed',
        level: 3,
        effect: {
            type: 'lightning_strike',
            interval: 5,
            damage: 80,
            range: 80
        }
    },
    'heal': {
        id: 'heal',
        name: '治疗',
        description: '立即恢复生命值',
        category: 'active',
        level: 4,
        effect: { type: 'heal', value: 100, cooldown: 10 }
    },
    'shield_aura': {
        id: 'shield_aura',
        name: '护盾光环',
        description: '受到伤害时生成护盾，冷却5秒',
        category: 'trigger',
        level: 4,
        effect: {
            type: 'shield_on_hit',
            cooldown: 5,
            shieldValue: 50
        }
    },
    'vampire': {
        id: 'vampire',
        name: '吸血',
        description: '击杀敌人时恢复生命，冷却3秒',
        category: 'trigger',
        level: 5,
        effect: {
            type: 'heal_on_kill',
            cooldown: 3,
            healValue: 30
        }
    },
    'apocalypse': {
        id: 'apocalypse',
        name: '末日审判',
        description: '每隔10秒对所有敌人造成大量伤害',
        category: 'timed',
        level: 5,
        effect: {
            type: 'lightning_strike',
            interval: 10,
            damage: 150,
            range: 500
        }
    },
    'sharp_arrow': {
        id: 'sharp_arrow',
        name: '锐利箭矢',
        description: '提升暴击率',
        category: 'passive',
        level: 1,
        effect: { type: 'crit_rate', value: 0.1 }
    },
    'iron_will': {
        id: 'iron_will',
        name: '钢铁意志',
        description: '提升防御力',
        category: 'passive',
        level: 1,
        effect: { type: 'defense', value: 0.15 }
    },
    'poison_dart': {
        id: 'poison_dart',
        name: '毒镖',
        description: '每隔3秒发射毒镖',
        category: 'timed',
        level: 2,
        effect: {
            type: 'fireball',
            interval: 3,
            damage: 25,
            speed: 180
        }
    },
    'lightning_bolt': {
        id: 'lightning_bolt',
        name: '闪电箭',
        description: '每隔2秒发射闪电箭',
        category: 'timed',
        level: 2,
        effect: {
            type: 'fireball',
            interval: 2,
            damage: 35,
            speed: 300
        }
    },
    'frost_nova': {
        id: 'frost_nova',
        name: '冰霜新星',
        description: '每隔4秒释放冰霜新星',
        category: 'timed',
        level: 3,
        effect: {
            type: 'lightning_strike',
            interval: 4,
            damage: 45,
            range: 120
        }
    },
    'flame_wave': {
        id: 'flame_wave',
        name: '火焰波',
        description: '每隔3秒释放火焰波',
        category: 'timed',
        level: 3,
        effect: {
            type: 'lightning_strike',
            interval: 3,
            damage: 55,
            range: 90
        }
    },
    'regeneration': {
        id: 'regeneration',
        name: '再生',
        description: '持续恢复生命值',
        category: 'passive',
        level: 4,
        effect: { type: 'heal', value: 5, interval: 1 }
    },
    'magic_barrier': {
        id: 'magic_barrier',
        name: '魔法护盾',
        description: '受到伤害时生成魔法护盾',
        category: 'trigger',
        level: 4,
        effect: {
            type: 'shield_on_hit',
            cooldown: 8,
            shieldValue: 80
        }
    },
    'thunder_storm': {
        id: 'thunder_storm',
        name: '雷霆风暴',
        description: '每隔6秒召唤雷霆',
        category: 'timed',
        level: 5,
        effect: {
            type: 'lightning_strike',
            interval: 6,
            damage: 120,
            range: 150
        }
    },
    'inferno': {
        id: 'inferno',
        name: '地狱火',
        description: '每隔4秒释放地狱火',
        category: 'timed',
        level: 5,
        effect: {
            type: 'lightning_strike',
            interval: 4,
            damage: 100,
            range: 100
        }
    },
};

function createSkill(configId) {
    const config = SKILL_CONFIGS[configId];
    if (!config) {
        console.warn(`Skill config not found: ${configId}`);
        return null;
    }
    return new PassiveSkill(config);
}

function getSkillById(id) {
    return SKILL_CONFIGS[id] ? new PassiveSkill(SKILL_CONFIGS[id]) : null;
}

function getSkillsByLevel(level) {
    return Object.values(SKILL_CONFIGS)
        .filter(config => config.level === level)
        .map(config => new PassiveSkill(config));
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PassiveSkill,
        SKILL_CONFIGS,
        PASSIVE_EFFECTS,
        TIMED_EFFECTS,
        TRIGGER_EFFECTS,
        createSkill,
        getSkillById,
        getSkillsByLevel
    };
}

export { PassiveSkill, SKILL_CONFIGS, PASSIVE_EFFECTS, TIMED_EFFECTS, TRIGGER_EFFECTS, createSkill, getSkillById, getSkillsByLevel };
