class SaveManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.storageKey = 'farmerJohnny_save';
    }

    save(gameState, timeModule, farmingModule, sanityModule, pollutionModule, livestockModule, sleepModule) {
        try {
            const saveData = {
                gameState: gameState.getFullState(),
                timeState: timeModule.getTimeState(),
                fields: farmingModule.getFieldsState(),
                sanityState: sanityModule ? sanityModule.getFullState() : null,
                pollutionState: pollutionModule ? pollutionModule.getFullState() : null,
                livestockState: livestockModule ? livestockModule.getFullState() : null,
                sleepState: sleepModule ? sleepModule.getFullState() : null,
                savedAt: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            this.eventBus.emit('save:success');
            return true;
        } catch (error) {
            console.error('存档失败:', error);
            this.eventBus.emit('save:error', { error });
            return false;
        }
    }

    load(gameState, timeModule, farmingModule, sanityModule, pollutionModule, livestockModule, sleepModule) {
        try {
            const saveData = localStorage.getItem(this.storageKey);

            if (!saveData) {
                this.eventBus.emit('load:notFound');
                return false;
            }

            const parsedData = JSON.parse(saveData);

            if (parsedData.gameState) {
                gameState.loadState(parsedData.gameState);
            }

            if (parsedData.timeState) {
                timeModule.setState(parsedData.timeState);
            }

            if (parsedData.fields) {
                farmingModule.loadFieldsState(parsedData.fields);
            }

            if (parsedData.sanityState && sanityModule) {
                sanityModule.loadState(parsedData.sanityState);
            }

            if (parsedData.pollutionState && pollutionModule) {
                pollutionModule.loadState(parsedData.pollutionState);
            }

            if (parsedData.livestockState && livestockModule) {
                livestockModule.loadState(parsedData.livestockState);
            }

            if (parsedData.sleepState && sleepModule) {
                sleepModule.loadState(parsedData.sleepState);
            }

            this.eventBus.emit('load:success', parsedData);
            return true;
        } catch (error) {
            console.error('读档失败:', error);
            this.eventBus.emit('load:error', { error });
            return false;
        }
    }

    hasSave() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    clearSave() {
        try {
            localStorage.removeItem(this.storageKey);
            this.eventBus.emit('save:cleared');
            return true;
        } catch (error) {
            console.error('清除存档失败:', error);
            return false;
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveManager;
}
