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
        this.FIELD_WATER = 'water';

        this.config = {
            baseUnlockPrice: 100,
            corruptionFertilizerCount: 3,
            corruptionAberrantPlantCount: 5
        };

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
                corruptionFertilizerCount: 0,
                aberrantPlantCount: 0,
                growthProgress: 0,
                stage: 0,
                hasAwareness: false,
                awarenessType: null
            });
        }
        this.selectedSeed = null;
        this.eventBus.emit('farming:fieldsUpdated', this.fields);
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
            if (plantData.requiredFieldType && plantData.requiredFieldType !== field.fieldType) {
                const fieldTypeNames = {
                    normal: '普通土地',
                    corrupted: '腐化土地',
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

    plantSeed(fieldId, seedType) {
        const check = this.canPlant(fieldId, seedType);
        if (!check.canPlant) {
            this.eventBus.emit('farming:error', { message: check.reason });
            return { success: false, reason: check.reason };
        }

        const field = this.fields[fieldId];
        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? PlantConfig.getPlant(seedType) : PlantConfig[seedType];

        this.gameState.removeSeed(seedType);
        field.plant = seedType;
        field.stage = 0;
        field.growthProgress = 0;
        field.watered = false;
        field.fertilized = false;
        field.fertilizerType = null;

        this.clearSelectedSeed();

        this.eventBus.emit('farming:planted', {
            fieldId,
            seedType,
            plantName: plantData ? plantData.name : seedType
        });

        this.eventBus.emit('farming:fieldsUpdated', this.fields);

        return { success: true };
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
                this.eventBus.emit('farming:needSeed');
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

        this.gameState.removeFertilizer(fertilizerType);
        field.fertilized = true;
        field.fertilizerType = fertilizerType;

        const fertilizer = FertilizerConfig.getFertilizer ? 
            FertilizerConfig.getFertilizer(fertilizerType) : FertilizerConfig[fertilizerType];

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

    handleSeasonChange(newSeason) {
        const PlantConfig = window.PlantConfig || {};
        let plantsWilted = false;

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
        });

        if (plantsWilted) {
            this.eventBus.emit('farming:plantsWilted');
            this.eventBus.emit('farming:fieldsUpdated', this.fields);
        }
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

    applyCorruptionFertilizer(fieldId) {
        const field = this.fields[fieldId];
        if (!field || !field.unlocked) {
            return { success: false, reason: '田地无效' };
        }
        if (field.fieldType === this.FIELD_CORRUPTED) {
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
                color: '#4a8a6a'
            },
            corrupted: {
                name: '腐化土地',
                description: '通过污染肥料或频繁种植异化作物改造，适合种植克苏鲁作物',
                color: '#8a4a6a'
            },
            water: {
                name: '池塘',
                description: '适合种植水生作物',
                color: '#4a6a8a'
            }
        };
        return fieldTypeInfo[fieldType] || fieldTypeInfo.normal;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FarmingModule;
}
