class GameState {
    constructor() {
        this.state = {
            isPlaying: false,
            money: 1000,
            sanity: 100,
            pollution: 0
        };

        this.inventory = {
            seeds: {},
            crops: {},
            items: {},
            animalProducts: {}
        };

        this.warehouse = {
            seeds: {},
            crops: {},
            items: {},
            animalProducts: {}
        };

        this.fertilizers = {};
        this.captureTools = {};

        this.livestock = {
            animals: [],
            barnLevel: 1
        };

        this.dialogLog = [];

        this.marketPrices = {};

        this.config = {
            inventoryStackLimit: 30,
            warehouseStackLimit: 50,
            maxDialogLog: 100
        };
    }

    init() {
        this.state = {
            isPlaying: true,
            money: 1000,
            sanity: 100,
            pollution: 0
        };

        this.inventory = {
            seeds: {},
            crops: {},
            items: {},
            animalProducts: {}
        };

        this.warehouse = {
            seeds: {},
            crops: {},
            items: {},
            animalProducts: {}
        };

        this.fertilizers = {
            basic_fertilizer: 0,
            premium_fertilizer: 0,
            ancient_fertilizer: 0
        };

        this.captureTools = {
            basic_trap: 2,
            advanced_trap: 0,
            mystical_trap: 0
        };

        this.livestock = {
            animals: [],
            barnLevel: 1
        };

        this.dialogLog = [];

        this.marketPrices = {};
    }

    getInventoryStackLimit() {
        return this.config.inventoryStackLimit;
    }

    getWarehouseStackLimit() {
        return this.config.warehouseStackLimit;
    }

    canAddToInventory(itemType, category, count = 1) {
        if (category === 'fertilizers') {
            const currentCount = this.fertilizers[itemType] || 0;
            return currentCount + count <= this.config.inventoryStackLimit;
        }
        if (category === 'captureTools') {
            const currentCount = this.captureTools[itemType] || 0;
            return currentCount + count <= this.config.inventoryStackLimit;
        }
        const currentCount = this.inventory[category] ? (this.inventory[category][itemType] || 0) : 0;
        return currentCount + count <= this.config.inventoryStackLimit;
    }

    canAddToWarehouse(itemType, category, count = 1) {
        const currentCount = this.warehouse[category][itemType] || 0;
        return currentCount + count <= this.config.warehouseStackLimit;
    }

    getMoney() {
        return this.state.money;
    }

    addMoney(amount) {
        this.state.money += amount;
        return this.state.money;
    }

    subtractMoney(amount) {
        if (this.state.money >= amount) {
            this.state.money -= amount;
            return true;
        }
        return false;
    }

    hasEnoughMoney(amount) {
        return this.state.money >= amount;
    }

    getSeedCount(seedType, fromWarehouse = false) {
        if (fromWarehouse) {
            return this.warehouse.seeds[seedType] || 0;
        }
        return this.inventory.seeds[seedType] || 0;
    }

    addSeed(seedType, count = 1) {
        if (!this.canAddToInventory(seedType, 'seeds', count)) {
            return { success: false, reason: '背包已满' };
        }
        if (!this.inventory.seeds[seedType]) {
            this.inventory.seeds[seedType] = 0;
        }
        this.inventory.seeds[seedType] += count;
        return { success: true, count: this.inventory.seeds[seedType] };
    }

    removeSeed(seedType, count = 1, fromWarehouse = false) {
        const source = fromWarehouse ? this.warehouse.seeds : this.inventory.seeds;
        if (source[seedType] && source[seedType] >= count) {
            source[seedType] -= count;
            return true;
        }
        return false;
    }

    hasSeed(seedType) {
        return this.getSeedCount(seedType) > 0;
    }

    addWarehouseSeed(seedType, count = 1) {
        if (!this.canAddToWarehouse(seedType, 'seeds', count)) {
            return { success: false, reason: '仓库已满' };
        }
        if (!this.warehouse.seeds[seedType]) {
            this.warehouse.seeds[seedType] = 0;
        }
        this.warehouse.seeds[seedType] += count;
        return { success: true, count: this.warehouse.seeds[seedType] };
    }

    getCropCount(cropType, fromWarehouse = false) {
        if (fromWarehouse) {
            return this.warehouse.crops[cropType] || 0;
        }
        return this.inventory.crops[cropType] || 0;
    }

    addCrop(cropType, count = 1) {
        if (!this.canAddToInventory(cropType, 'crops', count)) {
            return { success: false, reason: '背包已满' };
        }
        if (!this.inventory.crops[cropType]) {
            this.inventory.crops[cropType] = 0;
        }
        this.inventory.crops[cropType] += count;
        return { success: true, count: this.inventory.crops[cropType] };
    }

    addWarehouseCrop(cropType, count = 1) {
        if (!this.canAddToWarehouse(cropType, 'crops', count)) {
            return { success: false, reason: '仓库已满' };
        }
        if (!this.warehouse.crops[cropType]) {
            this.warehouse.crops[cropType] = 0;
        }
        this.warehouse.crops[cropType] += count;
        return { success: true, count: this.warehouse.crops[cropType] };
    }

    removeCrop(cropType, count = 1, fromWarehouse = false) {
        const source = fromWarehouse ? this.warehouse.crops : this.inventory.crops;
        if (source[cropType] && source[cropType] >= count) {
            source[cropType] -= count;
            return true;
        }
        return false;
    }

    hasCrop(cropType) {
        return this.getCropCount(cropType) > 0 || this.getCropCount(cropType, true) > 0;
    }

    getFertilizerCount(fertilizerType) {
        return this.fertilizers[fertilizerType] || 0;
    }

    addFertilizer(fertilizerType, count = 1) {
        if (!this.canAddToInventory(fertilizerType, 'fertilizers', count)) {
            return { success: false, reason: '背包已满' };
        }
        if (!this.fertilizers[fertilizerType]) {
            this.fertilizers[fertilizerType] = 0;
        }
        this.fertilizers[fertilizerType] += count;
        return { success: true, count: this.fertilizers[fertilizerType] };
    }

    removeFertilizer(fertilizerType, count = 1) {
        if (this.fertilizers[fertilizerType] && this.fertilizers[fertilizerType] >= count) {
            this.fertilizers[fertilizerType] -= count;
            return true;
        }
        return false;
    }

    hasFertilizer(fertilizerType) {
        return this.getFertilizerCount(fertilizerType) > 0;
    }

    getAvailableFertilizers() {
        const available = [];
        const FertilizerConfig = window.FertilizerConfig || {};
        
        for (const [type, count] of Object.entries(this.fertilizers)) {
            if (count > 0) {
                const fertilizer = FertilizerConfig.getFertilizer ? 
                    FertilizerConfig.getFertilizer(type) : FertilizerConfig[type];
                if (fertilizer) {
                    available.push({
                        type,
                        count,
                        ...fertilizer
                    });
                }
            }
        }
        return available;
    }

    setMarketPrice(plantType, price) {
        this.marketPrices[plantType] = price;
    }

    getMarketPrice(plantType, basePrice) {
        return this.marketPrices[plantType] || basePrice;
    }

    getAllMarketPrices() {
        return { ...this.marketPrices };
    }

    getSanity() {
        return this.state.sanity;
    }

    addSanity(amount) {
        const oldValue = this.state.sanity;
        this.state.sanity = Math.max(0, Math.min(100, this.state.sanity + amount));
        return { success: true, oldValue, newValue: this.state.sanity };
    }

    subtractSanity(amount) {
        const oldValue = this.state.sanity;
        this.state.sanity = Math.max(0, this.state.sanity - amount);
        return { success: true, oldValue, newValue: this.state.sanity };
    }

    getPollution() {
        return this.state.pollution;
    }

    addPollution(amount) {
        const oldValue = this.state.pollution;
        this.state.pollution = Math.min(200, this.state.pollution + amount);
        return { success: true, oldValue, newValue: this.state.pollution };
    }

    subtractPollution(amount) {
        const oldValue = this.state.pollution;
        this.state.pollution = Math.max(0, this.state.pollution - amount);
        return { success: true, oldValue, newValue: this.state.pollution };
    }

    getCaptureToolCount(toolType) {
        return this.captureTools[toolType] || 0;
    }

    addCaptureTool(toolType, count = 1) {
        if (!this.canAddToInventory(toolType, 'captureTools', count)) {
            return { success: false, reason: '背包已满' };
        }
        if (!this.captureTools[toolType]) {
            this.captureTools[toolType] = 0;
        }
        this.captureTools[toolType] += count;
        return { success: true, count: this.captureTools[toolType] };
    }

    removeCaptureTool(toolType, count = 1) {
        if (this.captureTools[toolType] && this.captureTools[toolType] >= count) {
            this.captureTools[toolType] -= count;
            return true;
        }
        return false;
    }

    hasCaptureTool(toolType) {
        return this.getCaptureToolCount(toolType) > 0;
    }

    getAvailableCaptureTools() {
        const available = [];
        const AnimalConfig = window.AnimalConfig || {};
        
        for (const [type, count] of Object.entries(this.captureTools)) {
            if (count > 0) {
                const tool = AnimalConfig.getCaptureTool ? 
                    AnimalConfig.getCaptureTool(type) : AnimalConfig._captureTools[type];
                if (tool) {
                    available.push({
                        type,
                        count,
                        ...tool
                    });
                }
            }
        }
        return available;
    }

    getAnimalProductCount(productType, fromWarehouse = false) {
        if (fromWarehouse) {
            return this.warehouse.animalProducts[productType] || 0;
        }
        return this.inventory.animalProducts[productType] || 0;
    }

    addAnimalProduct(productType, count = 1) {
        if (!this.canAddToInventory(productType, 'animalProducts', count)) {
            return { success: false, reason: '背包已满' };
        }
        if (!this.inventory.animalProducts[productType]) {
            this.inventory.animalProducts[productType] = 0;
        }
        this.inventory.animalProducts[productType] += count;
        return { success: true, count: this.inventory.animalProducts[productType] };
    }

    addWarehouseAnimalProduct(productType, count = 1) {
        if (!this.canAddToWarehouse(productType, 'animalProducts', count)) {
            return { success: false, reason: '仓库已满' };
        }
        if (!this.warehouse.animalProducts[productType]) {
            this.warehouse.animalProducts[productType] = 0;
        }
        this.warehouse.animalProducts[productType] += count;
        return { success: true, count: this.warehouse.animalProducts[productType] };
    }

    removeAnimalProduct(productType, count = 1, fromWarehouse = false) {
        const source = fromWarehouse ? this.warehouse.animalProducts : this.inventory.animalProducts;
        if (source[productType] && source[productType] >= count) {
            source[productType] -= count;
            return true;
        }
        return false;
    }

    hasAnimalProduct(productType) {
        return this.getAnimalProductCount(productType) > 0 || this.getAnimalProductCount(productType, true) > 0;
    }

    getBarnLevel() {
        return this.livestock.barnLevel;
    }

    upgradeBarn() {
        const AnimalConfig = window.AnimalConfig || {};
        const currentLevel = this.livestock.barnLevel;
        const nextLevel = currentLevel + 1;
        const upgradeData = AnimalConfig.getBarnUpgrade ? 
            AnimalConfig.getBarnUpgrade(nextLevel) : AnimalConfig._barnUpgrades[nextLevel];
        
        if (!upgradeData) {
            return { success: false, reason: '畜栏已达到最高等级' };
        }

        if (!this.hasEnoughMoney(upgradeData.upgradeCost)) {
            return { success: false, reason: `资金不足，需要 ${upgradeData.upgradeCost} 金币` };
        }

        this.subtractMoney(upgradeData.upgradeCost);
        this.livestock.barnLevel = nextLevel;
        return { success: true, newLevel: nextLevel };
    }

    getBarnCapacity() {
        const AnimalConfig = window.AnimalConfig || {};
        const upgradeData = AnimalConfig.getBarnUpgrade ? 
            AnimalConfig.getBarnUpgrade(this.livestock.barnLevel) : 
            AnimalConfig._barnUpgrades[this.livestock.barnLevel];
        return upgradeData ? upgradeData.capacity : 1;
    }

    getAnimals() {
        return [...this.livestock.animals];
    }

    getAnimalCount() {
        return this.livestock.animals.length;
    }

    canAddAnimal() {
        return this.getAnimalCount() < this.getBarnCapacity();
    }

    addAnimal(animalId, domesticatedId, initialProduceDelay = 3 * 24 * 60) {
        if (!this.canAddAnimal()) {
            return { success: false, reason: '畜栏已满，请先升级畜栏' };
        }

        const AnimalConfig = window.AnimalConfig || {};
        const animalData = AnimalConfig.getDomesticAnimal ? 
            AnimalConfig.getDomesticAnimal(domesticatedId) : 
            (AnimalConfig._domesticAnimals[domesticatedId] || AnimalConfig._tabooAnimals[domesticatedId]);

        if (!animalData) {
            return { success: false, reason: '动物数据无效' };
        }

        const newAnimal = {
            id: `animal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: domesticatedId,
            wildType: animalId,
            age: 0,
            produceTimer: -initialProduceDelay,
            hungry: false,
            sick: false,
            acquiredAt: Date.now()
        };

        this.livestock.animals.push(newAnimal);
        return { success: true, animal: newAnimal };
    }

    removeAnimal(animalId) {
        const index = this.livestock.animals.findIndex(a => a.id === animalId);
        if (index > -1) {
            this.livestock.animals.splice(index, 1);
            return true;
        }
        return false;
    }

    getAnimal(animalId) {
        return this.livestock.animals.find(a => a.id === animalId);
    }

    addDialogLog(message, type = 'info', timestamp = null) {
        const logEntry = {
            message,
            type,
            timestamp: timestamp || new Date().toISOString()
        };

        this.dialogLog.unshift(logEntry);

        if (this.dialogLog.length > this.config.maxDialogLog) {
            this.dialogLog = this.dialogLog.slice(0, this.config.maxDialogLog);
        }

        return logEntry;
    }

    getDialogLog(count = 50) {
        return this.dialogLog.slice(0, count);
    }

    clearDialogLog() {
        this.dialogLog = [];
    }

    getFullState() {
        return {
            state: { ...this.state },
            inventory: JSON.parse(JSON.stringify(this.inventory)),
            warehouse: JSON.parse(JSON.stringify(this.warehouse)),
            fertilizers: { ...this.fertilizers },
            captureTools: { ...this.captureTools },
            livestock: JSON.parse(JSON.stringify(this.livestock)),
            dialogLog: JSON.parse(JSON.stringify(this.dialogLog)),
            marketPrices: { ...this.marketPrices }
        };
    }

    loadState(savedData) {
        if (savedData.state) {
            this.state = { ...this.state, ...savedData.state };
        }
        if (savedData.inventory) {
            this.inventory = JSON.parse(JSON.stringify(savedData.inventory));
        }
        if (savedData.warehouse) {
            this.warehouse = JSON.parse(JSON.stringify(savedData.warehouse));
        }
        if (savedData.fertilizers) {
            this.fertilizers = { ...this.fertilizers, ...savedData.fertilizers };
        }
        if (savedData.captureTools) {
            this.captureTools = { ...this.captureTools, ...savedData.captureTools };
        }
        if (savedData.livestock) {
            this.livestock = JSON.parse(JSON.stringify(savedData.livestock));
        }
        if (savedData.dialogLog) {
            this.dialogLog = JSON.parse(JSON.stringify(savedData.dialogLog));
        }
        if (savedData.marketPrices) {
            this.marketPrices = { ...this.marketPrices, ...savedData.marketPrices };
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
