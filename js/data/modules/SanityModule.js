class SanityModule {
    constructor(eventBus, gameState, timeModule) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        this.timeModule = timeModule;

        this.setupListeners();
    }

    init() {
        this.gameState.state.sanity = 100;
        this.eventBus.emit('sanity:changed', {
            oldValue: 100,
            newValue: 100,
            change: 0,
            reason: '初始化理智值'
        });
    }

    setupListeners() {
        this.eventBus.on('time:hourChanged', () => {
            this.processPeriodicSanityChanges();
        });

        this.eventBus.on('farming:planted', (data) => {
            const PlantConfig = window.PlantConfig || {};
            const plantData = PlantConfig.getPlant ? 
                PlantConfig.getPlant(data.seedType) : PlantConfig[data.seedType];
            
            if (plantData && plantData.isTaboo) {
            } else {
                this.modifySanity(1, '常规种植');
            }
        });

        this.eventBus.on('farming:harvested', (data) => {
            const PlantConfig = window.PlantConfig || {};
            const plantData = PlantConfig.getPlant ? 
                PlantConfig.getPlant(data.plantType) : PlantConfig[data.plantType];
            
            if (plantData && plantData.isTaboo) {
                const sanityLoss = plantData.sanityLossOnHarvest || 10;
                this.modifySanity(-sanityLoss, '收获禁忌作物');
            } else {
                this.modifySanity(2, '收获普通作物');
            }
        });

        this.eventBus.on('farming:watered', () => {
            this.modifySanity(0.5, '浇水');
        });
    }

    getSanity() {
        return this.gameState.getSanity();
    }

    getSanityLevel() {
        const SanityConfig = window.SanityConfig || {};
        const sanity = this.getSanity();
        
        if (SanityConfig.getSanityLevel) {
            return SanityConfig.getSanityLevel(sanity);
        }
        
        return this._getSanityLevelFallback(sanity);
    }

    _getSanityLevelFallback(sanity) {
        const SanityConfig = window.SanityConfig || {};
        const levels = SanityConfig.sanityLevels || {};
        
        for (const [key, level] of Object.entries(levels)) {
            if (sanity >= level.minValue && sanity <= level.maxValue) {
                return level;
            }
        }
        
        return levels.normal || levels[0] || null;
    }

    modifySanity(amount, reason = '') {
        const SanityConfig = window.SanityConfig || {};
        const currentSanity = this.getSanity();
        
        if (amount < 0) {
            const multiplier = SanityConfig.getSanityLossMultiplier ? 
                SanityConfig.getSanityLossMultiplier(currentSanity) : 
                this._getSanityLossMultiplierFallback(currentSanity);
            
            amount = amount * multiplier;
        }

        const oldLevel = this.getSanityLevel();
        let result;
        
        if (amount > 0) {
            result = this.gameState.addSanity(amount);
        } else {
            result = this.gameState.subtractSanity(Math.abs(amount));
        }

        const newLevel = this.getSanityLevel();
        
        if (oldLevel && newLevel && oldLevel.id !== newLevel.id) {
            if (newLevel.minValue < oldLevel.minValue) {
                this.eventBus.emit('sanity:levelDown', {
                    oldLevel: oldLevel,
                    newLevel: newLevel,
                    oldSanity: result.oldValue,
                    newSanity: result.newValue
                });
            } else {
                this.eventBus.emit('sanity:levelUp', {
                    oldLevel: oldLevel,
                    newLevel: newLevel,
                    oldSanity: result.oldValue,
                    newSanity: result.newValue
                });
            }
        }

        this.eventBus.emit('sanity:changed', {
            oldValue: result.oldValue,
            newValue: result.newValue,
            change: amount,
            reason: reason
        });

        return result;
    }

    _getSanityLossMultiplierFallback(sanity) {
        const SanityConfig = window.SanityConfig || {};
        const level = this._getSanityLevelFallback(sanity);
        
        if (level && level.effects && level.effects.sanityLossMultiplier) {
            return level.effects.sanityLossMultiplier;
        }
        
        return 1;
    }

    processPeriodicSanityChanges() {
        const hour = this.timeModule.getHour();
        
        if (hour >= 6 && hour < 18) {
            this.modifySanity(0.2, '白天劳作恢复理智');
        }
    }

    isNight() {
        return this.timeModule ? this.timeModule.isNight() : false;
    }

    applyNightActionSanityLoss(actionName) {
        if (this.isNight()) {
            this.modifySanity(-1, `深夜${actionName}消耗理智`);
            return true;
        }
        return false;
    }

    canPerformAction(action) {
        const SanityConfig = window.SanityConfig || {};
        const sanity = this.getSanity();
        
        if (SanityConfig.canPerformAction) {
            return SanityConfig.canPerformAction(sanity, action);
        }
        
        const level = this.getSanityLevel();
        if (!level) return true;

        switch(action) {
            case 'plantTaboo':
                return level.effects ? level.effects.canPlantTaboo : false;
            case 'useAltar':
                return level.effects ? level.effects.canUseAltar : false;
            case 'fallenEnding':
                return level.effects ? level.effects.canUnlockFallenEnding : false;
            case 'abominationFarming':
                return level.effects ? level.effects.canUseAbominationFarming : false;
            default:
                return true;
        }
    }

    getWeedSpawnChance() {
        const SanityConfig = window.SanityConfig || {};
        const sanity = this.getSanity();
        
        if (SanityConfig.getWeedSpawnChance) {
            return SanityConfig.getWeedSpawnChance(sanity);
        }
        
        const level = this.getSanityLevel();
        if (!level || !level.effects || !level.effects.hasWeedSpawn) return 0;
        
        return 0.05 + (100 - sanity) * 0.001;
    }

    getIllusionChance() {
        const SanityConfig = window.SanityConfig || {};
        const sanity = this.getSanity();
        
        if (SanityConfig.getIllusionChance) {
            return SanityConfig.getIllusionChance(sanity);
        }
        
        const level = this.getSanityLevel();
        if (!level || !level.effects || !level.effects.canSeeIllusions) return 0;
        
        return level.effects.fakeResourceChance || 0;
    }

    getCropBonusPercent() {
        const SanityConfig = window.SanityConfig || {};
        const sanity = this.getSanity();
        
        if (SanityConfig.getCropBonusPercent) {
            return SanityConfig.getCropBonusPercent(sanity);
        }
        
        const level = this.getSanityLevel();
        if (!level || !level.effects) return 0;
        
        return level.effects.cropBonusPercent || 0;
    }

    getCropPollutionChance() {
        const SanityConfig = window.SanityConfig || {};
        const sanity = this.getSanity();
        
        if (SanityConfig.getCropPollutionChance) {
            return SanityConfig.getCropPollutionChance(sanity);
        }
        
        const level = this.getSanityLevel();
        if (!level || !level.effects) return 0;
        
        return level.effects.cropPollutionChance || 0;
    }

    getWeirdEventChance() {
        const SanityConfig = window.SanityConfig || {};
        const sanity = this.getSanity();
        
        if (SanityConfig.getWeirdEventChance) {
            return SanityConfig.getWeirdEventChance(sanity);
        }
        
        const level = this.getSanityLevel();
        if (!level || !level.effects) return 0;
        
        return level.effects.weirdEventChance || 0;
    }

    trySpawnWeirdWeed(field) {
        const chance = this.getWeedSpawnChance();
        if (Math.random() > chance) return false;

        const SanityConfig = window.SanityConfig || {};
        const weeds = SanityConfig.weirdWeeds || {};
        const weedList = Object.values(weeds);
        
        if (weedList.length === 0) return false;

        const validWeeds = weedList.filter(w => Math.random() <= w.appearanceChance);
        if (validWeeds.length === 0) return false;

        const weed = validWeeds[Math.floor(Math.random() * validWeeds.length)];
        
        field.weirdWeed = weed;
        this.eventBus.emit('sanity:weedSpawned', {
            field: field,
            weed: weed
        });

        return true;
    }

    tryTriggerIllusion() {
        const chance = this.getIllusionChance();
        if (Math.random() > chance) return null;

        const SanityConfig = window.SanityConfig || {};
        const fakeResources = SanityConfig.fakeResources || {};
        const fakeArtifacts = SanityConfig.fakeArtifacts || {};
        
        const allIllusions = [
            ...Object.values(fakeResources).map(r => ({ ...r, type: 'resource' })),
            ...Object.values(fakeArtifacts).map(a => ({ ...a, type: 'artifact' }))
        ];

        if (allIllusions.length === 0) return null;

        const illusion = allIllusions[Math.floor(Math.random() * allIllusions.length)];
        
        this.eventBus.emit('sanity:illusionTriggered', { illusion });
        
        return illusion;
    }

    getFullState() {
        return {
            sanity: this.getSanity()
        };
    }

    loadState(savedData) {
        if (savedData.sanity !== undefined) {
            this.gameState.state.sanity = savedData.sanity;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SanityModule;
}
