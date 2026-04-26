const PlantConfig = {
    _data: {
        cthulhu_seedling: {
            id: 'cthulhu_seedling',
            name: '克苏鲁幼苗',
            stages: ['芽', '幼茎', '克苏鲁幼苗'],
            growthTime: { hours: 24, minutes: 0 },
            seasons: ['spring', 'summer'],
            sellPrice: 50,
            buyPrice: 20,
            description: '神秘的幼苗，据说与古老者有关'
        },
        deep_onion: {
            id: 'deep_onion',
            name: '深渊洋葱',
            stages: ['芽', '鳞茎', '深渊洋葱'],
            growthTime: { hours: 36, minutes: 0 },
            seasons: ['spring', 'autumn'],
            sellPrice: 40,
            buyPrice: 15,
            description: '来自深渊的洋葱，味道奇特'
        },
        nightshade_berry: {
            id: 'nightshade_berry',
            name: '夜影浆果',
            stages: ['芽', '花', '夜影浆果'],
            growthTime: { hours: 48, minutes: 0 },
            seasons: ['summer', 'autumn'],
            sellPrice: 70,
            buyPrice: 30,
            description: '只在夜间生长的神秘浆果'
        },
        frost_mushroom: {
            id: 'frost_mushroom',
            name: '寒霜蘑菇',
            stages: ['孢子', '菌柄', '寒霜蘑菇'],
            growthTime: { hours: 60, minutes: 0 },
            seasons: ['autumn', 'winter'],
            sellPrice: 80,
            buyPrice: 35,
            description: '在寒冷中生长的奇异蘑菇'
        },
        void_wheat: {
            id: 'void_wheat',
            name: '虚空小麦',
            stages: ['芽', '茎', '虚空小麦'],
            growthTime: { hours: 72, minutes: 0 },
            seasons: ['spring', 'summer', 'autumn'],
            sellPrice: 60,
            buyPrice: 25,
            description: '来自虚空的小麦，颗粒饱满'
        },
        dark_pumpkin: {
            id: 'dark_pumpkin',
            name: '黑暗南瓜',
            stages: ['芽', '藤', '黑暗南瓜'],
            growthTime: { hours: 84, minutes: 0 },
            seasons: ['autumn'],
            sellPrice: 100,
            buyPrice: 40,
            description: '万圣节特供，散发着神秘气息'
        },
        starflower_herb: {
            id: 'starflower_herb',
            name: '星花草',
            stages: ['芽', '星蕾', '星花草'],
            growthTime: { hours: 30, minutes: 0 },
            seasons: ['spring'],
            sellPrice: 55,
            buyPrice: 22,
            description: '在星光下绽放的神秘草药'
        },
        bloodroot_tuber: {
            id: 'bloodroot_tuber',
            name: '血根块茎',
            stages: ['芽', '根须', '血根块茎'],
            growthTime: { hours: 42, minutes: 0 },
            seasons: ['spring', 'summer'],
            sellPrice: 65,
            buyPrice: 28,
            description: '汁液呈暗红色的块茎植物'
        },
        moonmoss_spore: {
            id: 'moonmoss_spore',
            name: '月苔孢子',
            stages: ['孢子', '菌丝', '月苔孢子'],
            growthTime: { hours: 54, minutes: 0 },
            seasons: ['summer', 'autumn'],
            sellPrice: 75,
            buyPrice: 32,
            description: '在月光下生长的神秘苔藓'
        },
        shadow_thistle: {
            id: 'shadow_thistle',
            name: '暗影蓟',
            stages: ['芽', '刺叶', '暗影蓟'],
            growthTime: { hours: 66, minutes: 0 },
            seasons: ['autumn', 'winter'],
            sellPrice: 90,
            buyPrice: 38,
            description: '在阴影中生长的带刺植物'
        },
        ghost_lichen: {
            id: 'ghost_lichen',
            name: '幽灵地衣',
            stages: ['孢子', '叶状体', '幽灵地衣'],
            growthTime: { hours: 78, minutes: 0 },
            seasons: ['winter', 'spring'],
            sellPrice: 85,
            buyPrice: 36,
            description: '散发着微弱荧光的神秘地衣'
        },
        elder_vine: {
            id: 'elder_vine',
            name: '古旧藤蔓',
            stages: ['芽', '卷须', '古旧藤蔓'],
            growthTime: { hours: 28, minutes: 0 },
            seasons: ['spring', 'summer', 'autumn', 'winter'],
            sellPrice: 70,
            buyPrice: 30,
            description: '四季皆可生长的神秘藤蔓'
        },
        shoggoth_sprout: {
            id: 'shoggoth_sprout',
            name: '修格斯胚芽',
            stages: ['原质', '不定形', '修格斯胚芽'],
            growthTime: { hours: 96, minutes: 0 },
            seasons: ['spring', 'summer', 'autumn', 'winter'],
            sellPrice: 300,
            buyPrice: 120,
            description: '来自原始深渊的不定形生物组织',
            isTaboo: true,
            requiredSanityLevel: 'madness',
            sanityLossOnHarvest: 15,
            pollutionGainOnHarvest: 10
        },
        deep_one_seed: {
            id: 'deep_one_seed',
            name: '深潜者之种',
            stages: ['鳞芽', '半形', '深潜者之种'],
            growthTime: { hours: 72, minutes: 0 },
            seasons: ['summer', 'autumn'],
            sellPrice: 200,
            buyPrice: 80,
            description: '据说可以召唤深潜者的神秘种子',
            isTaboo: true,
            requiredSanityLevel: 'madness',
            sanityLossOnHarvest: 10,
            pollutionGainOnHarvest: 8
        },
        cthulhu_eye_flower: {
            id: 'cthulhu_eye_flower',
            name: '克苏鲁之眼花',
            stages: ['眼芽', '虹膜', '克苏鲁之眼花'],
            growthTime: { hours: 120, minutes: 0 },
            seasons: ['winter', 'spring'],
            sellPrice: 500,
            buyPrice: 200,
            description: '永远注视着你的存在...',
            isTaboo: true,
            requiredSanityLevel: 'fallen',
            sanityLossOnHarvest: 25,
            pollutionGainOnHarvest: 15
        },
        mi_go_mycelium: {
            id: 'mi_go_mycelium',
            name: '米·戈菌丝',
            stages: ['孢子', '菌丝体', '米·戈菌丝'],
            growthTime: { hours: 84, minutes: 0 },
            seasons: ['autumn', 'winter'],
            sellPrice: 250,
            buyPrice: 100,
            description: '来自遥远星球的真菌生命体',
            isTaboo: true,
            requiredSanityLevel: 'madness',
            sanityLossOnHarvest: 12,
            pollutionGainOnHarvest: 9
        },
        azathoth_core: {
            id: 'azathoth_core',
            name: '阿撒托斯核心',
            stages: ['虚空', '混沌', '阿撒托斯核心'],
            growthTime: { hours: 168, minutes: 0 },
            seasons: ['spring', 'summer', 'autumn', 'winter'],
            sellPrice: 800,
            buyPrice: 300,
            description: '盲目痴愚之神的一小片存在',
            isTaboo: true,
            requiredSanityLevel: 'fallen',
            sanityLossOnHarvest: 35,
            pollutionGainOnHarvest: 25
        },
        nyarlathotep_tendril: {
            id: 'nyarlathotep_tendril',
            name: '奈亚拉托提普触须',
            stages: ['幻影', '伪装', '奈亚拉托提普触须'],
            growthTime: { hours: 60, minutes: 0 },
            seasons: ['spring', 'summer'],
            sellPrice: 180,
            buyPrice: 70,
            description: '千面之神留下的痕迹',
            isTaboo: true,
            requiredSanityLevel: 'madness',
            sanityLossOnHarvest: 8,
            pollutionGainOnHarvest: 6
        },
        yog_sothoth_gate: {
            id: 'yog_sothoth_gate',
            name: '犹格·索托斯之门',
            stages: ['裂隙', '门户', '犹格·索托斯之门'],
            growthTime: { hours: 144, minutes: 0 },
            seasons: ['winter'],
            sellPrice: 600,
            buyPrice: 250,
            description: '连接所有时空的存在碎片',
            isTaboo: true,
            requiredSanityLevel: 'fallen',
            sanityLossOnHarvest: 30,
            pollutionGainOnHarvest: 20
        }
    },

    getPlant(plantId) {
        return this._data[plantId];
    },

    getPlantsBySeason(season) {
        const plants = [];
        for (const [id, plant] of Object.entries(this._data)) {
            if (plant.seasons && plant.seasons.includes(season)) {
                plants.push({ id, ...plant });
            }
        }
        return plants;
    },

    isPlantValidForSeason(plantId, season) {
        const plant = this.getPlant(plantId);
        return plant && plant.seasons && plant.seasons.includes(season);
    },

    getAllPlants() {
        return this._data;
    },

    getAllPlantIds() {
        return Object.keys(this._data);
    },

    getMultiSeasonPlants() {
        const plants = [];
        for (const [id, plant] of Object.entries(this._data)) {
            if (plant.seasons && plant.seasons.length > 1) {
                plants.push({ id, ...plant });
            }
        }
        return plants;
    },

    isPlantTaboo(plantId) {
        const plant = this.getPlant(plantId);
        return plant && plant.isTaboo === true;
    },

    getTabooPlants() {
        const plants = [];
        for (const [id, plant] of Object.entries(this._data)) {
            if (plant.isTaboo) {
                plants.push({ id, ...plant });
            }
        }
        return plants;
    },

    getTabooPlantsBySeason(season) {
        const plants = [];
        for (const [id, plant] of Object.entries(this._data)) {
            if (plant.isTaboo && plant.seasons && plant.seasons.includes(season)) {
                plants.push({ id, ...plant });
            }
        }
        return plants;
    },

    getRequiredSanityLevel(plantId) {
        const plant = this.getPlant(plantId);
        return plant ? plant.requiredSanityLevel : null;
    }
};

window.PlantConfig = PlantConfig;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlantConfig;
}
