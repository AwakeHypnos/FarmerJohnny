class PollutionModule {
    constructor(eventBus, gameState, timeModule) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        this.timeModule = timeModule;

        this.activeEvents = [];

        this.setupListeners();
    }

    init() {
        this.gameState.state.pollution = 0;
        this.activeEvents = [];
        this.eventBus.emit('pollution:changed', {
            oldValue: 0,
            newValue: 0,
            change: 0,
            reason: '初始化污染值'
        });
    }

    setupListeners() {
        this.eventBus.on('time:newDay', () => {
            this.processDailyPollutionEffects();
            this.tryTriggerNegativeEvent();
        });

        this.eventBus.on('farming:planted', (data) => {
            const PlantConfig = window.PlantConfig || {};
            const plantData = PlantConfig.getPlant ? 
                PlantConfig.getPlant(data.seedType) : PlantConfig[data.seedType];
            
            if (plantData && plantData.isTaboo) {
                this.modifyPollution(5, '种植禁忌作物');
            }
        });

        this.eventBus.on('farming:harvested', (data) => {
            const PlantConfig = window.PlantConfig || {};
            const plantData = PlantConfig.getPlant ? 
                PlantConfig.getPlant(data.plantType) : PlantConfig[data.plantType];
            
            if (plantData && plantData.isTaboo) {
                this.modifyPollution(10, '收获禁忌作物');
            }
        });

        this.eventBus.on('sanity:levelDown', (data) => {
            if (data.newLevel && data.newLevel.id === 'fallen') {
                this.modifyPollution(20, '沉沦于古老力量');
            }
        });
    }

    getPollution() {
        return this.gameState.getPollution();
    }

    getPollutionLevel() {
        const PollutionConfig = window.PollutionConfig || {};
        const pollution = this.getPollution();
        
        if (PollutionConfig.getPollutionLevel) {
            return PollutionConfig.getPollutionLevel(pollution);
        }
        
        return this._getPollutionLevelFallback(pollution);
    }

    _getPollutionLevelFallback(pollution) {
        const PollutionConfig = window.PollutionConfig || {};
        const levels = PollutionConfig.pollutionLevels || {};
        
        const levelList = Object.values(levels).sort((a, b) => a.id - b.id);
        
        for (const level of levelList) {
            if (pollution >= level.minValue && pollution <= level.maxValue) {
                return level;
            }
        }
        
        return levelList[levelList.length - 1] || null;
    }

    modifyPollution(amount, reason = '') {
        let result;
        const oldPollution = this.getPollution();
        const oldLevel = this.getPollutionLevel();
        
        if (amount > 0) {
            result = this.gameState.addPollution(amount);
        } else {
            result = this.gameState.subtractPollution(Math.abs(amount));
        }

        const newLevel = this.getPollutionLevel();
        
        if (oldLevel && newLevel && oldLevel.id !== newLevel.id) {
            if (newLevel.id > oldLevel.id) {
                this.eventBus.emit('pollution:levelUp', {
                    oldLevel: oldLevel,
                    newLevel: newLevel,
                    oldPollution: result.oldValue,
                    newPollution: result.newValue
                });
            } else {
                this.eventBus.emit('pollution:levelDown', {
                    oldLevel: oldLevel,
                    newLevel: newLevel,
                    oldPollution: result.oldValue,
                    newPollution: result.newValue
                });
            }
        }

        this.eventBus.emit('pollution:changed', {
            oldValue: result.oldValue,
            newValue: result.newValue,
            change: amount,
            reason: reason
        });

        return result;
    }

    processDailyPollutionEffects() {
        const pollution = this.getPollution();
        const PollutionConfig = window.PollutionConfig || {};
        
        const activeEffects = PollutionConfig.getActiveEnvironmentEffects ? 
            PollutionConfig.getActiveEnvironmentEffects(pollution) : 
            this._getActiveEnvironmentEffectsFallback(pollution);

        if (activeEffects.length > 0) {
            this.eventBus.emit('pollution:environmentEffects', {
                effects: activeEffects,
                pollutionLevel: this.getPollutionLevel()
            });
        }

        this.applyCropPenalties();
    }

    _getActiveEnvironmentEffectsFallback(pollution) {
        const PollutionConfig = window.PollutionConfig || {};
        const level = this._getPollutionLevelFallback(pollution);
        
        if (!level || !level.effects || !level.effects.environmentChanges) {
            return [];
        }

        const effects = [];
        const envChanges = PollutionConfig.environmentChanges || {};
        
        for (const changeId of level.effects.environmentChanges) {
            const change = envChanges[changeId];
            if (change) {
                effects.push(change);
            }
        }
        
        return effects;
    }

    applyCropPenalties() {
        const PollutionConfig = window.PollutionConfig || {};
        const pollution = this.getPollution();
        
        const cropPenalty = PollutionConfig.getCropPenalty ? 
            PollutionConfig.getCropPenalty(pollution) : 
            this._getCropPenaltyFallback(pollution);

        if (cropPenalty > 0) {
            this.eventBus.emit('pollution:cropPenaltyApplied', {
                penalty: cropPenalty,
                pollution: pollution
            });
        }
    }

    _getCropPenaltyFallback(pollution) {
        const level = this._getPollutionLevelFallback(pollution);
        if (!level || !level.effects) return 0;
        return level.effects.cropPenalty || 0;
    }

    getTabooCropBonus() {
        const PollutionConfig = window.PollutionConfig || {};
        const pollution = this.getPollution();
        
        if (PollutionConfig.getTabooCropBonus) {
            return PollutionConfig.getTabooCropBonus(pollution);
        }
        
        const level = this.getPollutionLevel();
        if (!level || !level.effects) return 0;
        
        return level.effects.tabooCropBonus || 0;
    }

    getAnimalMutationChance() {
        const PollutionConfig = window.PollutionConfig || {};
        const pollution = this.getPollution();
        
        if (PollutionConfig.getAnimalMutationChance) {
            return PollutionConfig.getAnimalMutationChance(pollution);
        }
        
        const level = this.getPollutionLevel();
        if (!level || !level.effects) return 0;
        
        return level.effects.animalMutationChance || 0;
    }

    getNegativeEventChance() {
        const PollutionConfig = window.PollutionConfig || {};
        const pollution = this.getPollution();
        
        if (PollutionConfig.getNegativeEventChance) {
            return PollutionConfig.getNegativeEventChance(pollution);
        }
        
        const level = this.getPollutionLevel();
        if (!level || !level.effects) return 0;
        
        return level.effects.negativeEventChance || 0;
    }

    tryTriggerNegativeEvent() {
        const chance = this.getNegativeEventChance();
        if (Math.random() > chance) return false;

        const PollutionConfig = window.PollutionConfig || {};
        const pollution = this.getPollution();
        
        const availableEvents = PollutionConfig.getAvailableNegativeEvents ? 
            PollutionConfig.getAvailableNegativeEvents(pollution) : 
            this._getAvailableNegativeEventsFallback(pollution);

        if (availableEvents.length === 0) return false;

        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        
        this.triggerNegativeEvent(event);

        return true;
    }

    _getAvailableNegativeEventsFallback(pollution) {
        const PollutionConfig = window.PollutionConfig || {};
        const events = PollutionConfig.negativeEvents || {};
        const level = this._getPollutionLevelFallback(pollution);
        
        const available = [];
        
        for (const [id, event] of Object.entries(events)) {
            if (event.minPollutionLevel <= level.id) {
                const adjustedChance = event.baseChance * (1 + (pollution / 100));
                available.push({
                    ...event,
                    id: id,
                    adjustedChance: Math.min(adjustedChance, 0.5)
                });
            }
        }
        
        return available;
    }

    triggerNegativeEvent(event) {
        const SanityModule = window.SanityModule || null;
        
        this.activeEvents.push({
            ...event,
            startTime: this.timeModule.getDay() * 24 + this.timeModule.getHour()
        });

        if (event.effects) {
            if (event.effects.sanityLoss) {
                this.eventBus.emit('pollution:eventSanityLoss', {
                    event: event,
                    sanityLoss: event.effects.sanityLoss
                });
            }

            if (event.effects.cropDamageChance && Math.random() < event.effects.cropDamageChance) {
                this.eventBus.emit('pollution:eventCropDamage', {
                    event: event
                });
            }

            if (event.effects.animalPanicChance && Math.random() < event.effects.animalPanicChance) {
                this.eventBus.emit('pollution:eventAnimalPanic', {
                    event: event
                });
            }
        }

        this.eventBus.emit('pollution:negativeEventTriggered', {
            event: event
        });

        this.modifyPollution(5, `负面事件：${event.name}`);
    }

    cleanseArea() {
        const PollutionConfig = window.PollutionConfig || {};
        const sources = PollutionConfig.pollutionSources || {};
        
        if (sources.cleansing) {
            this.modifyPollution(sources.cleansing.value, sources.cleansing.reason);
        } else {
            this.modifyPollution(-15, '净化仪式');
        }
        
        this.eventBus.emit('pollution:cleansed');
    }

    getFullState() {
        return {
            pollution: this.getPollution(),
            activeEvents: JSON.parse(JSON.stringify(this.activeEvents))
        };
    }

    loadState(savedData) {
        if (savedData.pollution !== undefined) {
            this.gameState.state.pollution = savedData.pollution;
        }
        if (savedData.activeEvents) {
            this.activeEvents = JSON.parse(JSON.stringify(savedData.activeEvents));
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PollutionModule;
}
