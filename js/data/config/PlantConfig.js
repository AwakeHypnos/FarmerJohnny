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
            description: '神秘的幼苗，据说与古老者有关',
            animalBait: ['dark_fox', 'twisted_owl'],
            baitChanceBonus: 0.15
        },
        deep_onion: {
            id: 'deep_onion',
            name: '深渊洋葱',
            stages: ['芽', '鳞茎', '深渊洋葱'],
            growthTime: { hours: 36, minutes: 0 },
            seasons: ['spring', 'autumn'],
            sellPrice: 40,
            buyPrice: 15,
            description: '来自深渊的洋葱，味道奇特',
            animalFeed: ['domestic_rabbit', 'domestic_goat']
        },
        nightshade_berry: {
            id: 'nightshade_berry',
            name: '夜影浆果',
            stages: ['芽', '花', '夜影浆果'],
            growthTime: { hours: 48, minutes: 0 },
            seasons: ['summer', 'autumn'],
            sellPrice: 70,
            buyPrice: 30,
            description: '只在夜间生长的神秘浆果',
            animalBait: ['gray_rabbit', 'dark_fox'],
            baitChanceBonus: 0.2,
            captureBonus: 0.1
        },
        frost_mushroom: {
            id: 'frost_mushroom',
            name: '寒霜蘑菇',
            stages: ['孢子', '菌柄', '寒霜蘑菇'],
            growthTime: { hours: 60, minutes: 0 },
            seasons: ['autumn', 'winter'],
            sellPrice: 80,
            buyPrice: 35,
            description: '在寒冷中生长的奇异蘑菇',
            animalFeed: ['domestic_toad'],
            animalBait: ['pale_deer'],
            baitChanceBonus: 0.15
        },
        void_wheat: {
            id: 'void_wheat',
            name: '虚空小麦',
            stages: ['芽', '茎', '虚空小麦'],
            growthTime: { hours: 72, minutes: 0 },
            seasons: ['spring', 'summer', 'autumn'],
            sellPrice: 60,
            buyPrice: 25,
            description: '来自虚空的小麦，颗粒饱满',
            animalFeed: ['domestic_chicken', 'domestic_goat', 'domestic_rabbit']
        },
        dark_pumpkin: {
            id: 'dark_pumpkin',
            name: '黑暗南瓜',
            stages: ['芽', '藤', '黑暗南瓜'],
            growthTime: { hours: 84, minutes: 0 },
            seasons: ['autumn'],
            sellPrice: 100,
            buyPrice: 40,
            description: '万圣节特供，散发着神秘气息',
            animalFeed: ['domestic_chicken', 'domestic_goat', 'domestic_fox'],
            animalBait: ['pale_deer', 'shadow_goat'],
            baitChanceBonus: 0.2
        },
        starflower_herb: {
            id: 'starflower_herb',
            name: '星花草',
            stages: ['芽', '星蕾', '星花草'],
            growthTime: { hours: 30, minutes: 0 },
            seasons: ['spring'],
            sellPrice: 55,
            buyPrice: 22,
            description: '在星光下绽放的神秘草药',
            animalBait: ['pale_deer', 'twisted_owl'],
            baitChanceBonus: 0.25,
            captureBonus: 0.15
        },
        bloodroot_tuber: {
            id: 'bloodroot_tuber',
            name: '血根块茎',
            stages: ['芽', '根须', '血根块茎'],
            growthTime: { hours: 42, minutes: 0 },
            seasons: ['spring', 'summer'],
            sellPrice: 65,
            buyPrice: 28,
            description: '汁液呈暗红色的块茎植物',
            animalFeed: ['domestic_fox', 'domestic_deer']
        },
        moonmoss_spore: {
            id: 'moonmoss_spore',
            name: '月苔孢子',
            stages: ['孢子', '菌丝', '月苔孢子'],
            growthTime: { hours: 54, minutes: 0 },
            seasons: ['summer', 'autumn'],
            sellPrice: 75,
            buyPrice: 32,
            description: '在月光下生长的神秘苔藓',
            animalFeed: ['domestic_toad'],
            animalBait: ['slimy_toad'],
            baitChanceBonus: 0.2,
            captureBonus: 0.1
        },
        shadow_thistle: {
            id: 'shadow_thistle',
            name: '暗影蓟',
            stages: ['芽', '刺叶', '暗影蓟'],
            growthTime: { hours: 66, minutes: 0 },
            seasons: ['autumn', 'winter'],
            sellPrice: 90,
            buyPrice: 38,
            description: '在阴影中生长的带刺植物',
            animalBait: ['shadow_goat', 'dark_fox'],
            baitChanceBonus: 0.15
        },
        ghost_lichen: {
            id: 'ghost_lichen',
            name: '幽灵地衣',
            stages: ['孢子', '叶状体', '幽灵地衣'],
            growthTime: { hours: 78, minutes: 0 },
            seasons: ['winter', 'spring'],
            sellPrice: 85,
            buyPrice: 36,
            description: '散发着微弱荧光的神秘地衣',
            animalFeed: ['domestic_owl', 'domestic_deer'],
            animalBait: ['twisted_owl', 'pale_deer'],
            baitChanceBonus: 0.2
        },
        elder_vine: {
            id: 'elder_vine',
            name: '古旧藤蔓',
            stages: ['芽', '卷须', '古旧藤蔓'],
            growthTime: { hours: 28, minutes: 0 },
            seasons: ['spring', 'summer', 'autumn', 'winter'],
            sellPrice: 70,
            buyPrice: 30,
            description: '四季皆可生长的神秘藤蔓',
            animalBait: ['gray_rabbit', 'pale_chicken', 'slimy_toad'],
            baitChanceBonus: 0.1
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
        },
        misty_tomato: {
            id: 'misty_tomato',
            name: '迷雾番茄',
            stages: ['芽', '藤', '迷雾番茄'],
            growthTime: { hours: 32, minutes: 0 },
            seasons: ['spring', 'summer'],
            sellPrice: 35,
            buyPrice: 12,
            description: '被薄雾笼罩的多汁番茄',
            animalFeed: ['domestic_rabbit', 'domestic_chicken']
        },
        shadow_potato: {
            id: 'shadow_potato',
            name: '暗影土豆',
            stages: ['芽', '叶', '暗影土豆'],
            growthTime: { hours: 40, minutes: 0 },
            seasons: ['spring', 'autumn'],
            sellPrice: 30,
            buyPrice: 10,
            description: '生长在阴暗处的饱满土豆',
            animalFeed: ['domestic_rabbit', 'domestic_goat', 'domestic_pig']
        },
        twilight_carrot: {
            id: 'twilight_carrot',
            name: '薄暮胡萝卜',
            stages: ['芽', '叶', '薄暮胡萝卜'],
            growthTime: { hours: 28, minutes: 0 },
            seasons: ['spring', 'autumn'],
            sellPrice: 28,
            buyPrice: 9,
            description: '在黄昏时刻最为鲜艳',
            animalFeed: ['domestic_rabbit', 'domestic_goat', 'domestic_horse'],
            animalBait: ['gray_rabbit', 'pale_deer'],
            baitChanceBonus: 0.1
        },
        gloomy_cabbage: {
            id: 'gloomy_cabbage',
            name: '阴郁卷心菜',
            stages: ['芽', '叶球', '阴郁卷心菜'],
            growthTime: { hours: 48, minutes: 0 },
            seasons: ['spring', 'autumn', 'winter'],
            sellPrice: 32,
            buyPrice: 11,
            description: '叶片上似乎永远带着露珠',
            animalFeed: ['domestic_rabbit', 'domestic_goat', 'domestic_cow']
        },
        pale_cucumber: {
            id: 'pale_cucumber',
            name: '苍白黄瓜',
            stages: ['芽', '藤', '苍白黄瓜'],
            growthTime: { hours: 36, minutes: 0 },
            seasons: ['summer'],
            sellPrice: 33,
            buyPrice: 11,
            description: '颜色异常苍白但口感清脆',
            animalFeed: ['domestic_chicken', 'domestic_pig']
        },
        sunken_corn: {
            id: 'sunken_corn',
            name: '沉渊玉米',
            stages: ['芽', '茎', '沉渊玉米'],
            growthTime: { hours: 60, minutes: 0 },
            seasons: ['spring', 'summer'],
            sellPrice: 38,
            buyPrice: 13,
            description: '据说来自沉没的古老农田',
            animalFeed: ['domestic_chicken', 'domestic_cow', 'domestic_pig', 'domestic_horse'],
            animalBait: ['pale_chicken', 'shadow_goat'],
            baitChanceBonus: 0.12
        },
        frostlettuce: {
            id: 'frostlettuce',
            name: '霜生菜',
            stages: ['芽', '叶簇', '霜生菜'],
            growthTime: { hours: 30, minutes: 0 },
            seasons: ['spring', 'autumn', 'winter'],
            sellPrice: 25,
            buyPrice: 8,
            description: '叶片上有天然的冰晶纹理',
            animalFeed: ['domestic_rabbit', 'domestic_goat']
        },
        crimson_strawberry: {
            id: 'crimson_strawberry',
            name: '绯红草莓',
            stages: ['芽', '花', '绯红草莓'],
            growthTime: { hours: 44, minutes: 0 },
            seasons: ['spring', 'summer'],
            sellPrice: 45,
            buyPrice: 16,
            description: '颜色如血般鲜红的草莓',
            animalFeed: ['domestic_rabbit', 'domestic_chicken', 'domestic_pig'],
            animalBait: ['gray_rabbit', 'dark_fox'],
            baitChanceBonus: 0.15
        },
        morning_apple: {
            id: 'morning_apple',
            name: '晨露苹果',
            stages: ['芽', '花', '晨露苹果'],
            growthTime: { hours: 72, minutes: 0 },
            seasons: ['spring', 'autumn'],
            sellPrice: 50,
            buyPrice: 18,
            description: '只在清晨采摘才会保持新鲜',
            animalFeed: ['domestic_rabbit', 'domestic_goat', 'domestic_pig', 'domestic_horse'],
            animalBait: ['pale_deer', 'dark_fox'],
            baitChanceBonus: 0.18,
            captureBonus: 0.05
        },
        moon_pear: {
            id: 'moon_pear',
            name: '月光梨',
            stages: ['芽', '花', '月光梨'],
            growthTime: { hours: 66, minutes: 0 },
            seasons: ['spring', 'autumn'],
            sellPrice: 48,
            buyPrice: 17,
            description: '在月光下散发微弱光芒',
            animalFeed: ['domestic_rabbit', 'domestic_goat', 'domestic_horse'],
            animalBait: ['pale_deer', 'twisted_owl'],
            baitChanceBonus: 0.15
        },
        silver_grape: {
            id: 'silver_grape',
            name: '银葡萄',
            stages: ['芽', '藤', '银葡萄'],
            growthTime: { hours: 56, minutes: 0 },
            seasons: ['summer', 'autumn'],
            sellPrice: 55,
            buyPrice: 20,
            description: '果实呈现银色光泽',
            animalFeed: ['domestic_chicken', 'domestic_pig', 'domestic_goat'],
            animalBait: ['dark_fox', 'twisted_owl'],
            baitChanceBonus: 0.16
        },
        clay_rice: {
            id: 'clay_rice',
            name: '黏土水稻',
            stages: ['芽', '茎', '黏土水稻'],
            growthTime: { hours: 64, minutes: 0 },
            seasons: ['spring', 'summer'],
            sellPrice: 42,
            buyPrice: 15,
            description: '生长在特殊黏土中的水稻',
            animalFeed: ['domestic_chicken', 'domestic_duck', 'domestic_pig']
        },
        hollow_bean: {
            id: 'hollow_bean',
            name: '空洞大豆',
            stages: ['芽', '荚', '空洞大豆'],
            growthTime: { hours: 42, minutes: 0 },
            seasons: ['spring', 'summer', 'autumn'],
            sellPrice: 36,
            buyPrice: 13,
            description: '豆荚内似乎回荡着低语',
            animalFeed: ['domestic_chicken', 'domestic_duck', 'domestic_pig', 'domestic_cow']
        },
        ancient_onion: {
            id: 'ancient_onion',
            name: '远古洋葱',
            stages: ['芽', '鳞茎', '远古洋葱'],
            growthTime: { hours: 38, minutes: 0 },
            seasons: ['spring', 'autumn', 'winter'],
            sellPrice: 34,
            buyPrice: 12,
            description: '据说这种洋葱已存在千年',
            animalFeed: ['domestic_rabbit', 'domestic_goat', 'domestic_cow'],
            animalBait: ['slimy_toad'],
            baitChanceBonus: 0.1
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
    },

    getFeedCropsByAnimal(animalType) {
        const crops = [];
        for (const [id, plant] of Object.entries(this._data)) {
            if (plant.animalFeed && plant.animalFeed.includes(animalType)) {
                crops.push({ id, ...plant });
            }
        }
        return crops;
    },

    getBaitCropsByAnimal(wildAnimalType) {
        const crops = [];
        for (const [id, plant] of Object.entries(this._data)) {
            if (plant.animalBait && plant.animalBait.includes(wildAnimalType)) {
                crops.push({ id, ...plant });
            }
        }
        return crops;
    },

    hasAnimalFeed(plantId, animalType) {
        const plant = this.getPlant(plantId);
        return plant && plant.animalFeed && plant.animalFeed.includes(animalType);
    },

    hasAnimalBait(plantId, wildAnimalType) {
        const plant = this.getPlant(plantId);
        return plant && plant.animalBait && plant.animalBait.includes(wildAnimalType);
    },

    getCaptureBonus(plantId) {
        const plant = this.getPlant(plantId);
        return plant && plant.captureBonus ? plant.captureBonus : 0;
    },

    getBaitChanceBonus(plantId) {
        const plant = this.getPlant(plantId);
        return plant && plant.baitChanceBonus ? plant.baitChanceBonus : 0;
    },

    getFeedableCrops() {
        const crops = [];
        for (const [id, plant] of Object.entries(this._data)) {
            if (plant.animalFeed && plant.animalFeed.length > 0) {
                crops.push({ id, ...plant });
            }
        }
        return crops;
    },

    getBaitableCrops() {
        const crops = [];
        for (const [id, plant] of Object.entries(this._data)) {
            if (plant.animalBait && plant.animalBait.length > 0) {
                crops.push({ id, ...plant });
            }
        }
        return crops;
    }
};

window.PlantConfig = PlantConfig;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlantConfig;
}
