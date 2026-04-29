class FarmingModule {
    constructor(eventBus, gameState, timeModule, environmentModule, sanityModule, pollutionModule) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        this.timeModule = timeModule;
        this.environmentModule = environmentModule;
        this.sanityModule = sanityModule;
        this.pollutionModule = pollutionModule;

        this.totalFields = 52;
        this.unlockedFields = 1;
        this.fields = [];

        this.selectedSeed = null;

        this.FIELD_NORMAL = 'normal';
        this.FIELD_CORRUPTED = 'corrupted';
        this.FIELD_ALIENATED = 'alienated';
        this.FIELD_BLOOD = 'blood';
        this.FIELD_ASTRAL = 'astral';
        this.FIELD_WATER = 'water';

        this.CORRUPTION_FERTILIZER_THRESHOLD = 3;
        this.CORRUPTION_PLANT_THRESHOLD = 5;

        this.CATEGORY_STELLAR = 'stellar';
        this.CATEGORY_FLESH = 'flesh';
        this.CATEGORY_FORBIDDEN = 'forbidden';
        this.CATEGORY_DEEP = 'deep';

        this.TIER_NORMAL = 'normal';
        this.TIER_ABERRANT = 'aberrant';
        this.TIER_OLD_ONE = 'old_one';

        this.STAR_VISITOR_CHANCE = 0.33;
        this.NORMAL_CROP_CORRUPTION_CHANCE = 0.5;
        this.BLOOD_FIELD_GROWTH_BONUS = 0.5;
        this.BLOOD_FIELD_YIELD_BONUS = 0.3;
        this.BLOOD_FIELD_SANITY_LOSS_BONUS = 1.5;

        this.config = {
            baseUnlockPrice: 100,
            corruptionFertilizerCount: 3,
            corruptionAberrantPlantCount: 5
        };

        this.pond = {
            unlocked: false,
            unlockDay: 7,
            unlockCost: 1000,
            totalPonds: 8,
            unlockedPonds: 2,
            ponds: []
        };

        this.starVisitorState = null;

        this.setupListeners();
    }

    getUnlockPrice(fieldId) {
        const basePrice = 100;
        const priceIncrement = 50;
        return basePrice + fieldId * priceIncrement;
    }

    canUnlockField(fieldId) {
        const field = this.fields[fieldId];
        if (!field || field.unlocked) {
            return { canUnlock: false, reason: '田地已解锁或无效' };
        }

        const price = this.getUnlockPrice(fieldId);
        if (!this.gameState.hasEnoughMoney(price)) {
            return { canUnlock: false, reason: `资金不足，需要 ${price} 金币`, price };
        }

        return { canUnlock: true, price };
    }

    unlockField(fieldId) {
        const check = this.canUnlockField(fieldId);
        if (!check.canUnlock) {
            return { success: false, reason: check.reason };
        }

        const price = check.price;
        this.gameState.subtractMoney(price);

        const field = this.fields[fieldId];
        field.unlocked = true;
        this.unlockedFields++;

        this.eventBus.emit('farming:fieldUnlocked', {
            fieldId,
            price
        });
        this.eventBus.emit('farming:fieldsUpdated', this.fields);
        this.eventBus.emit('economy:moneyChanged', this.gameState.getMoney());

        return { success: true, price };
    }

    setupListeners() {
        this.eventBus.on('time:updated', (timeState) => {
        });

        this.eventBus.on('time:dawn', () => {
            this.resetDailyFieldStates();
        });

        this.eventBus.on('time:seasonChanged', (data) => {
            this.handleSeasonChange(data.newSeason);
        });
    }

    init() {
        this.fields = [];
        for (let i = 0; i < this.totalFields; i++) {
            this.fields.push({
                id: i,
                unlocked: i < this.unlockedFields,
                fieldType: this.FIELD_NORMAL,
                corruptionProgress: 0,
                waterCorruptionProgress: 0,
                plant: null,
                watered: false,
                fertilized: false,
                fertilizerType: null,
                fertilizerAppliedSeason: null,
                corruptionFertilizerCount: 0,
                corruptionFertilizerType: null,
                corruptionCountByType: {
                    corruption: 0,
                    flesh: 0
                },
                aberrantPlantCount: 0,
                growthProgress: 0,
                stage: 0,
                hasAwareness: false,
                awarenessType: null
            });
        }

        this.pond.unlocked = false;
        this.pond.ponds = [];
        for (let i = 0; i < this.pond.totalPonds; i++) {
            this.pond.ponds.push({
                id: i,
                unlocked: i < this.pond.unlockedPonds,
                fieldType: this.FIELD_WATER,
                plant: null,
                watered: true,
                fertilized: false,
                fertilizerType: null,
                growthProgress: 0,
                stage: 0,
                hasAwareness: false,
                awarenessType: null
            });
        }

        this.selectedSeed = null;
        this.eventBus.emit('farming:fieldsUpdated', this.fields);
        this.eventBus.emit('farming:pondUpdated', this.pond);
    }

    getFieldsState() {
        return JSON.parse(JSON.stringify(this.fields));
    }

    loadFieldsState(savedFields) {
        this.fields = JSON.parse(JSON.stringify(savedFields));
        this.eventBus.emit('farming:fieldsUpdated', this.fields);
    }

    getField(fieldId) {
        return this.fields[fieldId];
    }

    getAllFields() {
        return [...this.fields];
    }

    isFieldUnlocked(fieldId) {
        const field = this.fields[fieldId];
        return field && field.unlocked;
    }

    selectSeed(seedType) {
        this.selectedSeed = seedType;
        this.eventBus.emit('farming:seedSelected', seedType);
        return seedType;
    }

    getSelectedSeed() {
        return this.selectedSeed;
    }

    clearSelectedSeed() {
        this.selectedSeed = null;
        this.eventBus.emit('farming:seedCleared');
    }

    canPlant(fieldId, seedType) {
        const field = this.fields[fieldId];
        const PlantConfig = window.PlantConfig || {};

        if (!field || !field.unlocked) {
            return { canPlant: false, reason: '田地未解锁' };
        }

        if (field.plant) {
            return { canPlant: false, reason: '田地已有植物' };
        }

        if (!this.gameState.hasSeed(seedType)) {
            return { canPlant: false, reason: '背包中没有种子' };
        }

        const currentSeason = this.timeModule.getSeason();
        if (!this.environmentModule.isPlantInSeason(seedType)) {
            const plant = PlantConfig.getPlant ? PlantConfig.getPlant(seedType) : PlantConfig[seedType];
            return { 
                canPlant: false, 
                reason: `${plant ? plant.name : '该植物'}不能在${this.timeModule.getSeasonName()}季种植` 
            };
        }

        const plantData = PlantConfig.getPlant ? PlantConfig.getPlant(seedType) : PlantConfig[seedType];
        if (plantData) {
            const fieldTypeCheck = this.checkFieldTypeCompatibility(field.fieldType, plantData);
            if (!fieldTypeCheck.canPlant) {
                return fieldTypeCheck;
            }

            if (plantData.requiredFieldType && plantData.requiredFieldType !== field.fieldType) {
                const fieldTypeNames = {
                    normal: '普通土地',
                    corrupted: '腐化土地',
                    alienated: '异化土地',
                    blood: '血红土地',
                    astral: '星界土地',
                    water: '池塘'
                };
                return { 
                    canPlant: false, 
                    reason: `${plantData.name}需要${fieldTypeNames[plantData.requiredFieldType] || '特定类型的土地'}才能种植` 
                };
            }

            if (plantData.requiredSanityLevel && this.sanityModule) {
                const currentSanityLevel = this.sanityModule.getSanityLevel();
                if (currentSanityLevel.name !== plantData.requiredSanityLevel) {
                    return { 
                        canPlant: false, 
                        reason: `${plantData.name}需要理智等级为${plantData.requiredSanityLevel}才能种植，当前为${currentSanityLevel.name}` 
                    };
                }
            }

            const isNight = this.environmentModule.isNightTime();
            if (plantData.canGrowAtDay === false && !isNight) {
                return { 
                    canPlant: false, 
                    reason: `${plantData.name}只能在夜晚种植和生长` 
                };
            }
            if (plantData.canGrowAtNight === false && isNight) {
                return { 
                    canPlant: false, 
                    reason: `${plantData.name}只能在白天种植和生长` 
                };
            }
        }

        return { canPlant: true };
    }

    checkFieldTypeCompatibility(fieldType, plantData) {
        const isAberrantCrop = plantData.tier === this.TIER_ABERRANT || plantData.tier === this.TIER_OLD_ONE;
        const isCorruptedField = fieldType === this.FIELD_CORRUPTED || 
                                  fieldType === this.FIELD_ALIENATED ||
                                  fieldType === this.FIELD_BLOOD ||
                                  fieldType === this.FIELD_ASTRAL;

        if (isAberrantCrop) {
            if (isCorruptedField) {
                return { canPlant: true };
            } else if (fieldType === this.FIELD_NORMAL) {
                return { 
                    canPlant: false, 
                    reason: `${plantData.name}只能在腐化或异化地块上种植` 
                };
            }
        } else {
            if (fieldType === this.FIELD_ALIENATED || 
                fieldType === this.FIELD_BLOOD || 
                fieldType === this.FIELD_ASTRAL) {
                const fieldTypeNames = {
                    alienated: '异化地块',
                    blood: '血红地块',
                    astral: '星界地块'
                };
                return { 
                    canPlant: false, 
                    reason: `普通作物无法在${fieldTypeNames[fieldType]}上种植，只能种植诡异作物` 
                };
            }
        }

        return { canPlant: true };
    }

    plantSeed(fieldId, seedType) {
        const check = this.canPlant(fieldId, seedType);
        if (!check.canPlant) {
            this.eventBus.emit('farming:error', { message: check.reason });
            return { success: false, reason: check.reason };
        }

        const field = this.fields[fieldId];
        const PlantConfig = window.PlantConfig || {};
        let plantData = PlantConfig.getPlant ? PlantConfig.getPlant(seedType) : PlantConfig[seedType];
        let actualSeedType = seedType;
        let corruptionMessage = null;

        if (field.fieldType === this.FIELD_CORRUPTED && plantData && plantData.tier === this.TIER_NORMAL) {
            if (Math.random() < this.NORMAL_CROP_CORRUPTION_CHANCE) {
                const aberrantSeed = this.getRandomAberrantSeedForSeason();
                if (aberrantSeed) {
                    actualSeedType = aberrantSeed;
                    plantData = PlantConfig.getPlant ? PlantConfig.getPlant(aberrantSeed) : PlantConfig[aberrantSeed];
                    corruptionMessage = `${plantData ? plantData.name : seedType}受到腐化力量的影响，发生了诡异的变异！`;
                }
            }
        }

        this.gameState.removeSeed(seedType);
        field.plant = actualSeedType;
        field.stage = 0;
        field.growthProgress = 0;
        field.watered = false;
        field.fertilized = false;
        field.fertilizerType = null;

        this.clearSelectedSeed();

        this.eventBus.emit('farming:planted', {
            fieldId,
            seedType: actualSeedType,
            plantName: plantData ? plantData.name : actualSeedType
        });

        if (corruptionMessage) {
            this.eventBus.emit('farming:info', { message: corruptionMessage });
        }

        this.eventBus.emit('farming:fieldsUpdated', this.fields);

        return { success: true };
    }

    getRandomAberrantSeedForSeason() {
        const PlantConfig = window.PlantConfig || {};
        const currentSeason = this.timeModule.getSeason();
        const allPlants = PlantConfig.getAllPlants ? PlantConfig.getAllPlants() : 
                          (PlantConfig._data ? Object.values(PlantConfig._data) : []);
        
        const aberrantSeeds = allPlants.filter(p => 
            (p.tier === this.TIER_ABERRANT || p.tier === this.TIER_OLD_ONE) &&
            p.seasons && p.seasons.includes(currentSeason)
        );

        if (aberrantSeeds.length > 0) {
            const randomIndex = Math.floor(Math.random() * aberrantSeeds.length);
            return aberrantSeeds[randomIndex].id;
        }
        return null;
    }

    handleFieldClick(fieldId) {
        const field = this.fields[fieldId];

        if (!field.unlocked) {
            const check = this.canUnlockField(fieldId);
            this.eventBus.emit('farming:showUnlockOption', {
                fieldId,
                canUnlock: check.canUnlock,
                price: check.price || this.getUnlockPrice(fieldId),
                reason: check.reason
            });
            return;
        }

        if (!field.plant) {
            if (this.selectedSeed) {
                this.plantSeed(fieldId, this.selectedSeed);
            } else {
                this.eventBus.emit('farming:showFieldActions', {
                    fieldId,
                    field: this.getField(fieldId)
                });
            }
        } else {
            this.eventBus.emit('farming:showFieldActions', {
                fieldId,
                field: this.getField(fieldId)
            });
        }
    }

    waterField(fieldId) {
        const field = this.fields[fieldId];

        if (!field || !field.unlocked) {
            return { success: false, reason: '田地无效' };
        }

        if (field.watered) {
            return { success: false, reason: '已经浇过水了' };
        }

        field.watered = true;
        this.eventBus.emit('farming:watered', { fieldId });
        this.eventBus.emit('farming:fieldsUpdated', this.fields);

        return { success: true };
    }

    applyFertilizer(fieldId, fertilizerType) {
        const field = this.fields[fieldId];
        const FertilizerConfig = window.FertilizerConfig || {};

        if (!field || !field.unlocked) {
            return { success: false, reason: '田地无效' };
        }

        if (field.fertilized) {
            return { success: false, reason: '已经施过肥了' };
        }

        if (!this.gameState.hasFertilizer(fertilizerType)) {
            return { success: false, reason: '没有足够的肥料' };
        }

        const fertilizer = FertilizerConfig.getFertilizer ? 
            FertilizerConfig.getFertilizer(fertilizerType) : FertilizerConfig[fertilizerType];

        if (fertilizer && fertilizer.instantlyCorrupt) {
            if (field.fieldType === this.FIELD_ASTRAL) {
                return { success: false, reason: '田块已经是星界地块了' };
            }
            this.gameState.removeFertilizer(fertilizerType);
            field.fieldType = this.FIELD_ASTRAL;
            this.eventBus.emit('farming:fieldCorrupted', {
                fieldId,
                fieldType: this.FIELD_ASTRAL
            });
            this.eventBus.emit('farming:fieldsUpdated', this.fields);
            return { success: true };
        }

        this.gameState.removeFertilizer(fertilizerType);
        field.fertilized = true;
        field.fertilizerType = fertilizerType;
        field.fertilizerAppliedSeason = this.timeModule.getSeason();

        if (fertilizer && fertilizer.isCorruption && fertilizer.corruptionType) {
            if (!field.corruptionCountByType) {
                field.corruptionCountByType = { corruption: 0, flesh: 0 };
            }
            
            if (fertilizer.corruptionType === 'corruption' || fertilizer.corruptionType === 'flesh') {
                field.corruptionCountByType[fertilizer.corruptionType]++;
                field.corruptionFertilizerType = fertilizer.corruptionType;
                this.checkFieldCorruptionByType(fieldId, fertilizer.corruptionType);
            }
        }

        this.eventBus.emit('farming:fertilized', {
            fieldId,
            fertilizerType,
            fertilizerName: fertilizer ? fertilizer.name : fertilizerType
        });
        this.eventBus.emit('farming:fieldsUpdated', this.fields);

        return { success: true };
    }

    canHarvest(fieldId) {
        const field = this.fields[fieldId];
        if (!field || !field.plant) {
            return { canHarvest: false, reason: '没有植物' };
        }

        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? PlantConfig.getPlant(field.plant) : PlantConfig[field.plant];
        
        if (!plantData) {
            return { canHarvest: false, reason: '植物数据无效' };
        }

        const isReady = field.stage >= plantData.stages.length - 1;
        if (!isReady) {
            return { canHarvest: false, reason: '植物还未成熟' };
        }

        return { canHarvest: true };
    }

    harvestField(fieldId) {
        const check = this.canHarvest(fieldId);
        if (!check.canHarvest) {
            return { success: false, reason: check.reason };
        }

        const field = this.fields[fieldId];
        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? PlantConfig.getPlant(field.plant) : PlantConfig[field.plant];

        let harvestMessage = '';

        if (plantData) {
            let sanityLoss = plantData.sanityLossOnHarvest || 0;
            let yieldBonus = 1;

            if (field.fieldType === this.FIELD_BLOOD && plantData.category === this.CATEGORY_FLESH) {
                sanityLoss = Math.floor(sanityLoss * this.BLOOD_FIELD_SANITY_LOSS_BONUS);
                yieldBonus = 1 + this.BLOOD_FIELD_YIELD_BONUS;
                harvestMessage += '血红地块的力量增强了血肉作物的产出，但也带来了更大的理智侵蚀。';
            }

            if (sanityLoss > 0 && this.sanityModule) {
                const oldSanity = this.sanityModule.getSanity();
                this.sanityModule.subtractSanity(sanityLoss);
                const newSanity = this.sanityModule.getSanity();
                harvestMessage += `理智损失 ${oldSanity - newSanity} 点。`;
            }

            if (plantData.pollutionGainOnHarvest && this.pollutionModule) {
                this.pollutionModule.addPollution(plantData.pollutionGainOnHarvest);
            }

            if (plantData.harvestCurses && plantData.harvestCurses.length > 0) {
                const curseChance = 0.3;
                if (Math.random() < curseChance) {
                    const curseIndex = Math.floor(Math.random() * plantData.harvestCurses.length);
                    const curse = plantData.harvestCurses[curseIndex];
                    harvestMessage += `受到诅咒：${curse}！`;
                    this.eventBus.emit('farming:curseApplied', {
                        fieldId,
                        plantType: field.plant,
                        curse: curse
                    });
                }
            }

            if (plantData.hasAwareness && field.hasAwareness) {
                this.triggerAwarenessEvent(fieldId, field.awarenessType, plantData);
            }

            if (plantData.tier === 'aberrant') {
                field.aberrantPlantCount++;
                this.checkFieldCorruption(fieldId);
            }
        }

        let yieldMultiplier = 1;
        if (plantData && plantData.highYield) {
            yieldMultiplier = 2;
        }
        if (field.fieldType === this.FIELD_BLOOD && plantData && plantData.category === this.CATEGORY_FLESH) {
            yieldMultiplier += this.BLOOD_FIELD_YIELD_BONUS;
        }

        const result = this.gameState.addWarehouseCrop(field.plant);
        if (!result.success) {
            this.eventBus.emit('farming:error', { message: result.reason });
            return { success: false, reason: result.reason };
        }

        const harvestedPlant = field.plant;
        field.plant = null;
        field.stage = 0;
        field.growthProgress = 0;
        field.watered = false;
        field.fertilized = false;
        field.fertilizerType = null;
        field.hasAwareness = false;
        field.awarenessType = null;

        const harvestInfo = {
            fieldId,
            plantType: harvestedPlant,
            plantName: plantData ? plantData.name : harvestedPlant,
            yieldMultiplier
        };

        if (harvestMessage) {
            harvestInfo.message = harvestMessage;
        }

        this.eventBus.emit('farming:harvested', harvestInfo);
        this.eventBus.emit('farming:fieldsUpdated', this.fields);

        return { success: true };
    }

    updatePlantGrowth(gameMinutes) {
        const PlantConfig = window.PlantConfig || {};
        const FertilizerConfig = window.FertilizerConfig || {};
        let needsUpdate = false;

        const isNight = this.environmentModule.isNightTime();
        const isRaining = this.environmentModule.isRaining ? this.environmentModule.isRaining() : false;
        const isFoggy = this.environmentModule.isFoggy ? this.environmentModule.isFoggy() : false;

        this.fields.forEach(field => {
            if (field.plant) {
                const plantData = PlantConfig.getPlant ? 
                    PlantConfig.getPlant(field.plant) : PlantConfig[field.plant];
                
                if (!plantData) return;

                if (plantData.canGrowAtDay === false && !isNight) {
                    return;
                }
                if (plantData.canGrowAtNight === false && isNight) {
                    return;
                }

                if (plantData.requiresAncientFertilizer && field.fertilized && field.fertilizerType) {
                    const fertilizer = FertilizerConfig.getFertilizer ? 
                        FertilizerConfig.getFertilizer(field.fertilizerType) : 
                        FertilizerConfig[field.fertilizerType];
                    
                    if (fertilizer && fertilizer.id !== 'ancient_fertilizer') {
                        field.growthProgress += 0;
                        return;
                    }
                }

                let growthRate = field.watered ? 1 : 0.5;

                if (field.fertilized && field.fertilizerType) {
                    const fertilizer = FertilizerConfig.getFertilizer ? 
                        FertilizerConfig.getFertilizer(field.fertilizerType) : 
                        FertilizerConfig[field.fertilizerType];
                    
                    if (fertilizer) {
                        growthRate += fertilizer.growthBoost;
                    }
                }

                if (field.fieldType === this.FIELD_BLOOD && plantData.category === this.CATEGORY_FLESH) {
                    growthRate += this.BLOOD_FIELD_GROWTH_BONUS;
                }

                if (plantData.rainGrowthBoost && isRaining) {
                    growthRate *= plantData.rainGrowthBoost;
                }

                if (plantData.fogGrowthBoost && isFoggy) {
                    growthRate *= plantData.fogGrowthBoost;
                }

                const totalGrowthMinutes = plantData.growthTime.hours * 60 + plantData.growthTime.minutes;
                const growthPerMinute = 1 / totalGrowthMinutes;

                field.growthProgress += growthPerMinute * gameMinutes * growthRate;

                const totalStages = plantData.stages.length;
                const progressPerStage = 1 / (totalStages - 1);

                const newStage = Math.min(
                    Math.floor(field.growthProgress / progressPerStage),
                    totalStages - 1
                );

                if (newStage > field.stage) {
                    field.stage = newStage;
                    needsUpdate = true;

                    if (field.stage >= totalStages - 1) {
                        if (plantData.hasAwareness && !field.hasAwareness) {
                            if (Math.random() < plantData.awarenessChance) {
                                field.hasAwareness = true;
                                field.awarenessType = plantData.awarenessType;
                                this.eventBus.emit('farming:plantAwakened', {
                                    fieldId: field.id,
                                    plantType: field.plant,
                                    plantName: plantData.name,
                                    awarenessType: plantData.awarenessType
                                });
                            }
                        }

                        if (field.fieldType === this.FIELD_ASTRAL && plantData.category === this.CATEGORY_STELLAR) {
                            this.checkStarVisitorTrigger(field.id, plantData);
                        }

                        this.eventBus.emit('farming:plantReady', {
                            fieldId: field.id,
                            plantType: field.plant,
                            plantName: plantData.name
                        });
                    }
                }
            }
        });

        if (needsUpdate) {
            this.eventBus.emit('farming:fieldsUpdated', this.fields);
        }
    }

    resetDailyFieldStates() {
        this.fields.forEach(field => {
            if (field.unlocked) {
                field.watered = false;
            }
        });
        this.eventBus.emit('farming:dailyReset');
        this.eventBus.emit('farming:fieldsUpdated', this.fields);
    }

    checkStarVisitorTrigger(fieldId, plantData) {
        if (this.starVisitorState) {
            return;
        }

        if (Math.random() < this.STAR_VISITOR_CHANCE) {
            this.eventBus.emit('farming:info', { 
                message: `${plantData.name}成熟时释放出奇异的精神迷雾，向宇宙深处发送着召唤...` 
            });

            if (Math.random() < this.STAR_VISITOR_CHANCE) {
                this.summonStarVisitor(fieldId);
            }
        }
    }

    summonStarVisitor(triggerFieldId) {
        const triggerField = this.fields[triggerFieldId];
        const PlantConfig = window.PlantConfig || {};
        
        const affectedFields = [];
        const fieldsToMutate = [];
        
        this.fields.forEach((field, index) => {
            if (field.unlocked) {
                const distance = Math.abs(index - triggerFieldId);
                if (distance <= 2) {
                    affectedFields.push(index);
                    
                    if (Math.random() < 0.3) {
                        fieldsToMutate.push(index);
                    }
                }
            }
        });

        fieldsToMutate.forEach(fieldId => {
            const field = this.fields[fieldId];
            if (field.plant) {
                const aberrantSeed = this.getRandomAberrantSeedForSeason();
                if (aberrantSeed) {
                    const aberrantData = PlantConfig.getPlant ? 
                        PlantConfig.getPlant(aberrantSeed) : PlantConfig[aberrantSeed];
                    field.plant = aberrantSeed;
                    field.stage = 0;
                    field.growthProgress = 0;
                    this.eventBus.emit('farming:info', { 
                        message: `田块${fieldId + 1}的作物受到星之彩的影响，发生了奇异的变异！` 
                    });
                }
            }
        });

        this.starVisitorState = {
            active: true,
            triggerFieldId,
            affectedFields,
            fieldsToMutate,
            arrivalSeason: this.timeModule.getSeason(),
            arrivalDay: this.timeModule.getDay()
        };

        this.eventBus.emit('farming:starVisitorArrived', {
            triggerFieldId,
            affectedFields
        });
        this.eventBus.emit('farming:info', { 
            message: '星之彩回应了召唤，从宇宙深处降临！它的存在使周围的农田发生着不可预测的变化...' 
        });
    }

    checkStarVisitorDeparture(newSeason) {
        if (!this.starVisitorState || !this.starVisitorState.active) {
            return;
        }

        if (this.starVisitorState.arrivalSeason !== newSeason) {
            this.dismissStarVisitor();
        }
    }

    dismissStarVisitor(voluntary = false) {
        if (!this.starVisitorState) return;

        const PlantConfig = window.PlantConfig || {};
        
        this.starVisitorState.affectedFields.forEach(fieldId => {
            const field = this.fields[fieldId];
            if (field.unlocked) {
                if (field.plant) {
                    field.plant = null;
                    field.stage = 0;
                    field.growthProgress = 0;
                }
            }
        });

        const message = voluntary ? 
            '通过神秘的仪式，星之彩被送回了宇宙深处。但它的离去也带走了周围农田的生机...' :
            '星之彩完成了它的使命，返回宇宙深处。它的离去带走了周围农田的所有生机...';

        this.eventBus.emit('farming:starVisitorDeparted', {
            affectedFields: this.starVisitorState.affectedFields
        });
        this.eventBus.emit('farming:info', { message });

        this.starVisitorState = null;
        this.eventBus.emit('farming:fieldsUpdated', this.fields);
    }

    handleSeasonChange(newSeason) {
        const PlantConfig = window.PlantConfig || {};
        let plantsWilted = false;

        this.checkStarVisitorDeparture(newSeason);

        this.fields.forEach(field => {
            if (field.plant) {
                const plantData = PlantConfig.getPlant ? 
                    PlantConfig.getPlant(field.plant) : PlantConfig[field.plant];
                
                if (plantData && !plantData.seasons.includes(newSeason)) {
                    field.plant = null;
                    field.stage = 0;
                    field.growthProgress = 0;
                    plantsWilted = true;
                }
            }

            if (field.fertilized && field.fertilizerAppliedSeason !== null) {
                if (field.fertilizerAppliedSeason !== newSeason) {
                    field.fertilized = false;
                    field.fertilizerType = null;
                    field.fertilizerAppliedSeason = null;
                }
            }
        });

        if (plantsWilted) {
            this.eventBus.emit('farming:plantsWilted');
        }
        
        this.eventBus.emit('farming:fieldsUpdated', this.fields);
    }

    isPlantReady(fieldId) {
        const field = this.fields[fieldId];
        if (!field || !field.plant) return false;

        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? PlantConfig.getPlant(field.plant) : PlantConfig[field.plant];
        
        if (!plantData) return false;

        return field.stage >= plantData.stages.length - 1;
    }

    checkFieldCorruption(fieldId) {
        const field = this.fields[fieldId];
        if (!field || field.fieldType !== this.FIELD_NORMAL) return;

        if (field.corruptionFertilizerCount >= this.CORRUPTION_FERTILIZER_THRESHOLD ||
            field.aberrantPlantCount >= this.CORRUPTION_PLANT_THRESHOLD) {
            field.fieldType = this.FIELD_CORRUPTED;
            this.eventBus.emit('farming:fieldCorrupted', {
                fieldId,
                fieldType: this.FIELD_CORRUPTED
            });
        }
    }

    checkFieldCorruptionByType(fieldId, corruptionType) {
        const field = this.fields[fieldId];
        if (!field) return;
        
        if (field.fieldType !== this.FIELD_NORMAL && 
            field.fieldType !== this.FIELD_CORRUPTED) return;

        if (!field.corruptionCountByType) {
            field.corruptionCountByType = { corruption: 0, flesh: 0 };
        }

        const FertilizerConfig = window.FertilizerConfig || {};
        
        if (corruptionType === 'corruption') {
            const threshold = 4;
            if (field.corruptionCountByType.corruption >= threshold) {
                field.fieldType = this.FIELD_ALIENATED;
                this.eventBus.emit('farming:fieldCorrupted', {
                    fieldId,
                    fieldType: this.FIELD_ALIENATED
                });
            }
        } else if (corruptionType === 'flesh') {
            const threshold = 3;
            if (field.corruptionCountByType.flesh >= threshold) {
                field.fieldType = this.FIELD_BLOOD;
                this.eventBus.emit('farming:fieldCorrupted', {
                    fieldId,
                    fieldType: this.FIELD_BLOOD
                });
            }
        }
    }

    applyCorruptionFertilizer(fieldId) {
        const field = this.fields[fieldId];
        if (!field || !field.unlocked) {
            return { success: false, reason: '田地无效' };
        }
        if (field.fieldType === this.FIELD_CORRUPTED || 
            field.fieldType === this.FIELD_ALIENATED ||
            field.fieldType === this.FIELD_BLOOD ||
            field.fieldType === this.FIELD_ASTRAL) {
            return { success: false, reason: '田地已经是腐化状态' };
        }

        field.corruptionFertilizerCount++;
        this.checkFieldCorruption(fieldId);
        
        this.eventBus.emit('farming:fieldsUpdated', this.fields);
        return { success: true };
    }

    triggerAwarenessEvent(fieldId, awarenessType, plantData) {
        const eventMessages = {
            whisper: `${plantData.name}中传来诡异的低语声...`,
            hallucination: `${plantData.name}释放出致幻孢子，你看到了不该看到的东西。`,
            entanglement: `${plantData.name}的藤蔓缠绕了附近的作物，疯狂生长中...`,
            pulse: `${plantData.name}发出诡异的脉动，仿佛在呼吸...`
        };

        const message = eventMessages[awarenessType] || `${plantData.name}产生了自主意识...`;
        
        this.eventBus.emit('farming:awarenessEvent', {
            fieldId,
            plantType: fieldId,
            plantName: plantData.name,
            awarenessType,
            message
        });
    }

    getFieldTypeInfo(fieldType) {
        const fieldTypeInfo = {
            normal: {
                name: '普通土地',
                description: '适合种植常规作物，安全无副作用',
                color: '#8B7355'
            },
            corrupted: {
                name: '腐化土地',
                description: '通过污染肥料或频繁种植异化作物改造，适合种植克苏鲁作物',
                color: '#8a4a6a'
            },
            alienated: {
                name: '异化田块',
                description: '被污染肥料深度腐化，适合种植异化作物',
                color: '#2F4F2F'
            },
            blood: {
                name: '血红田块',
                description: '被血肉肥料深度腐化，适合种植血肉类作物',
                color: '#8B4513'
            },
            astral: {
                name: '星界地块',
                description: '被禁忌神肥腐化，神秘力量的栖息地',
                color: '#483D8B'
            },
            water: {
                name: '池塘',
                description: '适合种植水生作物',
                color: '#4a6a8a'
            }
        };
        return fieldTypeInfo[fieldType] || fieldTypeInfo.normal;
    }

    isPondUnlocked() {
        return this.pond.unlocked;
    }

    canUnlockPond() {
        const currentDay = this.timeModule.getDay();
        if (this.pond.unlocked) {
            return { canUnlock: false, reason: '池塘区域已解锁' };
        }

        if (currentDay < this.pond.unlockDay) {
            return { 
                canUnlock: false, 
                reason: `需要达到第 ${this.pond.unlockDay} 天才能解锁池塘区域，当前为第 ${currentDay} 天` 
            };
        }

        if (!this.gameState.hasEnoughMoney(this.pond.unlockCost)) {
            return { 
                canUnlock: false, 
                reason: `资金不足，解锁池塘区域需要 ${this.pond.unlockCost} 金币` 
            };
        }

        return { canUnlock: true, cost: this.pond.unlockCost };
    }

    unlockPond() {
        const check = this.canUnlockPond();
        if (!check.canUnlock) {
            return { success: false, reason: check.reason };
        }

        this.gameState.subtractMoney(this.pond.unlockCost);
        this.pond.unlocked = true;

        this.eventBus.emit('farming:pondUnlocked', {
            cost: this.pond.unlockCost
        });
        this.eventBus.emit('farming:pondUpdated', this.pond);
        this.eventBus.emit('economy:moneyChanged', this.gameState.getMoney());

        return { success: true, cost: this.pond.unlockCost };
    }

    getPondsState() {
        return JSON.parse(JSON.stringify(this.pond));
    }

    loadPondsState(savedPond) {
        if (savedPond) {
            this.pond = JSON.parse(JSON.stringify(savedPond));
            this.eventBus.emit('farming:pondUpdated', this.pond);
        }
    }

    getPond(pondId) {
        return this.pond.ponds[pondId];
    }

    getAllPonds() {
        return [...this.pond.ponds];
    }

    isPondFieldUnlocked(pondId) {
        const pond = this.pond.ponds[pondId];
        return pond && pond.unlocked;
    }

    getPondUnlockPrice(pondId) {
        const basePrice = 500;
        const priceIncrement = 200;
        return basePrice + pondId * priceIncrement;
    }

    canUnlockPondField(pondId) {
        const pond = this.pond.ponds[pondId];
        if (!pond || pond.unlocked) {
            return { canUnlock: false, reason: '池塘地块已解锁或无效' };
        }

        const price = this.getPondUnlockPrice(pondId);
        if (!this.gameState.hasEnoughMoney(price)) {
            return { canUnlock: false, reason: `资金不足，需要 ${price} 金币`, price };
        }

        return { canUnlock: true, price };
    }

    unlockPondField(pondId) {
        const check = this.canUnlockPondField(pondId);
        if (!check.canUnlock) {
            return { success: false, reason: check.reason };
        }

        const price = check.price;
        this.gameState.subtractMoney(price);

        const pond = this.pond.ponds[pondId];
        pond.unlocked = true;

        this.eventBus.emit('farming:pondFieldUnlocked', {
            pondId,
            price
        });
        this.eventBus.emit('farming:pondUpdated', this.pond);
        this.eventBus.emit('economy:moneyChanged', this.gameState.getMoney());

        return { success: true, price };
    }

    canPlantPond(pondId, seedType) {
        const pond = this.pond.ponds[pondId];
        const PlantConfig = window.PlantConfig || {};

        if (!pond || !pond.unlocked) {
            return { canPlant: false, reason: '池塘地块未解锁' };
        }

        if (pond.plant) {
            return { canPlant: false, reason: '池塘已有植物' };
        }

        if (!this.gameState.hasSeed(seedType)) {
            return { canPlant: false, reason: '背包中没有种子' };
        }

        const plantData = PlantConfig.getPlant ? PlantConfig.getPlant(seedType) : PlantConfig[seedType];
        if (plantData && plantData.requiredFieldType && plantData.requiredFieldType !== this.FIELD_WATER) {
            return { 
                canPlant: false, 
                reason: `${plantData.name}不能在池塘中种植，需要特定的土地类型` 
            };
        }

        const currentSeason = this.timeModule.getSeason();
        if (!this.environmentModule.isPlantInSeason(seedType)) {
            const plant = PlantConfig.getPlant ? PlantConfig.getPlant(seedType) : PlantConfig[seedType];
            return { 
                canPlant: false, 
                reason: `${plant ? plant.name : '该植物'}不能在${this.timeModule.getSeasonName()}季种植` 
            };
        }

        if (plantData) {
            const isNight = this.environmentModule.isNightTime();
            if (plantData.canGrowAtDay === false && !isNight) {
                return { 
                    canPlant: false, 
                    reason: `${plantData.name}只能在夜晚种植和生长` 
                };
            }
            if (plantData.canGrowAtNight === false && isNight) {
                return { 
                    canPlant: false, 
                    reason: `${plantData.name}只能在白天种植和生长` 
                };
            }
        }

        return { canPlant: true };
    }

    plantPond(pondId, seedType) {
        const check = this.canPlantPond(pondId, seedType);
        if (!check.canPlant) {
            this.eventBus.emit('farming:error', { message: check.reason });
            return { success: false, reason: check.reason };
        }

        const pond = this.pond.ponds[pondId];
        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? PlantConfig.getPlant(seedType) : PlantConfig[seedType];

        this.gameState.removeSeed(seedType);
        pond.plant = seedType;
        pond.stage = 0;
        pond.growthProgress = 0;
        pond.fertilized = false;
        pond.fertilizerType = null;

        this.clearSelectedSeed();

        this.eventBus.emit('farming:planted', {
            fieldId: pondId,
            seedType,
            plantName: plantData ? plantData.name : seedType,
            isPond: true
        });
        this.eventBus.emit('farming:pondUpdated', this.pond);

        return { success: true };
    }

    canHarvestPond(pondId) {
        const pond = this.pond.ponds[pondId];
        if (!pond || !pond.plant) {
            return { canHarvest: false, reason: '没有植物' };
        }

        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? PlantConfig.getPlant(pond.plant) : PlantConfig[pond.plant];
        
        if (!plantData) {
            return { canHarvest: false, reason: '植物数据无效' };
        }

        const isReady = pond.stage >= plantData.stages.length - 1;
        if (!isReady) {
            return { canHarvest: false, reason: '植物还未成熟' };
        }

        return { canHarvest: true };
    }

    harvestPond(pondId) {
        const check = this.canHarvestPond(pondId);
        if (!check.canHarvest) {
            return { success: false, reason: check.reason };
        }

        const pond = this.pond.ponds[pondId];
        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? PlantConfig.getPlant(pond.plant) : PlantConfig[pond.plant];

        let harvestMessage = '';

        if (plantData) {
            if (plantData.sanityLossOnHarvest && this.sanityModule) {
                const oldSanity = this.sanityModule.getSanity();
                this.sanityModule.subtractSanity(plantData.sanityLossOnHarvest);
                const newSanity = this.sanityModule.getSanity();
                harvestMessage += `理智损失 ${oldSanity - newSanity} 点。`;
            }

            if (plantData.pollutionGainOnHarvest && this.pollutionModule) {
                this.pollutionModule.addPollution(plantData.pollutionGainOnHarvest);
            }

            if (plantData.harvestCurses && plantData.harvestCurses.length > 0) {
                const curseChance = 0.3;
                if (Math.random() < curseChance) {
                    const curseIndex = Math.floor(Math.random() * plantData.harvestCurses.length);
                    const curse = plantData.harvestCurses[curseIndex];
                    harvestMessage += `受到诅咒：${curse}！`;
                    this.eventBus.emit('farming:curseApplied', {
                        fieldId: pondId,
                        plantType: pond.plant,
                        curse: curse,
                        isPond: true
                    });
                }
            }

            if (plantData.hasAwareness && pond.hasAwareness) {
                this.triggerAwarenessEvent(pondId, pond.awarenessType, plantData);
            }
        }

        let yieldMultiplier = 1;
        if (plantData && plantData.highYield) {
            yieldMultiplier = 2;
        }

        const result = this.gameState.addWarehouseCrop(pond.plant);
        if (!result.success) {
            this.eventBus.emit('farming:error', { message: result.reason });
            return { success: false, reason: result.reason };
        }

        const harvestedPlant = pond.plant;
        pond.plant = null;
        pond.stage = 0;
        pond.growthProgress = 0;
        pond.fertilized = false;
        pond.fertilizerType = null;
        pond.hasAwareness = false;
        pond.awarenessType = null;
        pond.watered = true;

        const harvestInfo = {
            fieldId: pondId,
            plantType: harvestedPlant,
            plantName: plantData ? plantData.name : harvestedPlant,
            yieldMultiplier,
            isPond: true
        };

        if (harvestMessage) {
            harvestInfo.message = harvestMessage;
        }

        this.eventBus.emit('farming:harvested', harvestInfo);
        this.eventBus.emit('farming:pondUpdated', this.pond);

        return { success: true };
    }

    applyPondFertilizer(pondId, fertilizerType) {
        const pond = this.pond.ponds[pondId];
        const FertilizerConfig = window.FertilizerConfig || {};

        if (!pond || !pond.unlocked) {
            return { success: false, reason: '池塘地块无效' };
        }

        if (pond.fertilized) {
            return { success: false, reason: '已经施过肥了' };
        }

        if (!this.gameState.hasFertilizer(fertilizerType)) {
            return { success: false, reason: '没有足够的肥料' };
        }

        this.gameState.removeFertilizer(fertilizerType);
        pond.fertilized = true;
        pond.fertilizerType = fertilizerType;

        const fertilizer = FertilizerConfig.getFertilizer ? 
            FertilizerConfig.getFertilizer(fertilizerType) : FertilizerConfig[fertilizerType];

        this.eventBus.emit('farming:fertilized', {
            fieldId: pondId,
            fertilizerType,
            fertilizerName: fertilizer ? fertilizer.name : fertilizerType,
            isPond: true
        });
        this.eventBus.emit('farming:pondUpdated', this.pond);

        return { success: true };
    }

    handlePondClick(pondId) {
        const pond = this.pond.ponds[pondId];

        if (!pond.unlocked) {
            const check = this.canUnlockPondField(pondId);
            this.eventBus.emit('farming:showPondUnlockOption', {
                pondId,
                canUnlock: check.canUnlock,
                price: check.price || this.getPondUnlockPrice(pondId),
                reason: check.reason
            });
            return;
        }

        if (!pond.plant) {
            if (this.selectedSeed) {
                this.plantPond(pondId, this.selectedSeed);
            } else {
                this.eventBus.emit('farming:needSeed');
            }
        } else {
            this.eventBus.emit('farming:showFieldActions', {
                fieldId: pondId,
                field: { ...pond, isPond: true }
            });
        }
    }

    updatePondGrowth(gameMinutes) {
        const PlantConfig = window.PlantConfig || {};
        const FertilizerConfig = window.FertilizerConfig || {};
        let needsUpdate = false;

        const isNight = this.environmentModule.isNightTime();
        const isRaining = this.environmentModule.isRaining ? this.environmentModule.isRaining() : false;
        const isFoggy = this.environmentModule.isFoggy ? this.environmentModule.isFoggy() : false;

        this.pond.ponds.forEach(pond => {
            if (pond.plant) {
                const plantData = PlantConfig.getPlant ? 
                    PlantConfig.getPlant(pond.plant) : PlantConfig[pond.plant];
                
                if (!plantData) return;

                if (plantData.canGrowAtDay === false && !isNight) {
                    return;
                }
                if (plantData.canGrowAtNight === false && isNight) {
                    return;
                }

                if (plantData.requiresAncientFertilizer && pond.fertilized && pond.fertilizerType) {
                    const fertilizer = FertilizerConfig.getFertilizer ? 
                        FertilizerConfig.getFertilizer(pond.fertilizerType) : 
                        FertilizerConfig[pond.fertilizerType];
                    
                    if (fertilizer && fertilizer.id !== 'ancient_fertilizer') {
                        pond.growthProgress += 0;
                        return;
                    }
                }

                let growthRate = 1;

                if (pond.fertilized && pond.fertilizerType) {
                    const fertilizer = FertilizerConfig.getFertilizer ? 
                        FertilizerConfig.getFertilizer(pond.fertilizerType) : 
                        FertilizerConfig[pond.fertilizerType];
                    
                    if (fertilizer) {
                        growthRate += fertilizer.growthBoost;
                    }
                }

                if (plantData.rainGrowthBoost && isRaining) {
                    growthRate *= plantData.rainGrowthBoost;
                }

                if (plantData.fogGrowthBoost && isFoggy) {
                    growthRate *= plantData.fogGrowthBoost;
                }

                const totalGrowthMinutes = plantData.growthTime.hours * 60 + plantData.growthTime.minutes;
                const growthPerMinute = 1 / totalGrowthMinutes;

                pond.growthProgress += growthPerMinute * gameMinutes * growthRate;

                const totalStages = plantData.stages.length;
                const progressPerStage = 1 / (totalStages - 1);

                const newStage = Math.min(
                    Math.floor(pond.growthProgress / progressPerStage),
                    totalStages - 1
                );

                if (newStage > pond.stage) {
                    pond.stage = newStage;
                    needsUpdate = true;

                    if (pond.stage >= totalStages - 1) {
                        if (plantData.hasAwareness && !pond.hasAwareness) {
                            if (Math.random() < plantData.awarenessChance) {
                                pond.hasAwareness = true;
                                pond.awarenessType = plantData.awarenessType;
                                this.eventBus.emit('farming:plantAwakened', {
                                    fieldId: pond.id,
                                    plantType: pond.plant,
                                    plantName: plantData.name,
                                    awarenessType: plantData.awarenessType,
                                    isPond: true
                                });
                            }
                        }

                        this.eventBus.emit('farming:plantReady', {
                            fieldId: pond.id,
                            plantType: pond.plant,
                            plantName: plantData.name,
                            isPond: true
                        });
                    }
                }
            }
        });

        if (needsUpdate) {
            this.eventBus.emit('farming:pondUpdated', this.pond);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FarmingModule;
}
