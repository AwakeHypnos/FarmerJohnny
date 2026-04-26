const SanityConfig = {
    sanityLevels: {
        normal: {
            id: 'normal',
            name: '正常',
            description: '你的理智保持完整，可以正常进行所有活动。',
            minValue: 70,
            maxValue: 100,
            color: '#9090a0',
            effects: {
                canPlantTaboo: false,
                canUseAltar: false,
                canSeeIllusions: false,
                hasWeedSpawn: false,
                hasAnimalMutation: false,
                hasSanityPenalty: false,
                canUnlockFallenEnding: false
            }
        },
        trance: {
            id: 'trance',
            name: '恍惚',
            description: '你的意识开始模糊，偶尔能看到不该存在的事物。',
            minValue: 50,
            maxValue: 69,
            color: '#7a6a8a',
            effects: {
                canPlantTaboo: false,
                canUseAltar: false,
                canSeeIllusions: false,
                hasWeedSpawn: true,
                hasAnimalMutation: false,
                hasSanityPenalty: false,
                canUnlockFallenEnding: false,
                cropBonusPercent: 10,
                cropPollutionChance: 0.2
            }
        },
        hallucination: {
            id: 'hallucination',
            name: '幻视',
            description: '虚假与真实的界限开始模糊，你看到了不存在的东西。',
            minValue: 30,
            maxValue: 49,
            color: '#6a5a7a',
            effects: {
                canPlantTaboo: false,
                canUseAltar: false,
                canSeeIllusions: true,
                hasWeedSpawn: true,
                hasAnimalMutation: true,
                hasSanityPenalty: false,
                canUnlockFallenEnding: false,
                cropBonusPercent: 20,
                cropPollutionChance: 0.4,
                fakeResourceChance: 0.15,
                fakeArtifactChance: 0.05
            }
        },
        madness: {
            id: 'madness',
            name: '疯狂',
            description: '你已经拥抱了疯狂，古老的知识向你敞开大门。',
            minValue: 10,
            maxValue: 29,
            color: '#5a4a6a',
            effects: {
                canPlantTaboo: true,
                canUseAltar: true,
                canSeeIllusions: true,
                hasWeedSpawn: true,
                hasAnimalMutation: true,
                hasSanityPenalty: true,
                canUnlockFallenEnding: false,
                cropBonusPercent: 30,
                cropPollutionChance: 0.6,
                fakeResourceChance: 0.25,
                fakeArtifactChance: 0.1,
                sanityLossMultiplier: 1.5,
                weirdEventChance: 0.2
            }
        },
        fallen: {
            id: 'fallen',
            name: '沉沦',
            description: '你已经彻底被旧日支配者的力量所侵蚀，成为了它们在人间的代理。',
            minValue: 0,
            maxValue: 9,
            color: '#4a3a5a',
            effects: {
                canPlantTaboo: true,
                canUseAltar: true,
                canSeeIllusions: true,
                hasWeedSpawn: true,
                hasAnimalMutation: true,
                hasSanityPenalty: true,
                canUnlockFallenEnding: true,
                cropBonusPercent: 50,
                cropPollutionChance: 0.8,
                fakeResourceChance: 0.4,
                fakeArtifactChance: 0.2,
                sanityLossMultiplier: 2,
                weirdEventChance: 0.4,
                canUseAbominationFarming: true
            }
        }
    },

    sanityChanges: {
        normalFarming: { value: 1, reason: '常规种植' },
        watering: { value: 0.5, reason: '浇水' },
        weeding: { value: 0.5, reason: '除草' },
        normalCropHarvest: { value: 2, reason: '收获普通作物' },
        normalAnimalCare: { value: 1, reason: '照料普通动物' },
        daytimeWork: { value: 0.2, reason: '白天劳作' },
        
        weirdContact: { value: -5, reason: '接触诡异事物' },
        nightWork: { value: -1, reason: '深夜劳作' },
        fogExploration: { value: -3, reason: '探索迷雾' },
        tabooCropHarvest: { value: -10, reason: '收获禁忌作物' },
        tabooAnimalCare: { value: -5, reason: '照料禁忌生物' },
        ritual: { value: -15, reason: '进行禁忌仪式' },
        sacrifice: { value: -20, reason: '献祭' },
        summoning: { value: -25, reason: '召唤' },
        
        nightmareEvent: { value: -8, reason: '梦魇入侵' },
        spaceRift: { value: -12, reason: '空间裂缝' },
        namelessWhispers: { value: -6, reason: '无名低语' },
        deepSeaVision: { value: -10, reason: '深海异象' },
        
        resting: { value: 3, reason: '休息' },
        prayer: { value: 5, reason: '祈祷' },
        cleansing: { value: 10, reason: '净化' }
    },

    weirdWeeds: {
        corrupted_grass: {
            id: 'corrupted_grass',
            name: '腐化杂草',
            description: '散发着诡异气息的杂草',
            appearanceChance: 0.1,
            removeSanityCost: 0,
            damage: 0,
            onRemove: {
                sanityGain: 1,
                message: '你清除了腐化的杂草，感觉稍微清醒了一些。'
            }
        },
        shadow_vine: {
            id: 'shadow_vine',
            name: '暗影藤蔓',
            description: '似乎有自我意识的藤蔓',
            appearanceChance: 0.05,
            removeSanityCost: 2,
            damage: 0,
            onRemove: {
                sanityGain: 0,
                message: '清除暗影藤蔓让你感到一阵眩晕。'
            }
        },
        eye_flower: {
            id: 'eye_flower',
            name: '眼球花',
            description: '花瓣中心长着一只眼球的诡异花朵',
            appearanceChance: 0.02,
            removeSanityCost: 5,
            damage: 1,
            onRemove: {
                sanityGain: -2,
                message: '眼球花的视线让你感到一阵恶心。'
            }
        }
    },

    fakeResources: {
        fake_gold: {
            id: 'fake_gold',
            name: '虚假金币',
            description: '看起来像金币，实则只是幻象',
            appearanceChance: 0.1,
            illusionDuration: 60,
            onDisappear: '你手中的金币消失了，原来只是幻觉。'
        },
        fake_seed: {
            id: 'fake_seed',
            name: '虚假种子',
            description: '看起来像种子，但无法种植',
            appearanceChance: 0.08,
            illusionDuration: 120,
            onDisappear: '种子在你手中化为乌有。'
        }
    },

    fakeArtifacts: {
        ancient_tablet: {
            id: 'ancient_tablet',
            name: '古老石板',
            description: '刻满未知文字的石板',
            appearanceChance: 0.03,
            sanityOnDiscovery: -3,
            illusionDuration: 180,
            onDisappear: '古老的石板在你眼前消散，只留下模糊的记忆。'
        },
        elder_sign: {
            id: 'elder_sign',
            name: '旧印',
            description: '传说中可以抵御古神的印记',
            appearanceChance: 0.01,
            sanityOnDiscovery: -5,
            illusionDuration: 240,
            onDisappear: '旧印的光芒逐渐暗淡，最终消失不见。'
        }
    },

    getSanityLevel(sanityValue) {
        const levels = Object.values(this.sanityLevels).sort((a, b) => a.minValue - b.minValue);
        for (const level of levels) {
            if (sanityValue >= level.minValue && sanityValue <= level.maxValue) {
                return level;
            }
        }
        return this.sanityLevels.normal;
    },

    getSanityLevelById(levelId) {
        return this.sanityLevels[levelId];
    },

    canPerformAction(sanityValue, action) {
        const level = this.getSanityLevel(sanityValue);
        const effects = level.effects;
        
        switch(action) {
            case 'plantTaboo':
                return effects.canPlantTaboo;
            case 'useAltar':
                return effects.canUseAltar;
            case 'fallenEnding':
                return effects.canUnlockFallenEnding;
            case 'abominationFarming':
                return effects.canUseAbominationFarming;
            default:
                return true;
        }
    },

    getWeedSpawnChance(sanityValue) {
        const level = this.getSanityLevel(sanityValue);
        if (!level.effects.hasWeedSpawn) return 0;
        return 0.05 + (100 - sanityValue) * 0.001;
    },

    getIllusionChance(sanityValue) {
        const level = this.getSanityLevel(sanityValue);
        if (!level.effects.canSeeIllusions) return 0;
        return level.effects.fakeResourceChance || 0;
    },

    getSanityLossMultiplier(sanityValue) {
        const level = this.getSanityLevel(sanityValue);
        return level.effects.sanityLossMultiplier || 1;
    },

    getCropBonusPercent(sanityValue) {
        const level = this.getSanityLevel(sanityValue);
        return level.effects.cropBonusPercent || 0;
    },

    getCropPollutionChance(sanityValue) {
        const level = this.getSanityLevel(sanityValue);
        return level.effects.cropPollutionChance || 0;
    },

    getWeirdEventChance(sanityValue) {
        const level = this.getSanityLevel(sanityValue);
        return level.effects.weirdEventChance || 0;
    }
};

window.SanityConfig = SanityConfig;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SanityConfig;
}
