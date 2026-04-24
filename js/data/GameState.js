class GameState {
    constructor() {
        this.state = {
            isPlaying: false,
            money: 1000
        };

        this.inventory = {
            seeds: {},
            crops: {},
            items: {}
        };

        this.warehouse = {
            seeds: {},
            crops: {},
            items: {}
        };

        this.fertilizers = {};

        this.marketPrices = {};
    }

    init() {
        this.state = {
            isPlaying: true,
            money: 1000
        };

        this.inventory = {
            seeds: {},
            crops: {},
            items: {}
        };

        this.warehouse = {
            seeds: {},
            crops: {},
            items: {}
        };

        this.fertilizers = {
            basic_fertilizer: 0,
            premium_fertilizer: 0,
            ancient_fertilizer: 0
        };

        this.marketPrices = {};
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

    getSeedCount(seedType) {
        return this.inventory.seeds[seedType] || 0;
    }

    addSeed(seedType, count = 1) {
        if (!this.inventory.seeds[seedType]) {
            this.inventory.seeds[seedType] = 0;
        }
        this.inventory.seeds[seedType] += count;
        return this.inventory.seeds[seedType];
    }

    removeSeed(seedType, count = 1) {
        if (this.inventory.seeds[seedType] && this.inventory.seeds[seedType] >= count) {
            this.inventory.seeds[seedType] -= count;
            return true;
        }
        return false;
    }

    hasSeed(seedType) {
        return this.getSeedCount(seedType) > 0;
    }

    getCropCount(cropType) {
        return this.inventory.crops[cropType] || 0;
    }

    addCrop(cropType, count = 1) {
        if (!this.inventory.crops[cropType]) {
            this.inventory.crops[cropType] = 0;
        }
        this.inventory.crops[cropType] += count;
        return this.inventory.crops[cropType];
    }

    removeCrop(cropType, count = 1) {
        if (this.inventory.crops[cropType] && this.inventory.crops[cropType] >= count) {
            this.inventory.crops[cropType] -= count;
            return true;
        }
        return false;
    }

    hasCrop(cropType) {
        return this.getCropCount(cropType) > 0;
    }

    getFertilizerCount(fertilizerType) {
        return this.fertilizers[fertilizerType] || 0;
    }

    addFertilizer(fertilizerType, count = 1) {
        if (!this.fertilizers[fertilizerType]) {
            this.fertilizers[fertilizerType] = 0;
        }
        this.fertilizers[fertilizerType] += count;
        return this.fertilizers[fertilizerType];
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

    getFullState() {
        return {
            state: { ...this.state },
            inventory: JSON.parse(JSON.stringify(this.inventory)),
            warehouse: JSON.parse(JSON.stringify(this.warehouse)),
            fertilizers: { ...this.fertilizers },
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
        if (savedData.marketPrices) {
            this.marketPrices = { ...this.marketPrices, ...savedData.marketPrices };
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
