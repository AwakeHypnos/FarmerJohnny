class EnvironmentModule {
    constructor(eventBus, timeModule) {
        this.eventBus = eventBus;
        this.timeModule = timeModule;
        
        this.state = {
            isNight: false
        };

        this.setupListeners();
    }

    setupListeners() {
        this.eventBus.on('time:hourChanged', (data) => {
            this.checkDayNight();
        });

        this.eventBus.on('time:dawn', () => {
            this.state.isNight = false;
            this.eventBus.emit('environment:dayBreak');
        });

        this.eventBus.on('time:dusk', () => {
            this.state.isNight = true;
            this.eventBus.emit('environment:nightFall');
        });
    }

    checkDayNight() {
        const wasNight = this.state.isNight;
        this.state.isNight = this.timeModule.isNight();

        if (wasNight !== this.state.isNight) {
            this.eventBus.emit('environment:dayNightChanged', {
                isNight: this.state.isNight
            });
        }
    }

    isNightTime() {
        return this.state.isNight;
    }

    getCurrentSeason() {
        return this.timeModule.getSeason();
    }

    getSeasonName() {
        return this.timeModule.getSeasonName();
    }

    isPlantInSeason(plantId) {
        const PlantConfig = window.PlantConfig || {};
        const season = this.getCurrentSeason();
        
        if (PlantConfig.isPlantValidForSeason) {
            return PlantConfig.isPlantValidForSeason(plantId, season);
        }
        
        const plant = PlantConfig[plantId];
        return plant && plant.seasons && plant.seasons.includes(season);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvironmentModule;
}
