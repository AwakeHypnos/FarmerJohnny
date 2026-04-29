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
            isTaboo: false,
            tier: 'normal',
            canMutate: true,
            mutationTarget: 'many_eyed_rabbit'
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
            isTaboo: false,
            tier: 'normal',
            canMutate: true,
            mutationTarget: 'shadow_fox'
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
            isTaboo: false,
            tier: 'normal',
            canMutate: true,
            mutationTarget: 'many_eyed_chicken'
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
            isTaboo: false,
            tier: 'normal',
            canMutate: true,
            mutationTarget: 'soft_skin_goat'
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
            isTaboo: false,
            tier: 'normal',
            canMutate: true,
            mutationTarget: 'pale_mutant_deer'
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
            isTaboo: true,
            tier: 'aberrant',
            requiresCalming: true,
            calmingIntervalDays: 10
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
            isTaboo: false,
            tier: 'aberrant',
            canMutate: true,
            mutationTarget: 'whispering_toad'
        },
        many_eyed_chicken: {
            id: 'many_eyed_chicken',
            name: '多眼家禽',
            description: '被污染异化的家禽，全身布满怪异的眼睛，产触须鸡蛋',
            baseValue: 200,
            produceType: 'tentacle_egg',
            produceInterval: 36,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.15,
            sanityEffect: -5,
            isTaboo: false,
            tier: 'aberrant',
            isMutated: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        },
        many_eyed_rabbit: {
            id: 'many_eyed_rabbit',
            name: '多眼兔',
            description: '异化的兔子，毛发中隐藏着细小的眼睛，产粘液羊毛',
            baseValue: 150,
            produceType: 'slime_wool',
            produceInterval: 60,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.2,
            sanityEffect: -4,
            isTaboo: false,
            tier: 'aberrant',
            isMutated: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        },
        soft_skin_goat: {
            id: 'soft_skin_goat',
            name: '软皮山羊',
            description: '皮肤异常柔软似乎没有骨骼，产渗血奶源',
            baseValue: 300,
            produceType: 'seeping_milk',
            produceInterval: 48,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.1,
            sanityEffect: -8,
            isTaboo: false,
            tier: 'aberrant',
            isMutated: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        },
        shadow_fox: {
            id: 'shadow_fox',
            name: '暗影狐',
            description: '似乎与阴影融为一体的异化狐狸',
            baseValue: 250,
            produceType: 'shadow_fur',
            produceInterval: 84,
            produceAmount: [1, 1],
            canBreed: true,
            breedChance: 0.1,
            sanityEffect: -6,
            isTaboo: false,
            tier: 'aberrant',
            isMutated: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        },
        pale_mutant_deer: {
            id: 'pale_mutant_deer',
            name: '苍白异化鹿',
            description: '更加苍白神秘，鹿角似乎在缓慢生长',
            baseValue: 400,
            produceType: 'mutant_antler',
            produceInterval: 144,
            produceAmount: [1, 1],
            canBreed: true,
            breedChance: 0.08,
            sanityEffect: -10,
            isTaboo: false,
            tier: 'aberrant',
            isMutated: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        },
        whispering_toad: {
            id: 'whispering_toad',
            name: '低语蟾蜍',
            description: '似乎在低声咕哝着不可名状的语言',
            baseValue: 180,
            produceType: 'whispering_slime',
            produceInterval: 60,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.15,
            sanityEffect: -7,
            isTaboo: false,
            tier: 'aberrant',
            isMutated: true,
            requiresCalming: true,
            calmingIntervalDays: 10
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
            requiredSanityLevel: 'madness',
            tier: 'old_one',
            isPhantasmal: true,
            dailySanityLoss: 3,
            escapeChance: 0.05,
            escapeIntervalDays: 10
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
            requiredSanityLevel: 'fallen',
            tier: 'old_one',
            isPhantasmal: true,
            dailySanityLoss: 8,
            escapeChance: 0.1,
            escapeIntervalDays: 10
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
            requiredSanityLevel: 'fallen',
            tier: 'old_one',
            isPhantasmal: true,
            dailySanityLoss: 5,
            escapeChance: 0.08,
            escapeIntervalDays: 10
        }
    },

    _smallEldritchCreatures: {
        night_moth: {
            id: 'night_moth',
            name: '夜巡飞虫',
            description: '夜晚出没的诡异飞虫，以腐败作物为食，产出基础污染材料',
            baseValue: 80,
            produceType: 'night_dust',
            produceInterval: 24,
            produceAmount: [2, 4],
            canBreed: true,
            breedChance: 0.4,
            sanityEffect: -1,
            isTaboo: false,
            tier: 'small_eldritch',
            requiresCorruptedFeed: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        },
        shadow_rat: {
            id: 'shadow_rat',
            name: '暗影鼠',
            description: '栖息在阴影中的神秘鼠类，似乎与黑暗融为一体',
            baseValue: 100,
            produceType: 'shadow_fur_piece',
            produceInterval: 36,
            produceAmount: [1, 3],
            canBreed: true,
            breedChance: 0.35,
            sanityEffect: -2,
            isTaboo: false,
            tier: 'small_eldritch',
            requiresCorruptedFeed: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        },
        whispering_crustacean: {
            id: 'whispering_crustacean',
            name: '低语寄居生物',
            description: '类似寄居蟹的生物，壳中似乎传来低语声',
            baseValue: 120,
            produceType: 'whispering_chitin',
            produceInterval: 48,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.25,
            sanityEffect: -3,
            isTaboo: false,
            tier: 'small_eldritch',
            requiresCorruptedFeed: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        }
    },

    _mediumServitors: {
        shallow_tentacle_larva: {
            id: 'shallow_tentacle_larva',
            name: '浅海触须幼体',
            description: '来自浅海的神秘触须生物，需要阴暗畜棚和禁忌饲料',
            baseValue: 300,
            produceType: 'tentacle_segment',
            produceInterval: 72,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.15,
            sanityEffect: -5,
            isTaboo: true,
            requiredSanityLevel: 'madness',
            tier: 'medium_servitor',
            requiresDarkBarn: true,
            requiresForbiddenFeed: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        },
        underground_giant_slug: {
            id: 'underground_giant_slug',
            name: '地底蛞蝓巨兽',
            description: '来自地底深处的巨型蛞蝓，分泌珍贵的酸性粘液',
            baseValue: 400,
            produceType: 'acid_slime',
            produceInterval: 96,
            produceAmount: [1, 1],
            canBreed: true,
            breedChance: 0.1,
            sanityEffect: -7,
            isTaboo: true,
            requiredSanityLevel: 'madness',
            tier: 'medium_servitor',
            requiresDarkBarn: true,
            requiresForbiddenFeed: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        },
        mist_hound: {
            id: 'mist_hound',
            name: '迷雾猎犬',
            description: '由迷雾构成的神秘猎犬，忠诚但危险',
            baseValue: 350,
            produceType: 'mist_essence',
            produceInterval: 60,
            produceAmount: [1, 2],
            canBreed: true,
            breedChance: 0.12,
            sanityEffect: -6,
            isTaboo: true,
            requiredSanityLevel: 'madness',
            tier: 'medium_servitor',
            requiresDarkBarn: true,
            requiresForbiddenFeed: true,
            requiresCalming: true,
            calmingIntervalDays: 10
        }
    },

    _animalProducts: {
        rabbit_fur: { 
            id: 'rabbit_fur', 
            name: '兔毛', 
            sellPrice: 15, 
            description: '柔软的兔毛',
            uses: ['sell', 'craft']
        },
        fox_fur: { 
            id: 'fox_fur', 
            name: '狐皮', 
            sellPrice: 40, 
            description: '珍贵的狐狸皮毛',
            uses: ['sell', 'craft']
        },
        egg: { 
            id: 'egg', 
            name: '鸡蛋', 
            sellPrice: 8, 
            description: '新鲜的鸡蛋',
            uses: ['sell', 'food', 'feed']
        },
        goat_milk: { 
            id: 'goat_milk', 
            name: '山羊奶', 
            sellPrice: 12, 
            description: '营养丰富的山羊奶',
            uses: ['sell', 'food']
        },
        deer_antler: { 
            id: 'deer_antler', 
            name: '鹿角', 
            sellPrice: 80, 
            description: '神秘的鹿角',
            uses: ['sell', 'alchemy', 'offering']
        },
        owl_feather: { 
            id: 'owl_feather', 
            name: '猫头鹰羽毛', 
            sellPrice: 50, 
            description: '诡异的猫头鹰羽毛',
            uses: ['sell', 'alchemy', 'ritual']
        },
        toad_slime: { 
            id: 'toad_slime', 
            name: '蟾蜍粘液', 
            sellPrice: 25, 
            description: '未知成分的粘液',
            uses: ['sell', 'alchemy']
        },
        deep_scales: { 
            id: 'deep_scales', 
            name: '深渊鳞片', 
            sellPrice: 150, 
            description: '深潜者的鳞片',
            uses: ['sell', 'alchemy', 'offering', 'build']
        },
        primordial_slime: { 
            id: 'primordial_slime', 
            name: '原生质', 
            sellPrice: 300, 
            description: '修格斯分泌的原生质',
            uses: ['sell', 'alchemy', 'offering', 'build', 'ritual']
        },
        alien_fungus: { 
            id: 'alien_fungus', 
            name: '外星真菌', 
            sellPrice: 200, 
            description: '米·戈的孢子体',
            uses: ['sell', 'alchemy', 'offering', 'ritual']
        },
        tentacle_egg: {
            id: 'tentacle_egg',
            name: '触须鸡蛋',
            sellPrice: 50,
            description: '多眼家禽产下的诡异蛋，表面有蠕动的细须',
            uses: ['sell', 'food_corrupted', 'alchemy', 'offering']
        },
        slime_wool: {
            id: 'slime_wool',
            name: '粘液羊毛',
            sellPrice: 45,
            description: '多眼兔产出的羊毛，覆盖着神秘的粘液',
            uses: ['sell', 'craft', 'alchemy']
        },
        seeping_milk: {
            id: 'seeping_milk',
            name: '渗血奶源',
            sellPrice: 60,
            description: '软皮山羊产出的奶，带着血色，营养价值诡异',
            uses: ['sell', 'food_corrupted', 'alchemy', 'offering']
        },
        shadow_fur: {
            id: 'shadow_fur',
            name: '暗影皮毛',
            sellPrice: 80,
            description: '暗影狐产出的皮毛，似乎能吸收周围的光线',
            uses: ['sell', 'craft', 'alchemy', 'ritual']
        },
        mutant_antler: {
            id: 'mutant_antler',
            name: '异化鹿角',
            sellPrice: 150,
            description: '苍白异化鹿产出的鹿角，散发着神秘的光芒',
            uses: ['sell', 'alchemy', 'offering', 'ritual']
        },
        whispering_slime: {
            id: 'whispering_slime',
            name: '低语粘液',
            sellPrice: 70,
            description: '低语蟾蜍产出的粘液，凑近似乎能听到低语声',
            uses: ['sell', 'alchemy', 'ritual']
        },
        night_dust: {
            id: 'night_dust',
            name: '夜巡粉尘',
            sellPrice: 30,
            description: '夜巡飞虫脱落的鳞粉，在夜晚会发出微弱光芒',
            uses: ['sell', 'alchemy', 'ritual']
        },
        shadow_fur_piece: {
            id: 'shadow_fur_piece',
            name: '暗影鼠毛',
            sellPrice: 35,
            description: '暗影鼠脱落的毛发，触摸时感觉不到实体',
            uses: ['sell', 'craft', 'alchemy']
        },
        whispering_chitin: {
            id: 'whispering_chitin',
            name: '低语甲壳',
            sellPrice: 45,
            description: '低语寄居生物的壳，敲击时发出诡异的共鸣',
            uses: ['sell', 'craft', 'alchemy', 'build']
        },
        tentacle_segment: {
            id: 'tentacle_segment',
            name: '触须节段',
            sellPrice: 120,
            description: '浅海触须幼体脱落的节段，依然会轻微蠕动',
            uses: ['sell', 'alchemy', 'offering', 'build']
        },
        acid_slime: {
            id: 'acid_slime',
            name: '酸性粘液',
            sellPrice: 160,
            description: '地底蛞蝓巨兽分泌的粘液，腐蚀性极强',
            uses: ['sell', 'alchemy', 'craft']
        },
        mist_essence: {
            id: 'mist_essence',
            name: '迷雾精华',
            sellPrice: 140,
            description: '迷雾猎犬散逸的迷雾凝结物，散发着清冷气息',
            uses: ['sell', 'alchemy', 'ritual', 'offering']
        }
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
        return this._domesticAnimals[animalId] || 
               this._tabooAnimals[animalId] || 
               this._smallEldritchCreatures[animalId] || 
               this._mediumServitors[animalId];
    },

    getSmallEldritchCreature(animalId) {
        return this._smallEldritchCreatures[animalId];
    },

    getMediumServitor(animalId) {
        return this._mediumServitors[animalId];
    },

    getAllSmallEldritchCreatures() {
        return Object.values(this._smallEldritchCreatures);
    },

    getAllMediumServitors() {
        return Object.values(this._mediumServitors);
    },

    isEldritchAnimal(animalId) {
        const animal = this.getDomesticAnimal(animalId);
        return animal && (animal.tier === 'small_eldritch' || animal.tier === 'medium_servitor' || animal.tier === 'old_one');
    },

    isMutatedAnimal(animalId) {
        const animal = this.getDomesticAnimal(animalId);
        return animal && animal.isMutated === true;
    },

    requiresCalming(animalId) {
        const animal = this.getDomesticAnimal(animalId);
        return animal && animal.requiresCalming === true;
    },

    isPhantasmal(animalId) {
        const animal = this.getDomesticAnimal(animalId);
        return animal && animal.isPhantasmal === true;
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
