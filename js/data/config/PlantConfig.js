const PlantConfig = {
    _data: {
        cthulhu_seedling: {
            id: 'cthulhu_seedling',
            name: '克苏鲁幼苗',
            stages: ['种', '克苏鲁幼苗'],
            growthTime: { hours: 6, minutes: 0 },
            seasons: ['spring', 'summer'],
            sellPrice: 50,
            buyPrice: 20,
            description: '神秘的幼苗，据说与古老者有关'
        },
        deep_onion: {
            id: 'deep_onion',
            name: '深渊洋葱',
            stages: ['种', '深渊洋葱'],
            growthTime: { hours: 8, minutes: 0 },
            seasons: ['spring', 'autumn'],
            sellPrice: 40,
            buyPrice: 15,
            description: '来自深渊的洋葱，味道奇特'
        },
        nightshade_berry: {
            id: 'nightshade_berry',
            name: '夜影浆果',
            stages: ['种', '夜影浆果'],
            growthTime: { hours: 10, minutes: 0 },
            seasons: ['summer', 'autumn'],
            sellPrice: 70,
            buyPrice: 30,
            description: '只在夜间生长的神秘浆果'
        },
        frost_mushroom: {
            id: 'frost_mushroom',
            name: '寒霜蘑菇',
            stages: ['种', '寒霜蘑菇'],
            growthTime: { hours: 12, minutes: 0 },
            seasons: ['autumn', 'winter'],
            sellPrice: 80,
            buyPrice: 35,
            description: '在寒冷中生长的奇异蘑菇'
        },
        void_wheat: {
            id: 'void_wheat',
            name: '虚空小麦',
            stages: ['种', '虚空小麦'],
            growthTime: { hours: 14, minutes: 0 },
            seasons: ['spring', 'summer', 'autumn'],
            sellPrice: 60,
            buyPrice: 25,
            description: '来自虚空的小麦，颗粒饱满'
        },
        dark_pumpkin: {
            id: 'dark_pumpkin',
            name: '黑暗南瓜',
            stages: ['种', '黑暗南瓜'],
            growthTime: { hours: 16, minutes: 0 },
            seasons: ['autumn'],
            sellPrice: 100,
            buyPrice: 40,
            description: '万圣节特供，散发着神秘气息'
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
    }
};

window.PlantConfig = PlantConfig;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlantConfig;
}
