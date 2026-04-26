const PollutionConfig = {
    pollutionLevels: {
        0: {
            id: 0,
            name: '纯净',
            description: '土地保持着相对纯净的状态。',
            minValue: 0,
            maxValue: 19,
            color: '#5a7a5a',
            effects: {
                environmentChanges: [],
                cropPenalty: 0,
                tabooCropBonus: 0,
                animalMutationChance: 0,
                negativeEventChance: 0
            }
        },
        1: {
            id: 1,
            name: '轻微污染',
            description: '土地开始散发微弱的诡异气息。',
            minValue: 20,
            maxValue: 39,
            color: '#5a6a5a',
            effects: {
                environmentChanges: ['weak_fog'],
                cropPenalty: 0.05,
                tabooCropBonus: 0.1,
                animalMutationChance: 0.05,
                negativeEventChance: 0.05
            }
        },
        2: {
            id: 2,
            name: '中度污染',
            description: '天空开始出现不寻常的颜色变化。',
            minValue: 40,
            maxValue: 59,
            color: '#6a5a5a',
            effects: {
                environmentChanges: ['discolored_sky', 'weak_fog'],
                cropPenalty: 0.15,
                tabooCropBonus: 0.25,
                animalMutationChance: 0.15,
                negativeEventChance: 0.1
            }
        },
        3: {
            id: 3,
            name: '重度污染',
            description: '昼夜开始错乱，地面渗出诡异的粘液。',
            minValue: 60,
            maxValue: 79,
            color: '#7a5a6a',
            effects: {
                environmentChanges: ['daynight_confusion', 'permanent_fog', 'slime_ground', 'grayish_sky'],
                cropPenalty: 0.3,
                tabooCropBonus: 0.5,
                animalMutationChance: 0.3,
                negativeEventChance: 0.2
            }
        },
        4: {
            id: 4,
            name: '深渊污染',
            description: '裂隙在地面蔓延，深海异象出现在内陆。',
            minValue: 80,
            maxValue: 99,
            color: '#5a4a6a',
            effects: {
                environmentChanges: ['daynight_confusion', 'permanent_fog', 'slime_ground', 'purple_sky', 'rifts'],
                cropPenalty: 0.5,
                tabooCropBonus: 0.8,
                animalMutationChance: 0.5,
                negativeEventChance: 0.35
            }
        },
        5: {
            id: 5,
            name: '彻底腐化',
            description: '土地已彻底被旧日支配者的力量所侵蚀。',
            minValue: 100,
            maxValue: 200,
            color: '#4a3a5a',
            effects: {
                environmentChanges: ['daynight_confusion', 'permanent_fog', 'slime_ground', 'blood_sky', 'rifts', 'deep_sea_vision'],
                cropPenalty: 0.7,
                tabooCropBonus: 1.2,
                animalMutationChance: 0.8,
                negativeEventChance: 0.5
            }
        }
    },

    environmentChanges: {
        weak_fog: {
            id: 'weak_fog',
            name: '薄雾笼罩',
            description: '薄雾开始笼罩这片土地，能见度降低。',
            visualEffect: 'light_fog',
            visibilityReduction: 0.2
        },
        permanent_fog: {
            id: 'permanent_fog',
            name: '永久大雾',
            description: '厚重的雾气永远不会消散。',
            visualEffect: 'heavy_fog',
            visibilityReduction: 0.5
        },
        discolored_sky: {
            id: 'discolored_sky',
            name: '天空变色',
            description: '天空出现不自然的灰紫色调。',
            visualEffect: 'grayish_sky'
        },
        grayish_sky: {
            id: 'grayish_sky',
            name: '灰暗天空',
            description: '天空永远是灰暗的。',
            visualEffect: 'dark_gray_sky'
        },
        purple_sky: {
            id: 'purple_sky',
            name: '暗紫天空',
            description: '天空变成了诡异的暗紫色。',
            visualEffect: 'purple_sky'
        },
        blood_sky: {
            id: 'blood_sky',
            name: '血色天空',
            description: '天空如血般鲜红。',
            visualEffect: 'blood_red_sky'
        },
        daynight_confusion: {
            id: 'daynight_confusion',
            name: '昼夜错乱',
            description: '白天和黑夜的界限变得模糊，时间流逝混乱。',
            effect: 'time_distortion',
            dayNightBlend: true
        },
        slime_ground: {
            id: 'slime_ground',
            name: '粘液渗出',
            description: '地面开始渗出未知的粘稠液体。',
            visualEffect: 'slime_on_ground',
            cropDamageChance: 0.1
        },
        rifts: {
            id: 'rifts',
            name: '裂隙蔓延',
            description: '空间裂隙在地面上蔓延，通向未知的维度。',
            visualEffect: 'rift_effects',
            randomTeleportChance: 0.05
        },
        deep_sea_vision: {
            id: 'deep_sea_vision',
            name: '深海异象',
            description: '即使在内陆，你也能看到深海的景象。',
            visualEffect: 'deep_sea_overlay',
            hallucinationChance: 0.2
        }
    },

    pollutionSources: {
        tabooCropPlant: { value: 5, reason: '种植禁忌作物' },
        tabooCropHarvest: { value: 10, reason: '收获禁忌作物' },
        ritual: { value: 15, reason: '进行禁忌仪式' },
        sacrifice: { value: 25, reason: '献祭' },
        summoning: { value: 30, reason: '召唤' },
        tabooAnimalCare: { value: 3, reason: '照料禁忌生物' },
        usingBlackFertilizer: { value: 8, reason: '使用黑暗肥料' },
        ignoringNegativeEvent: { value: 10, reason: '忽略负面事件' },
        
        cleansing: { value: -15, reason: '净化仪式' },
        normalFarming: { value: -1, reason: '常规种植' },
        praying: { value: -5, reason: '祈祷' }
    },

    negativeEvents: {
        nightmare_invasion: {
            id: 'nightmare_invasion',
            name: '梦魇入侵',
            description: '来自梦境的恐怖实体闯入了现实世界。',
            baseChance: 0.1,
            minPollutionLevel: 2,
            effects: {
                sanityLoss: 8,
                cropDamageChance: 0.3,
                animalPanicChance: 0.4
            },
            canPrevent: true,
            preventionCost: { money: 100, sanity: 3 }
        },
        space_rift: {
            id: 'space_rift',
            name: '空间裂缝',
            description: '一道通往未知维度的裂缝在你面前打开。',
            baseChance: 0.08,
            minPollutionLevel: 3,
            effects: {
                sanityLoss: 12,
                itemLossChance: 0.4,
                maybeGain: true
            },
            canPrevent: true,
            preventionCost: { money: 200, sanity: 5 }
        },
        nameless_whispers: {
            id: 'nameless_whispers',
            name: '无名低语',
            description: '你听到了来自四面八方的低语声，无法辨别来源。',
            baseChance: 0.15,
            minPollutionLevel: 2,
            effects: {
                sanityLoss: 6,
                confusedActions: true
            },
            canPrevent: false
        },
        deep_sea_flood: {
            id: 'deep_sea_flood',
            name: '海潮倒灌',
            description: '即使在内陆，深海的咸水也从地下涌出。',
            baseChance: 0.06,
            minPollutionLevel: 4,
            effects: {
                sanityLoss: 10,
                cropDestructionChance: 0.5,
                animalInjuryChance: 0.3
            },
            canPrevent: true,
            preventionCost: { money: 300, sanity: 8 }
        },
        shadow_manifestation: {
            id: 'shadow_manifestation',
            name: '阴影显现',
            description: '地面上的阴影开始有了自己的意志。',
            baseChance: 0.12,
            minPollutionLevel: 3,
            effects: {
                sanityLoss: 7,
                resourceTheftChance: 0.25
            },
            canPrevent: true,
            preventionCost: { money: 150, sanity: 4 }
        }
    },

    getPollutionLevel(pollutionValue) {
        const levels = Object.values(this.pollutionLevels).sort((a, b) => a.id - b.id);
        for (const level of levels) {
            if (pollutionValue >= level.minValue && pollutionValue <= level.maxValue) {
                return level;
            }
        }
        return this.pollutionLevels[5];
    },

    getPollutionLevelById(levelId) {
        return this.pollutionLevels[levelId];
    },

    getEnvironmentChange(changeId) {
        return this.environmentChanges[changeId];
    },

    getNegativeEvent(eventId) {
        return this.negativeEvents[eventId];
    },

    getAvailableNegativeEvents(pollutionValue) {
        const level = this.getPollutionLevel(pollutionValue);
        const events = [];
        
        for (const [id, event] of Object.entries(this.negativeEvents)) {
            if (event.minPollutionLevel <= level.id) {
                const adjustedChance = event.baseChance * (1 + (pollutionValue / 100));
                events.push({
                    ...event,
                    adjustedChance: Math.min(adjustedChance, 0.5)
                });
            }
        }
        
        return events;
    },

    getCropPenalty(pollutionValue) {
        const level = this.getPollutionLevel(pollutionValue);
        return level.effects.cropPenalty;
    },

    getTabooCropBonus(pollutionValue) {
        const level = this.getPollutionLevel(pollutionValue);
        return level.effects.tabooCropBonus;
    },

    getAnimalMutationChance(pollutionValue) {
        const level = this.getPollutionLevel(pollutionValue);
        return level.effects.animalMutationChance;
    },

    getNegativeEventChance(pollutionValue) {
        const level = this.getPollutionLevel(pollutionValue);
        return level.effects.negativeEventChance;
    },

    getActiveEnvironmentEffects(pollutionValue) {
        const level = this.getPollutionLevel(pollutionValue);
        const effects = [];
        
        for (const changeId of level.effects.environmentChanges) {
            const change = this.environmentChanges[changeId];
            if (change) {
                effects.push(change);
            }
        }
        
        return effects;
    }
};

window.PollutionConfig = PollutionConfig;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PollutionConfig;
}
