const FertilizerConfig = {
    basic_fertilizer: {
        id: 'basic_fertilizer',
        name: '基础肥料',
        description: '加速植物生长10%',
        buyPrice: 10,
        growthBoost: 0.1
    },
    premium_fertilizer: {
        id: 'premium_fertilizer',
        name: '高级肥料',
        description: '加速植物生长25%',
        buyPrice: 30,
        growthBoost: 0.25
    },
    ancient_fertilizer: {
        id: 'ancient_fertilizer',
        name: '古老肥料',
        description: '加速植物生长50%',
        buyPrice: 80,
        growthBoost: 0.5
    },

    getFertilizer(fertilizerId) {
        return this[fertilizerId];
    },

    getAllFertilizers() {
        const fertilizers = [];
        for (const [id, fertilizer] of Object.entries(this)) {
            if (typeof fertilizer === 'object' && fertilizer.id) {
                fertilizers.push({ id, ...fertilizer });
            }
        }
        return fertilizers;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FertilizerConfig;
}
