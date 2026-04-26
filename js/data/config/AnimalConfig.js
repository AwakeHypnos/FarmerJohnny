const AnimalConfig = {
    _wildAnimals: {
        gray_rabbit: {
            id: 'gray_rabbit',
            name: '灰兔',
            description: '常见的野生兔子，性格温顺',
            captureChance: 0.6,
            rarity: 'common',
            domesticated: 'domestic_rabbit'
        },
        dark_fox: {
            id: 'dark_fox',
            name: '暗狐',
            description: '皮毛呈深黑色的狐狸，似乎有些诡异',
            captureChance: 0.35,
            rarity: 'uncommon',
            domesticated: 'domestic_fox'
        },
        pale_chicken: {
            id: 'pale_chicken',
            name: '苍白鸡',
            description: '羽毛近乎白色的野鸡',
            captureChance: 0.5,
            rarity: 'common',
            domesticated: 'domestic_chicken'
        },
        shadow_goat: {
            id: 'shadow_goat',
            name: '暗影山羊',
            description: '在阴影中若隐若现的山羊',
            captureChance: 0.25,
            rarity: 'uncommon',
            domesticated: 'domestic_goat'
        },
        pale_deer: {
            id: 'pale_deer',
            name: '苍白鹿',
            description: '皮毛如雪的神秘鹿，据说与古老者有关',
            captureChance: 0.15,
            rarity: 'rare',
            domesticated: 'domestic_deer'
        },
        twisted_owl: {
            id: 'twisted_owl',
            name: '扭曲猫头鹰',
            description: '头部可旋转270度的诡异猫头鹰',
            captureChance: 0.1,
            rarity: 'rare',
            domesticated: 'domestic_owl'
        },
        slimy_toad: {
            id: 'slimy_toad',
            name: '黏滑蟾蜍',
            description: '表面覆盖着未知粘液的蟾蜍',
            captureChance: 0.4,
            rarity: 'common',
            domesticated: 'domestic_toad'
        }
    },

    _domesticAnimals: {
        domestic_rabbit: {
            id: 'domestic_rabbit',
            name: '家兔',
            description: '温顺的家兔，可以繁殖',
            baseValue: 30,
            produceType: 'rabbit_fur',
            produceInterval: 48,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.3,
            sanityEffect: 1,
            isTaboo: false
        },
        domestic_fox: {
            id: 'domestic_fox',
            name: '家狐',
            description: '驯化后的狐狸，依然带着诡异气息',
            baseValue: 80,
            produceType: 'fox_fur',
            produceInterval: 72,
            produceAmount: [1, 1],
            canBreed: true,
            breedChance: 0.2,
            sanityEffect: 0,
            isTaboo: false
        },
        domestic_chicken: {
            id: 'domestic_chicken',
            name: '家鸡',
            description: '普通的家鸡，每天产蛋',
            baseValue: 25,
            produceType: 'egg',
            produceInterval: 24,
            produceAmount: [1, 3],
            canBreed: true,
            breedChance: 0.4,
            sanityEffect: 2,
            isTaboo: false
        },
        domestic_goat: {
            id: 'domestic_goat',
            name: '家山羊',
            description: '可以产奶的山羊',
            baseValue: 60,
            produceType: 'goat_milk',
            produceInterval: 36,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.25,
            sanityEffect: 1,
            isTaboo: false
        },
        domestic_deer: {
            id: 'domestic_deer',
            name: '驯鹿',
            description: '苍白鹿被驯化后的形态，依然神秘',
            baseValue: 150,
            produceType: 'deer_antler',
            produceInterval: 120,
            produceAmount: [1, 1],
            canBreed: true,
            breedChance: 0.15,
            sanityEffect: 1,
            isTaboo: false
        },
        domestic_owl: {
            id: 'domestic_owl',
            name: '家猫头鹰',
            description: '扭曲猫头鹰被驯化后，依然保持着诡异',
            baseValue: 200,
            produceType: 'owl_feather',
            produceInterval: 96,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.1,
            sanityEffect: -3,
            isTaboo: true
        },
        domestic_toad: {
            id: 'domestic_toad',
            name: '家蟾蜍',
            description: '黏滑蟾蜍被驯化后，粘液可以收集',
            baseValue: 50,
            produceType: 'toad_slime',
            produceInterval: 48,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.3,
            sanityEffect: -1,
            isTaboo: false
        }
    },

    _tabooAnimals: {
        deep_one_spawn: {
            id: 'deep_one_spawn',
            name: '深潜者幼体',
            description: '来自深海的诡异生物，不可名状',
            baseValue: 500,
            produceType: 'deep_scales',
            produceInterval: 168,
            produceAmount: [1, 2],
            canBreed: false,
            breedChance: 0,
            sanityEffect: -10,
            isTaboo: true,
            requiredSanityLevel: 'madness'
        },
        shoggoth_piece: {
            id: 'shoggoth_piece',
            name: '修格斯碎片',
            description: '可以独立生存的修格斯组织块',
            baseValue: 800,
            produceType: 'primordial_slime',
            produceInterval: 240,
            produceAmount: [1, 1],
            canBreed: true,
            breedChance: 0.05,
            sanityEffect: -20,
            isTaboo: true,
            requiredSanityLevel: 'fallen'
        },
        mi_go_spore: {
            id: 'mi_go_spore',
            name: '米·戈孢子',
            description: '来自遥远星球的真菌生物',
            baseValue: 600,
            produceType: 'alien_fungus',
            produceInterval: 192,
            produceAmount: [1, 1],
            canBreed: false,
            breedChance: 0,
            sanityEffect: -15,
            isTaboo: true,
            requiredSanityLevel: 'fallen'
        }
    },

    _animalProducts: {
        rabbit_fur: { id: 'rabbit_fur', name: '兔毛', sellPrice: 15, description: '柔软的兔毛' },
        fox_fur: { id: 'fox_fur', name: '狐皮', sellPrice: 40, description: '珍贵的狐狸皮毛' },
        egg: { id: 'egg', name: '鸡蛋', sellPrice: 8, description: '新鲜的鸡蛋' },
        goat_milk: { id: 'goat_milk', name: '山羊奶', sellPrice: 12, description: '营养丰富的山羊奶' },
        deer_antler: { id: 'deer_antler', name: '鹿角', sellPrice: 80, description: '神秘的鹿角' },
        owl_feather: { id: 'owl_feather', name: '猫头鹰羽毛', sellPrice: 50, description: '诡异的猫头鹰羽毛' },
        toad_slime: { id: 'toad_slime', name: '蟾蜍粘液', sellPrice: 25, description: '未知成分的粘液' },
        deep_scales: { id: 'deep_scales', name: '深渊鳞片', sellPrice: 150, description: '深潜者的鳞片' },
        primordial_slime: { id: 'primordial_slime', name: '原生质', sellPrice: 300, description: '修格斯分泌的原生质' },
        alien_fungus: { id: 'alien_fungus', name: '外星真菌', sellPrice: 200, description: '米·戈的孢子体' }
    },

    _captureTools: {
        basic_trap: {
            id: 'basic_trap',
            name: '基础陷阱',
            description: '简单的陷阱，捕捉成功率较低',
            buyPrice: 20,
            captureBonus: 0,
            canCaptureRare: false
        },
        advanced_trap: {
            id: 'advanced_trap',
            name: '高级陷阱',
            description: '更有效的陷阱，有一定几率捕捉稀有动物',
            buyPrice: 80,
            captureBonus: 0.2,
            canCaptureRare: true
        },
        mystical_trap: {
            id: 'mystical_trap',
            name: '神秘陷阱',
            description: '以古老符文制作的陷阱，可捕获禁忌生物',
            buyPrice: 200,
            captureBonus: 0.3,
            canCaptureRare: true,
            canCaptureTaboo: true
        }
    },

    _barnUpgrades: {
        1: { capacity: 1, upgradeCost: 0, name: '简陋畜栏' },
        2: { capacity: 2, upgradeCost: 200, name: '小型畜栏' },
        3: { capacity: 4, upgradeCost: 500, name: '中型畜栏' },
        4: { capacity: 6, upgradeCost: 1000, name: '大型畜栏' },
        5: { capacity: 10, upgradeCost: 2000, name: '豪华畜栏' },
        6: { capacity: 15, upgradeCost: 5000, name: '深渊畜栏' }
    },

    getWildAnimal(animalId) {
        return this._wildAnimals[animalId];
    },

    getDomesticAnimal(animalId) {
        return this._domesticAnimals[animalId] || this._tabooAnimals[animalId];
    },

    getAnimalProduct(productId) {
        return this._animalProducts[productId];
    },

    getCaptureTool(toolId) {
        return this._captureTools[toolId];
    },

    getBarnUpgrade(level) {
        return this._barnUpgrades[level];
    },

    getMaxBarnLevel() {
        return Object.keys(this._barnUpgrades).length;
    },

    getRandomWildAnimal(pollutionLevel = 0) {
        const animals = Object.values(this._wildAnimals);
        const filtered = animals.filter(a => {
            if (pollutionLevel < 3) {
                return a.rarity !== 'rare';
            }
            return true;
        });
        const weights = filtered.map(a => {
            switch(a.rarity) {
                case 'common': return 50;
                case 'uncommon': return 30;
                case 'rare': return 20;
                default: return 10;
            }
        });
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        for (let i = 0; i < filtered.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return filtered[i];
            }
        }
        return filtered[0];
    },

    getRandomTabooAnimal() {
        const animals = Object.values(this._tabooAnimals);
        return animals[Math.floor(Math.random() * animals.length)];
    },

    getAllCaptureTools() {
        return Object.values(this._captureTools);
    },

    getAnimalValue(animalData, ageHours) {
        const ageMultiplier = Math.min(1 + (ageHours / 168) * 0.5, 2);
        return Math.floor(animalData.baseValue * ageMultiplier);
    }
};

window.AnimalConfig = AnimalConfig;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimalConfig;
}
