class FarmingModule {
    constructor(eventBus, gameState, timeModule, environmentModule) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        this.timeModule = timeModule;
        this.environmentModule = environmentModule;

        this.totalFields = 9;
        this.unlockedFields = 1;
        this.fields = [];

        this.selectedSeed = null;

        this.setupListeners();
    }

    setupListeners() {
        this.eventBus.on('time:updated', (timeState) => {
        });

        this.eventBus.on('time:newDay', () => {
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
                plant: null,
                watered: false,
                fertilized: false,
                fertilizerType: null,
                growthProgress: 0,
                stage: 0
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
            this.eventBus.emit('farming:error', { message: '这块田地还未解锁。' });
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

        this.gameState.addCrop(field.plant);

        const harvestedPlant = field.plant;
        field.plant = null;
        field.stage = 0;
        field.growthProgress = 0;
        field.watered = false;
        field.fertilized = false;
        field.fertilizerType = null;

        this.eventBus.emit('farming:harvested', {
            fieldId,
            plantType: harvestedPlant,
            plantName: plantData ? plantData.name : harvestedPlant
        });
        this.eventBus.emit('farming:fieldsUpdated', this.fields);

        return { success: true };
    }

    updatePlantGrowth(gameMinutes) {
        const PlantConfig = window.PlantConfig || {};
        const FertilizerConfig = window.FertilizerConfig || {};
        let needsUpdate = false;

        this.fields.forEach(field => {
            if (field.plant && field.watered) {
                const plantData = PlantConfig.getPlant ? 
                    PlantConfig.getPlant(field.plant) : PlantConfig[field.plant];
                
                if (!plantData) return;

                let growthRate = 1;

                if (field.fertilized && field.fertilizerType) {
                    const fertilizer = FertilizerConfig.getFertilizer ? 
                        FertilizerConfig.getFertilizer(field.fertilizerType) : 
                        FertilizerConfig[field.fertilizerType];
                    
                    if (fertilizer) {
                        growthRate += fertilizer.growthBoost;
                    }
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
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FarmingModule;
}
