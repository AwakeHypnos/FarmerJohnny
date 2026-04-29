class LivestockModule {
    constructor(eventBus, gameState, timeModule, sanityModule, pollutionModule) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        this.timeModule = timeModule;
        this.sanityModule = sanityModule;
        this.pollutionModule = pollutionModule;

        this.wildAnimals = [];
        this.maxWildAnimals = 3;
        this.activeBaits = [];
        this.maxBaits = 3;

        this.setupListeners();
    }

    init() {
        this.wildAnimals = [];
        this.maxWildAnimals = 3;
        this.activeBaits = [];
        this.maxBaits = 3;
    }

    getActiveBaits() {
        return [...this.activeBaits];
    }

    canPlaceBait() {
        return this.activeBaits.length < this.maxBaits;
    }

    placeBait(cropType) {
        const PlantConfig = window.PlantConfig || {};
        const cropData = PlantConfig.getPlant ? PlantConfig.getPlant(cropType) : PlantConfig[cropType];

        if (!cropData) {
            return { success: false, reason: '作物数据无效' };
        }

        if (!cropData.animalBait || cropData.animalBait.length === 0) {
            return { success: false, reason: '该作物不能用作诱饵' };
        }

        if (!this.gameState.hasCrop(cropType)) {
            return { success: false, reason: '没有该作物' };
        }

        if (!this.canPlaceBait()) {
            return { success: false, reason: '诱饵位已满' };
        }

        const hasCropInventory = this.gameState.getCropCount(cropType, false) > 0;
        const removed = this.gameState.removeCrop(cropType, 1, !hasCropInventory);

        if (!removed) {
            return { success: false, reason: '作物数量不足' };
        }

        const bait = {
            id: `bait_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            cropType: cropType,
            cropName: cropData.name,
            targetAnimals: [...cropData.animalBait],
            baitChanceBonus: cropData.baitChanceBonus || 0.1,
            captureBonus: cropData.captureBonus || 0,
            placedTime: this.timeModule.getDay() * 24 + this.timeModule.getHour(),
            duration: 24
        };

        this.activeBaits.push(bait);
        this.eventBus.emit('livestock:baitPlaced', bait);

        return { success: true, bait };
    }

    updateBaits() {
        const currentTime = this.timeModule.getDay() * 24 + this.timeModule.getHour();
        this.activeBaits = this.activeBaits.filter(bait => {
            const age = currentTime - bait.placedTime;
            if (age >= bait.duration) {
                this.eventBus.emit('livestock:baitExpired', bait);
                return false;
            }
            return true;
        });
    }

    getBaitBonusForAnimal(wildAnimalType) {
        let totalBonus = 0;
        let captureBonus = 0;

        this.activeBaits.forEach(bait => {
            if (bait.targetAnimals.includes(wildAnimalType)) {
                totalBonus += bait.baitChanceBonus;
                captureBonus += bait.captureBonus;
            }
        });

        return {
            spawnBonus: Math.min(totalBonus, 0.5),
            captureBonus: Math.min(captureBonus, 0.3)
        };
    }

    setupListeners() {
        this.eventBus.on('time:hourChanged', () => {
            this.updateBaits();
            this.trySpawnWildAnimal();
            this.updateWildAnimalDeparture();
            this.updateAnimalTimers(60);
            this.processPhantasmalHourlySanityLoss();
        });

        this.eventBus.on('time:newDay', () => {
            this.updateAnimalTimers(1440);
            this.tryAnimalBreeding();
            this.incrementAnimalDayCounter();
            this.checkAnimalMutation();
            this.checkAnimalCalming();
            this.checkPhantasmalEscape();
            this.processPollutionFromCorruptedBarn();
        });

        this.eventBus.on('ui:captureWildAnimal', (data) => {
            this.captureAnimal(data.wildAnimalId, data.toolType, data.baitCropType);
        });

        this.eventBus.on('ui:feedAnimal', (data) => {
            this.feedAnimal(data.animalId, data.cropType);
        });

        this.eventBus.on('ui:placeBait', (data) => {
            this.placeBait(data.cropType);
        });

        this.eventBus.on('ui:sellAnimal', (data) => {
            this.sellAnimal(data.animalId);
        });

        this.eventBus.on('ui:upgradeBarn', () => {
            this.upgradeBarn();
        });

        this.eventBus.on('ui:calmAnimal', (data) => {
            this.calmAnimal(data.animalId, data.calmType);
        });
    }

    updateWildAnimalDeparture() {
        const currentTime = this.timeModule.getDay() * 24 + this.timeModule.getHour();
        const maxStayHours = 12;

        const departingAnimals = [];
        this.wildAnimals = this.wildAnimals.filter(animal => {
            const stayTime = currentTime - animal.spawnTime;
            if (stayTime >= maxStayHours) {
                departingAnimals.push(animal);
                return false;
            }
            return true;
        });

        departingAnimals.forEach(animal => {
            this.eventBus.emit('livestock:wildAnimalDeparted', animal);
        });
    }

    getWildAnimals() {
        return [...this.wildAnimals];
    }

    getAnimals() {
        return this.gameState.getAnimals();
    }

    getAnimal(animalId) {
        return this.gameState.getAnimal(animalId);
    }

    getAnimalCount() {
        return this.gameState.getAnimalCount();
    }

    getBarnLevel() {
        return this.gameState.getBarnLevel();
    }

    getBarnCapacity() {
        return this.gameState.getBarnCapacity();
    }

    getUpgradeCost() {
        const AnimalConfig = window.AnimalConfig || {};
        const currentLevel = this.getBarnLevel();
        const nextLevel = currentLevel + 1;
        const upgradeData = AnimalConfig.getBarnUpgrade ? 
            AnimalConfig.getBarnUpgrade(nextLevel) : 
            (AnimalConfig._barnUpgrades ? AnimalConfig._barnUpgrades[nextLevel] : null);
        
        return upgradeData ? upgradeData.upgradeCost : null;
    }

    trySpawnWildAnimal() {
        const AnimalConfig = window.AnimalConfig || {};
        const pollution = this.gameState.getPollution();
        
        const baseSpawnChance = 0.1 + (pollution / 200) * 0.1;
        const baitChanceBonus = this._getTotalBaitSpawnBonus();
        const spawnChance = Math.min(0.5, baseSpawnChance + baitChanceBonus);
        
        if (Math.random() > spawnChance) return;
        if (this.wildAnimals.length >= this.maxWildAnimals) return;

        const wildAnimal = this._getWeightedRandomWildAnimal(pollution);

        if (!wildAnimal) return;

        const newWildAnimal = {
            id: `wild_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: wildAnimal.id,
            name: wildAnimal.name,
            description: wildAnimal.description,
            captureChance: wildAnimal.captureChance,
            rarity: wildAnimal.rarity,
            domesticated: wildAnimal.domesticated,
            spawnTime: this.timeModule.getDay() * 24 + this.timeModule.getHour()
        };

        this.wildAnimals.push(newWildAnimal);
        this.eventBus.emit('livestock:wildAnimalSpawned', newWildAnimal);
    }

    _getTotalBaitSpawnBonus() {
        let totalBonus = 0;
        const uniqueAnimals = new Set();
        
        this.activeBaits.forEach(bait => {
            bait.targetAnimals.forEach(animalType => {
                uniqueAnimals.add(animalType);
            });
            totalBonus += bait.baitChanceBonus * 0.5;
        });
        
        return Math.min(totalBonus, 0.2);
    }

    _getWeightedRandomWildAnimal(pollution) {
        const AnimalConfig = window.AnimalConfig || {};
        const wildAnimals = AnimalConfig._wildAnimals || {};
        const animals = Object.values(wildAnimals);
        
        if (animals.length === 0) return null;
        
        const filtered = animals.filter(a => {
            if (pollution < 3 && a.rarity === 'rare') return false;
            return true;
        });

        const weightedAnimals = [];
        filtered.forEach(animal => {
            let weight = 1;
            
            this.activeBaits.forEach(bait => {
                if (bait.targetAnimals.includes(animal.id)) {
                    weight += bait.baitChanceBonus * 3;
                }
            });
            
            weightedAnimals.push({ animal, weight });
        });

        const totalWeight = weightedAnimals.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of weightedAnimals) {
            random -= item.weight;
            if (random <= 0) {
                return item.animal;
            }
        }

        return filtered[Math.floor(Math.random() * filtered.length)] || null;
    }

    captureAnimal(wildAnimalId, toolType, baitCropType = null) {
        const AnimalConfig = window.AnimalConfig || {};
        const PlantConfig = window.PlantConfig || {};
        const wildAnimal = this.wildAnimals.find(a => a.id === wildAnimalId);
        
        if (!wildAnimal) {
            this.eventBus.emit('livestock:captureFailed', { reason: '该动物已不存在' });
            return { success: false, reason: '该动物已不存在' };
        }

        if (this.sanityModule) {
            this.sanityModule.applyNightActionSanityLoss('捕捉');
        }

        const tool = this.gameState.getAvailableCaptureTools().find(t => t.type === toolType);
        if (!tool || tool.count <= 0) {
            this.eventBus.emit('livestock:captureFailed', { reason: '没有足够的捕捉工具' });
            return { success: false, reason: '没有足够的捕捉工具' };
        }

        let baitBonus = 0;
        if (baitCropType) {
            const cropData = PlantConfig.getPlant ? PlantConfig.getPlant(baitCropType) : PlantConfig[baitCropType];
            if (cropData && cropData.captureBonus) {
                if (this.gameState.hasCrop(baitCropType)) {
                    const hasCropInventory = this.gameState.getCropCount(baitCropType, false) > 0;
                    const removed = this.gameState.removeCrop(baitCropType, 1, !hasCropInventory);
                    if (removed) {
                        baitBonus = cropData.captureBonus;
                    }
                }
            }
        }

        const activeBaitBonus = this.getBaitBonusForAnimal(wildAnimal.type).captureBonus;

        const toolConfig = AnimalConfig.getCaptureTool ? 
            AnimalConfig.getCaptureTool(toolType) : 
            (AnimalConfig._captureTools ? AnimalConfig._captureTools[toolType] : null);

        if (!toolConfig) {
            return { success: false, reason: '工具配置无效' };
        }

        if (wildAnimal.rarity === 'rare' && !toolConfig.canCaptureRare) {
            this.eventBus.emit('livestock:captureFailed', { reason: '需要高级工具才能捕捉稀有动物' });
            return { success: false, reason: '需要高级工具才能捕捉稀有动物' };
        }

        this.gameState.removeCaptureTool(toolType);

        const baseChance = wildAnimal.captureChance;
        const bonusChance = toolConfig.captureBonus || 0;
        const finalChance = Math.min(0.95, baseChance + bonusChance + baitBonus + activeBaitBonus);

        if (Math.random() <= finalChance) {
            const result = this.gameState.addAnimal(wildAnimal.type, wildAnimal.domesticated);
            
            if (result.success) {
                const index = this.wildAnimals.findIndex(a => a.id === wildAnimalId);
                if (index > -1) {
                    this.wildAnimals.splice(index, 1);
                }

                const domesticAnimal = AnimalConfig.getDomesticAnimal ? 
                    AnimalConfig.getDomesticAnimal(wildAnimal.domesticated) : null;

                if (domesticAnimal && domesticAnimal.sanityEffect) {
                    if (domesticAnimal.sanityEffect > 0) {
                        this.sanityModule.modifySanity(domesticAnimal.sanityEffect, '捕捉动物');
                    } else if (domesticAnimal.sanityEffect < 0) {
                        this.sanityModule.modifySanity(domesticAnimal.sanityEffect, '捕捉禁忌生物');
                    }
                }

                this.eventBus.emit('livestock:captureSuccess', {
                    animal: result.animal,
                    wildAnimal: wildAnimal
                });

                return { success: true, animal: result.animal };
            } else {
                this.gameState.addCaptureTool(toolType);
                this.eventBus.emit('livestock:captureFailed', { reason: result.reason });
                return { success: false, reason: result.reason };
            }
        } else {
            this.eventBus.emit('livestock:captureFailed', { reason: '捕捉失败，动物逃跑了' });
            return { success: false, reason: '捕捉失败，动物逃跑了' };
        }
    }

    updateAnimalTimers(minutes) {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();

        animals.forEach(animal => {
            animal.age += minutes / 60;
            animal.produceTimer += minutes;

            const animalData = AnimalConfig.getDomesticAnimal ? 
                AnimalConfig.getDomesticAnimal(animal.type) : 
                (AnimalConfig._domesticAnimals ? AnimalConfig._domesticAnimals[animal.type] : null) ||
                (AnimalConfig._tabooAnimals ? AnimalConfig._tabooAnimals[animal.type] : null);

            if (!animalData) return;

            const produceIntervalMinutes = animalData.produceInterval * 60;
            
            if (animal.produceTimer >= produceIntervalMinutes) {
                animal.produceTimer = 0;
                
                if (animalData.produceType) {
                    const minAmount = animalData.produceAmount[0] || 1;
                    const maxAmount = animalData.produceAmount[1] || 1;
                    const amount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
                    
                    for (let i = 0; i < amount; i++) {
                        const result = this.gameState.addAnimalProduct(animalData.produceType);
                        if (!result.success) {
                            this.gameState.addWarehouseAnimalProduct(animalData.produceType);
                        }
                    }

                    const product = AnimalConfig.getAnimalProduct ? 
                        AnimalConfig.getAnimalProduct(animalData.produceType) : null;

                    this.eventBus.emit('livestock:animalProduced', {
                        animal: animal,
                        product: animalData.produceType,
                        productName: product ? product.name : animalData.produceType,
                        amount: amount
                    });
                }
            }

            if (animalData.isTaboo) {
                this.pollutionModule.modifyPollution(0.1, '照料禁忌生物');
            }
        });
    }

    tryAnimalBreeding() {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();
        
        const typeGroups = {};
        animals.forEach(animal => {
            if (!typeGroups[animal.type]) {
                typeGroups[animal.type] = [];
            }
            typeGroups[animal.type].push(animal);
        });

        for (const [type, groupAnimals] of Object.entries(typeGroups)) {
            if (groupAnimals.length < 2) continue;

            const animalData = AnimalConfig.getDomesticAnimal ? 
                AnimalConfig.getDomesticAnimal(type) : 
                (AnimalConfig._domesticAnimals ? AnimalConfig._domesticAnimals[type] : null) ||
                (AnimalConfig._tabooAnimals ? AnimalConfig._tabooAnimals[type] : null);

            if (!animalData || !animalData.canBreed) continue;

            if (Math.random() <= animalData.breedChance) {
                const result = this.gameState.addAnimal(type, type);
                if (result.success) {
                    this.eventBus.emit('livestock:animalBorn', {
                        parentType: type,
                        newAnimal: result.animal
                    });
                }
            }
        }
    }

    feedAnimal(animalId, cropType = null) {
        const PlantConfig = window.PlantConfig || {};
        const AnimalConfig = window.AnimalConfig || {};
        const animal = this.gameState.getAnimal(animalId);

        if (!animal) {
            return { success: false, reason: '动物不存在' };
        }

        const animalData = AnimalConfig.getDomesticAnimal ? 
            AnimalConfig.getDomesticAnimal(animal.type) : null;

        if (animalData && animalData.requiresCorruptedFeed && !cropType) {
            return { success: false, reason: '该生物需要腐败作物才能喂养' };
        }

        let fedSuccessfully = false;
        let bonusEffect = false;
        let isCorruptedCrop = false;

        if (cropType) {
            const cropData = PlantConfig.getPlant ? PlantConfig.getPlant(cropType) : PlantConfig[cropType];
            
            if (cropData && (cropData.tier === 'aberrant' || cropData.tier === 'old_one' || cropData.isTaboo)) {
                isCorruptedCrop = true;
            }

            if (animalData && animalData.requiresForbiddenFeed) {
                if (!isCorruptedCrop) {
                    return { success: false, reason: '该眷属需要禁忌饲料才能喂养' };
                }
            }

            const canFeed = PlantConfig.hasAnimalFeed ? 
                PlantConfig.hasAnimalFeed(cropType, animal.type) : 
                this._checkAnimalFeedCompatibility(cropType, animal.type);

            if (canFeed || (animalData && (animalData.requiresCorruptedFeed || animalData.requiresForbiddenFeed))) {
                if (this.gameState.hasCrop(cropType)) {
                    const hasCropInventory = this.gameState.getCropCount(cropType, false) > 0;
                    const removed = this.gameState.removeCrop(cropType, 1, !hasCropInventory);
                    if (removed) {
                        animal.hungry = false;
                        animal.happiness = Math.min((animal.happiness || 50) + 15, 100);
                        fedSuccessfully = true;
                        bonusEffect = true;

                        if (isCorruptedCrop) {
                            if (!animalData || !animalData.isMutated) {
                                animal.corruptionFeedCount = (animal.corruptionFeedCount || 0) + 1;
                                this.eventBus.emit('livestock:info', {
                                    message: `生物食用了腐败作物，正在缓慢发生变化...（已食用${animal.corruptionFeedCount}次）`
                                });
                            }
                        }
                    }
                }
            }
        }

        if (!fedSuccessfully && !animalData) {
            animal.hungry = false;
            fedSuccessfully = true;
        } else if (!fedSuccessfully && animalData && !animalData.requiresCorruptedFeed && !animalData.requiresForbiddenFeed) {
            animal.hungry = false;
            fedSuccessfully = true;
        }

        if (fedSuccessfully && this.sanityModule) {
            this.sanityModule.applyNightActionSanityLoss('喂食');
        }

        this.eventBus.emit('livestock:animalFed', { 
            animalId, 
            cropType, 
            bonusEffect,
            isCorruptedCrop
        });

        return { success: true, bonusEffect };
    }

    _checkAnimalFeedCompatibility(cropType, animalType) {
        const PlantConfig = window.PlantConfig || {};
        const cropData = PlantConfig.getPlant ? PlantConfig.getPlant(cropType) : PlantConfig[cropType];

        if (!cropData || !cropData.animalFeed) {
            return false;
        }

        return cropData.animalFeed.includes(animalType);
    }

    sellAnimal(animalId) {
        const AnimalConfig = window.AnimalConfig || {};
        const animal = this.gameState.getAnimal(animalId);
        
        if (!animal) {
            return { success: false, reason: '动物不存在' };
        }

        const animalData = AnimalConfig.getDomesticAnimal ? 
            AnimalConfig.getDomesticAnimal(animal.type) : 
            (AnimalConfig._domesticAnimals ? AnimalConfig._domesticAnimals[animal.type] : null) ||
            (AnimalConfig._tabooAnimals ? AnimalConfig._tabooAnimals[animal.type] : null);

        if (!animalData) {
            return { success: false, reason: '动物数据无效' };
        }

        const value = AnimalConfig.getAnimalValue ? 
            AnimalConfig.getAnimalValue(animalData, animal.age) :
            Math.floor(animalData.baseValue * (1 + (animal.age / 168) * 0.5));

        this.gameState.addMoney(value);
        this.gameState.removeAnimal(animalId);

        this.eventBus.emit('livestock:animalSold', {
            animalId,
            animalType: animal.type,
            value: value
        });

        return { success: true, value };
    }

    upgradeBarn() {
        const AnimalConfig = window.AnimalConfig || {};
        const currentLevel = this.gameState.getBarnLevel();
        const nextLevel = currentLevel + 1;
        
        const upgradeData = AnimalConfig.getBarnUpgrade ? 
            AnimalConfig.getBarnUpgrade(nextLevel) : 
            (AnimalConfig._barnUpgrades ? AnimalConfig._barnUpgrades[nextLevel] : null);

        if (!upgradeData) {
            this.eventBus.emit('livestock:upgradeFailed', { reason: '畜栏已达到最高等级' });
            return { success: false, reason: '畜栏已达到最高等级' };
        }

        const result = this.gameState.upgradeBarn();
        
        if (result.success) {
            this.eventBus.emit('livestock:barnUpgraded', {
                oldLevel: currentLevel,
                newLevel: result.newLevel,
                capacity: upgradeData.capacity
            });
        } else {
            this.eventBus.emit('livestock:upgradeFailed', { reason: result.reason });
        }

        return result;
    }

    getTimeUntilProduct(animalIndex) {
        const animals = this.gameState.getAnimals();
        const animal = animals[animalIndex];
        
        if (!animal) return '未知';
        
        const AnimalConfig = window.AnimalConfig || {};
        const animalData = AnimalConfig.getDomesticAnimal ? 
            AnimalConfig.getDomesticAnimal(animal.type) : 
            (AnimalConfig._domesticAnimals ? AnimalConfig._domesticAnimals[animal.type] : null) ||
            (AnimalConfig._tabooAnimals ? AnimalConfig._tabooAnimals[animal.type] : null);
        
        if (!animalData) return '未知';
        
        const produceIntervalMinutes = animalData.produceInterval * 60;
        const remainingMinutes = Math.max(0, produceIntervalMinutes - animal.produceTimer);
        
        if (remainingMinutes <= 0) {
            return '已就绪';
        }
        
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = Math.floor(remainingMinutes % 60);
        
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        }
        return `${minutes}分钟`;
    }

    collectProduct(animalId) {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();
        const animal = animals.find(a => a.id === animalId);
        
        if (!animal) {
            return { success: false, reason: '动物不存在' };
        }
        
        const animalData = AnimalConfig.getDomesticAnimal ? 
            AnimalConfig.getDomesticAnimal(animal.type) : 
            (AnimalConfig._domesticAnimals ? AnimalConfig._domesticAnimals[animal.type] : null) ||
            (AnimalConfig._tabooAnimals ? AnimalConfig._tabooAnimals[animal.type] : null);
        
        if (!animalData) {
            return { success: false, reason: '动物数据无效' };
        }
        
        const produceIntervalMinutes = animalData.produceInterval * 60;
        if (animal.produceTimer < produceIntervalMinutes) {
            return { success: false, reason: '产品还未就绪' };
        }
        
        animal.produceTimer = 0;
        
        if (animalData.produceType) {
            const minAmount = animalData.produceAmount[0] || 1;
            const maxAmount = animalData.produceAmount[1] || 1;
            const amount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
            
            for (let i = 0; i < amount; i++) {
                const result = this.gameState.addAnimalProduct(animalData.produceType);
                if (!result.success) {
                    this.gameState.addWarehouseAnimalProduct(animalData.produceType);
                }
            }
            
            const product = AnimalConfig.getAnimalProduct ? 
                AnimalConfig.getAnimalProduct(animalData.produceType) : null;
            
            const productName = product ? product.name : animalData.produceType;
            
            this.eventBus.emit('livestock:animalProduced', {
                animal: animal,
                product: animalData.produceType,
                productName: productName,
                amount: amount
            });
            
            return { 
                success: true, 
                product: animalData.produceType, 
                productName: productName, 
                amount: amount 
            };
        }
        
        return { success: false, reason: '该动物不产出产品' };
    }

    getBarnInfo() {
        const AnimalConfig = window.AnimalConfig || {};
        const level = this.gameState.getBarnLevel();
        const upgradeData = AnimalConfig.getBarnUpgrade ? 
            AnimalConfig.getBarnUpgrade(level) : 
            (AnimalConfig._barnUpgrades ? AnimalConfig._barnUpgrades[level] : null);
        
        const nextUpgradeData = AnimalConfig.getBarnUpgrade ? 
            AnimalConfig.getBarnUpgrade(level + 1) : 
            (AnimalConfig._barnUpgrades ? AnimalConfig._barnUpgrades[level + 1] : null);

        return {
            level: level,
            name: upgradeData ? upgradeData.name : '未知',
            capacity: upgradeData ? upgradeData.capacity : 1,
            currentAnimals: this.gameState.getAnimalCount(),
            nextUpgrade: nextUpgradeData ? {
                level: level + 1,
                capacity: nextUpgradeData.capacity,
                cost: nextUpgradeData.upgradeCost
            } : null
        };
    }

    getFullState() {
        return {
            wildAnimals: JSON.parse(JSON.stringify(this.wildAnimals)),
            maxWildAnimals: this.maxWildAnimals
        };
    }

    loadState(savedData) {
        if (savedData.wildAnimals) {
            this.wildAnimals = JSON.parse(JSON.stringify(savedData.wildAnimals));
        }
        if (savedData.maxWildAnimals !== undefined) {
            this.maxWildAnimals = savedData.maxWildAnimals;
        }
    }

    incrementAnimalDayCounter() {
        const animals = this.gameState.getAnimals();
        animals.forEach(animal => {
            animal.dayCounter = (animal.dayCounter || 0) + 1;
        });
    }

    checkAnimalMutation() {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();
        
        animals.forEach(animal => {
            if (animal.isMutated) return;

            const animalData = AnimalConfig.getDomesticAnimal ? 
                AnimalConfig.getDomesticAnimal(animal.type) : null;

            if (!animalData || !animalData.canMutate || !animalData.mutationTarget) return;

            const corruptionFeedCount = animal.corruptionFeedCount || 0;
            const mutationThreshold = 5;

            if (corruptionFeedCount >= mutationThreshold) {
                this.mutateAnimal(animal, animalData.mutationTarget);
            }
        });
    }

    mutateAnimal(animal, mutationTarget) {
        const AnimalConfig = window.AnimalConfig || {};
        const mutationData = AnimalConfig.getDomesticAnimal ? 
            AnimalConfig.getDomesticAnimal(mutationTarget) : null;

        if (!mutationData) return;

        const oldType = animal.type;
        const oldAnimalData = AnimalConfig.getDomesticAnimal ? 
            AnimalConfig.getDomesticAnimal(oldType) : null;

        animal.type = mutationTarget;
        animal.isMutated = true;
        animal.corruptionFeedCount = 0;

        this.eventBus.emit('livestock:animalMutated', {
            animalId: animal.id,
            oldType,
            oldTypeName: oldAnimalData ? oldAnimalData.name : oldType,
            newType: mutationTarget,
            newTypeName: mutationData.name
        });

        this.eventBus.emit('livestock:info', {
            message: `生物发生了诡异的变异！从${oldAnimalData ? oldAnimalData.name : oldType}变为了${mutationData.name}！`
        });

        if (this.sanityModule && mutationData.sanityEffect && mutationData.sanityEffect < 0) {
            this.sanityModule.modifySanity(
                Math.min(mutationData.sanityEffect, -5), 
                '目睹生物变异'
            );
        }
    }

    checkAnimalCalming() {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();
        const currentDay = this.timeModule.getDay();

        animals.forEach(animal => {
            const animalData = AnimalConfig.getDomesticAnimal ? 
                AnimalConfig.getDomesticAnimal(animal.type) : null;

            if (!animalData || !animalData.requiresCalming) return;

            const calmingIntervalDays = animalData.calmingIntervalDays || 10;
            const dayCounter = animal.dayCounter || 0;

            const lastCalmedAt = animal.lastCalmedAt;
            const needsCalming = lastCalmedAt === null || 
                (dayCounter - lastCalmedAt) >= calmingIntervalDays;

            if (needsCalming && dayCounter > 0 && dayCounter % calmingIntervalDays === 0) {
                this.eventBus.emit('livestock:needsCalming', {
                    animalId: animal.id,
                    animalType: animal.type,
                    animalName: animalData.name
                });
            }

            if (lastCalmedAt !== null && (dayCounter - lastCalmedAt) > calmingIntervalDays) {
                const daysSinceCalming = dayCounter - lastCalmedAt;
                const destructiveChance = Math.min(0.3 * (daysSinceCalming - calmingIntervalDays), 0.9);
                
                if (Math.random() < destructiveChance) {
                    this.triggerAnimalDestructiveBehavior(animal, animalData);
                }
            }
        });
    }

    calmAnimal(animalId, calmType = 'statue') {
        const AnimalConfig = window.AnimalConfig || {};
        const animal = this.gameState.getAnimal(animalId);

        if (!animal) {
            return { success: false, reason: '动物不存在' };
        }

        const animalData = AnimalConfig.getDomesticAnimal ? 
            AnimalConfig.getDomesticAnimal(animal.type) : null;

        if (!animalData || !animalData.requiresCalming) {
            return { success: false, reason: '该动物不需要安抚' };
        }

        animal.lastCalmedAt = animal.dayCounter || 0;

        const calmTypeNames = {
            statue: '古老雕像',
            rune: '低语符文',
            offering: '祭品投喂'
        };

        this.eventBus.emit('livestock:animalCalmed', {
            animalId,
            animalType: animal.type,
            animalName: animalData.name,
            calmType,
            calmTypeName: calmTypeNames[calmType] || calmType
        });

        this.eventBus.emit('livestock:info', {
            message: `使用${calmTypeNames[calmType] || calmType}安抚了${animalData.name}，它暂时平静下来了...`
        });

        if (this.sanityModule) {
            this.sanityModule.modifySanity(1, '成功安抚诡秘生物');
        }

        return { success: true };
    }

    triggerAnimalDestructiveBehavior(animal, animalData) {
        const FarmingModule = window.FarmingModule || null;
        
        this.eventBus.emit('livestock:animalDestructive', {
            animalId: animal.id,
            animalType: animal.type,
            animalName: animalData.name
        });

        const behaviorRoll = Math.random();

        if (behaviorRoll < 0.4) {
            const fields = FarmingModule ? FarmingModule.getAllFields() : [];
            const unlockedFields = fields.filter(f => f.unlocked && f.plant);
            
            if (unlockedFields.length > 0) {
                const randomField = unlockedFields[Math.floor(Math.random() * unlockedFields.length)];
                randomField.plant = null;
                randomField.stage = 0;
                randomField.growthProgress = 0;

                this.eventBus.emit('livestock:info', {
                    message: `${animalData.name}破坏了农田中的作物！`
                });

                if (this.sanityModule) {
                    this.sanityModule.modifySanity(-3, '目睹生物破坏农田');
                }
            }
        } else if (behaviorRoll < 0.7) {
            this.eventBus.emit('livestock:info', {
                message: `${animalData.name}在畜栏中疯狂躁动，损坏了一些物品...`
            });

            if (this.sanityModule) {
                this.sanityModule.modifySanity(-2, '生物躁动不安');
            }
        } else {
            this.eventBus.emit('livestock:info', {
                message: `${animalData.name}发出诡异的声音，令人心神不宁...`
            });

            if (this.sanityModule) {
                this.sanityModule.modifySanity(-5, '生物诡异低语');
            }
        }
    }

    processPhantasmalHourlySanityLoss() {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();

        animals.forEach(animal => {
            const animalData = AnimalConfig.getDomesticAnimal ? 
                AnimalConfig.getDomesticAnimal(animal.type) : null;

            if (!animalData || !animalData.isPhantasmal) return;

            if (animalData.dailySanityLoss && this.sanityModule) {
                const hourlyLoss = animalData.dailySanityLoss / 24;
                this.sanityModule.modifySanity(-hourlyLoss, '禁忌幻兽存在');
            }
        });
    }

    checkPhantasmalEscape() {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();

        animals.forEach(animal => {
            if (animal.hasEscaped) return;

            const animalData = AnimalConfig.getDomesticAnimal ? 
                AnimalConfig.getDomesticAnimal(animal.type) : null;

            if (!animalData || !animalData.isPhantasmal) return;

            const escapeIntervalDays = animalData.escapeIntervalDays || 10;
            const dayCounter = animal.dayCounter || 0;

            if (dayCounter > 0 && dayCounter % escapeIntervalDays === 0) {
                const escapeChance = animalData.escapeChance || 0.05;

                if (Math.random() < escapeChance) {
                    this.triggerPhantasmalEscape(animal, animalData);
                }
            }
        });
    }

    triggerPhantasmalEscape(animal, animalData) {
        animal.hasEscaped = true;

        this.eventBus.emit('livestock:phantasmalEscaped', {
            animalId: animal.id,
            animalType: animal.type,
            animalName: animalData.name
        });

        this.eventBus.emit('livestock:info', {
            message: `禁忌幻兽${animalData.name}打破了束缚，逃入了未知空间...它引发了灾难！`
        });

        if (this.sanityModule) {
            this.sanityModule.modifySanity(-20, '禁忌幻兽出逃灾难');
        }

        const FarmingModule = window.FarmingModule || null;
        if (FarmingModule) {
            const fields = FarmingModule.getAllFields();
            const unlockedFields = fields.filter(f => f.unlocked);
            
            unlockedFields.forEach(field => {
                if (Math.random() < 0.3) {
                    if (field.plant) {
                        field.plant = null;
                        field.stage = 0;
                        field.growthProgress = 0;
                    }
                }
            });

            this.eventBus.emit('livestock:info', {
                message: '幻兽出逃引发的能量波动破坏了部分农田...'
            });
        }

        this.gameState.removeAnimal(animal.id);

        this.eventBus.emit('livestock:animalRemoved', {
            animalId: animal.id,
            reason: 'escaped',
            animalName: animalData.name
        });
    }

    processPollutionFromCorruptedBarn() {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();

        let corruptedAnimalCount = 0;

        animals.forEach(animal => {
            const animalData = AnimalConfig.getDomesticAnimal ? 
                AnimalConfig.getDomesticAnimal(animal.type) : null;

            if (animalData && (animalData.isMutated || animalData.isPhantasmal || animalData.tier === 'small_eldritch' || animalData.tier === 'medium_servitor')) {
                corruptedAnimalCount++;
            }
        });

        if (corruptedAnimalCount > 0 && this.pollutionModule) {
            const pollutionIncrease = corruptedAnimalCount * 0.5;
            this.pollutionModule.modifyPollution(pollutionIncrease, '污染畜栏');
        }
    }

    getAllMutatedAnimals() {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();
        
        return animals.filter(animal => {
            const animalData = AnimalConfig.getDomesticAnimal ? 
                AnimalConfig.getDomesticAnimal(animal.type) : null;
            return animal.isMutated || (animalData && animalData.isMutated);
        });
    }

    getAllEldritchAnimals() {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();
        
        return animals.filter(animal => {
            const animalData = AnimalConfig.getDomesticAnimal ? 
                AnimalConfig.getDomesticAnimal(animal.type) : null;
            return animalData && (animalData.tier === 'small_eldritch' || animalData.tier === 'medium_servitor' || animalData.tier === 'old_one');
        });
    }

    getAnimalsNeedingCalming() {
        const AnimalConfig = window.AnimalConfig || {};
        const animals = this.gameState.getAnimals();
        const currentDay = this.timeModule.getDay();

        return animals.filter(animal => {
            const animalData = AnimalConfig.getDomesticAnimal ? 
                AnimalConfig.getDomesticAnimal(animal.type) : null;

            if (!animalData || !animalData.requiresCalming) return false;

            const calmingIntervalDays = animalData.calmingIntervalDays || 10;
            const lastCalmedAt = animal.lastCalmedAt;
            const dayCounter = animal.dayCounter || 0;

            return lastCalmedAt === null || (dayCounter - lastCalmedAt) >= calmingIntervalDays;
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LivestockModule;
}
