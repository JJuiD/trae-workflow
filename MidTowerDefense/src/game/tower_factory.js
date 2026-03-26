import { Tower } from './tower.js';
import { getTowerType } from './tower_types.js';
import { createSkill } from './skill.js';

class TowerFactory {
    static create(towerTypeId, x, y, game = null, owner = 'player') {
        const typeConfig = getTowerType(towerTypeId);
        
        if (!typeConfig) {
            console.error(`Unknown tower type: ${towerTypeId}`);
            return null;
        }

        const tower = new Tower(x, y, owner);
        
        tower.damage = typeConfig.damage;
        tower.attackCooldown = typeConfig.attackCooldown;
        tower.attackRange = typeConfig.attackRange;
        tower.attackType = typeConfig.attackType;
        tower.critRate = typeConfig.critRate;
        tower.critDamage = typeConfig.critDamage;
        tower.color = typeConfig.color;
        tower.projectileColor = typeConfig.projectileColor;
        tower.towerTypeId = towerTypeId;

        if (typeConfig.initialSkill && game) {
            const skill = createSkill(typeConfig.initialSkill);
            if (skill) {
                skill.apply(game, tower);
                tower.initialSkill = skill;
            }
        }

        return tower;
    }

    static getPreview(towerTypeId) {
        const typeConfig = getTowerType(towerTypeId);
        if (!typeConfig) return null;

        return {
            id: typeConfig.id,
            name: typeConfig.name,
            description: typeConfig.description,
            damage: typeConfig.damage,
            attackCooldown: typeConfig.attackCooldown,
            attackRange: typeConfig.attackRange,
            attackType: typeConfig.attackType,
            critRate: typeConfig.critRate,
            critDamage: typeConfig.critDamage,
            initialSkill: typeConfig.initialSkill,
            color: typeConfig.color
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TowerFactory };
}

export { TowerFactory };
