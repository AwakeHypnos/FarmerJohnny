class SaveManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.storageKey = 'farmerJohnny_save';
    }

    save(gameState, timeModule, farmingModule) {
        try {
            const saveData = {
                gameState: gameState.getFullState(),
                timeState: timeModule.getTimeState(),
                fields: farmingModule.getFieldsState(),
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

    load(gameState, timeModule, farmingModule) {
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
