class LivestockModule {
    constructor(eventBus, gameState, timeModule, sanityModule, pollutionModule) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        this.timeModule = timeModule;
        this.sanityModule = sanityModule;
        this.pollutionModule = pollutionModule;

        this.wildAnimals = [];
        this.maxWildAnimals = 3;

        this.setupListeners();
    }

    init() {
        this.wildAnimals = [];
        this.maxWildAnimals = 3;
        this.gameState.state.livestock.animals = [];
        this.gameState.state.livestock.barnLevel = 1;
    }

    setupListeners() {
        this.eventBus.on('time:hourChanged', () => {
            this.trySpawnWildAnimal();
            this.updateAnimalTimers(60);
        });

        this.eventBus.on('time:newDay', () => {
            this.updateAnimalTimers(1440);
            this.tryAnimalBreeding();
        });

        this.eventBus.on('ui:captureWildAnimal', (data) => {
            this.captureAnimal(data.wildAnimalId, data.toolType);
        });

        this.eventBus.on('ui:feedAnimal', (data) => {
            this.feedAnimal(data.animalId);
        });

        this.eventBus.on('ui:sellAnimal', (data) => {
            this.sellAnimal(data.animalId);
        });

        this.eventBus.on('ui:upgradeBarn', () => {
            this.upgradeBarn();
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
        
        const spawnChance = 0.1 + (pollution / 200) * 0.1;
        
        if (Math.random() > spawnChance) return;
        if (this.wildAnimals.length >= this.maxWildAnimals) return;

        const wildAnimal = AnimalConfig.getRandomWildAnimal ? 
            AnimalConfig.getRandomWildAnimal(pollution) : 
            this._getRandomWildAnimalFallback(pollution);

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

    _getRandomWildAnimalFallback(pollution) {
        const AnimalConfig = window.AnimalConfig || {};
        const wildAnimals = AnimalConfig._wildAnimals || {};
        const animals = Object.values(wildAnimals);
        
        if (animals.length === 0) return null;
        
        const filtered = animals.filter(a => {
            if (pollution < 3 && a.rarity === 'rare') return false;
            return true;
        });
        
        return filtered[Math.floor(Math.random() * filtered.length)] || null;
    }

    captureAnimal(wildAnimalId, toolType) {
        const AnimalConfig = window.AnimalConfig || {};
        const wildAnimal = this.wildAnimals.find(a => a.id === wildAnimalId);
        
        if (!wildAnimal) {
            this.eventBus.emit('livestock:captureFailed', { reason: '该动物已不存在' });
            return { success: false, reason: '该动物已不存在' };
        }

        const tool = this.gameState.getAvailableCaptureTools().find(t => t.type === toolType);
        if (!tool || tool.count <= 0) {
            this.eventBus.emit('livestock:captureFailed', { reason: '没有足够的捕捉工具' });
            return { success: false, reason: '没有足够的捕捉工具' };
        }

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
        const finalChance = Math.min(0.95, baseChance + bonusChance);

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

    feedAnimal(animalId) {
        const animal = this.gameState.getAnimal(animalId);
        if (!animal) {
            return { success: false, reason: '动物不存在' };
        }

        animal.hungry = false;
        
        this.eventBus.emit('livestock:animalFed', { animalId });
        return { success: true };
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
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LivestockModule;
}
