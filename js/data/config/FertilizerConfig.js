const FertilizerConfig = {
    _data: {
        basic_fertilizer: {
            id: 'basic_fertilizer',
            name: '基础肥料',
            description: '加速植物生长10%',
            buyPrice: 10,
            growthBoost: 0.1,
            tier: 'normal'
        },
        premium_fertilizer: {
            id: 'premium_fertilizer',
            name: '高级肥料',
            description: '加速植物生长25%',
            buyPrice: 30,
            growthBoost: 0.25,
            tier: 'normal'
        },
        ancient_fertilizer: {
            id: 'ancient_fertilizer',
            name: '古老肥料',
            description: '加速植物生长50%，可用于催熟异化作物',
            buyPrice: 80,
            growthBoost: 0.5,
            tier: 'aberrant',
            isAncient: true
        },
        corruption_fertilizer: {
            id: 'corruption_fertilizer',
            name: '污染肥料',
            description: '不会加速生长，但会逐渐腐化土地，适合种植异化作物',
            buyPrice: 50,
            growthBoost: 0,
            tier: 'aberrant',
            isCorruption: true,
            corruptionValue: 1
        },
        flesh_fertilizer: {
            id: 'flesh_fertilizer',
            name: '血肉肥料',
            description: '用血肉浇灌土地，大幅加速腐化，适合种植血肉类作物',
            buyPrice: 100,
            growthBoost: 0.2,
            tier: 'aberrant',
            isCorruption: true,
            corruptionValue: 3
        },
        forbidden_fertilizer: {
            id: 'forbidden_fertilizer',
            name: '禁忌神肥',
            description: '古老仪式中使用的神秘肥料，可用于催熟禁忌神植',
            buyPrice: 200,
            growthBoost: 0.3,
            tier: 'old_one',
            isAncient: true,
            isForbidden: true
        }
    },

    getFertilizer(fertilizerId) {
        return this._data[fertilizerId];
    },

    getAllFertilizers() {
        const fertilizers = [];
        for (const [id, fertilizer] of Object.entries(this._data)) {
            fertilizers.push({ id, ...fertilizer });
        }
        return fertilizers;
    },

    getAllFertilizerIds() {
        return Object.keys(this._data);
    }
};

window.FertilizerConfig = FertilizerConfig;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FertilizerConfig;
}
