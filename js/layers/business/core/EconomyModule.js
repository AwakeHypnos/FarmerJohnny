class EconomyModule {
    constructor(eventBus, gameState, timeModule) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        this.timeModule = timeModule;

        this.setupListeners();
    }

    setupListeners() {
        this.eventBus.on('time:seasonChanged', () => {
            this.updateMarketPrices();
        });
    }

    init() {
        this.updateMarketPrices();
    }

    getMoney() {
        return this.gameState.getMoney();
    }

    updateMarketPrices() {
        const PlantConfig = window.PlantConfig || {};
        const fluctuation = 0.2;

        for (const [plantType, plantData] of Object.entries(PlantConfig)) {
            if (typeof plantData === 'object' && plantData.sellPrice) {
                const basePrice = plantData.sellPrice;
                const randomFactor = 1 + (Math.random() * fluctuation * 2 - fluctuation);
                const newPrice = Math.floor(basePrice * randomFactor);
                this.gameState.setMarketPrice(plantType, newPrice);
            }
        }

        this.eventBus.emit('economy:marketPricesUpdated');
    }

    getMarketPrice(plantType) {
        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? 
            PlantConfig.getPlant(plantType) : PlantConfig[plantType];
        
        if (!plantData) return null;

        return {
            basePrice: plantData.sellPrice,
            currentPrice: this.gameState.getMarketPrice(plantType, plantData.sellPrice)
        };
    }

    getAllMarketPrices() {
        const PlantConfig = window.PlantConfig || {};
        const prices = [];

        for (const [plantType, plantData] of Object.entries(PlantConfig)) {
            if (typeof plantData === 'object' && plantData.sellPrice) {
                const priceData = this.getMarketPrice(plantType);
                if (priceData) {
                    prices.push({
                        plantType,
                        plantName: plantData.name,
                        basePrice: priceData.basePrice,
                        currentPrice: priceData.currentPrice,
                        hasCrop: this.gameState.hasCrop(plantType),
                        cropCount: this.gameState.getCropCount(plantType)
                    });
                }
            }
        }

        return prices;
    }

    buySeed(seedType) {
        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? 
            PlantConfig.getPlant(seedType) : PlantConfig[seedType];

        if (!plantData) {
            return { success: false, reason: '种子不存在' };
        }

        const price = plantData.buyPrice;

        if (!this.gameState.hasEnoughMoney(price)) {
            this.eventBus.emit('economy:notEnoughMoney');
            return { success: false, reason: '资金不足' };
        }

        this.gameState.subtractMoney(price);
        this.gameState.addSeed(seedType);

        this.eventBus.emit('economy:seedBought', {
            seedType,
            seedName: plantData.name,
            price
        });
        this.eventBus.emit('economy:moneyChanged', this.getMoney());

        return { success: true };
    }

    buyFertilizer(fertilizerType) {
        const FertilizerConfig = window.FertilizerConfig || {};
        const fertilizer = FertilizerConfig.getFertilizer ? 
            FertilizerConfig.getFertilizer(fertilizerType) : FertilizerConfig[fertilizerType];

        if (!fertilizer) {
            return { success: false, reason: '肥料不存在' };
        }

        const price = fertilizer.buyPrice;

        if (!this.gameState.hasEnoughMoney(price)) {
            this.eventBus.emit('economy:notEnoughMoney');
            return { success: false, reason: '资金不足' };
        }

        this.gameState.subtractMoney(price);
        this.gameState.addFertilizer(fertilizerType);

        this.eventBus.emit('economy:fertilizerBought', {
            fertilizerType,
            fertilizerName: fertilizer.name,
            price
        });
        this.eventBus.emit('economy:moneyChanged', this.getMoney());

        return { success: true };
    }

    sellCrop(cropType) {
        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? 
            PlantConfig.getPlant(cropType) : PlantConfig[cropType];

        if (!plantData) {
            return { success: false, reason: '作物不存在' };
        }

        if (!this.gameState.hasCrop(cropType)) {
            return { success: false, reason: '背包中没有该作物' };
        }

        const price = this.gameState.getMarketPrice(cropType, plantData.sellPrice);

        this.gameState.removeCrop(cropType);
        this.gameState.addMoney(price);

        this.eventBus.emit('economy:cropSold', {
            cropType,
            cropName: plantData.name,
            price
        });
        this.eventBus.emit('economy:moneyChanged', this.getMoney());

        return { success: true, price };
    }

    getAvailableSeedsForSeason(season) {
        const PlantConfig = window.PlantConfig || {};
        
        if (PlantConfig.getPlantsBySeason) {
            return PlantConfig.getPlantsBySeason(season);
        }

        const seeds = [];
        for (const [id, plant] of Object.entries(PlantConfig)) {
            if (typeof plant === 'object' && plant.seasons && plant.seasons.includes(season)) {
                seeds.push({ id, ...plant });
            }
        }
        return seeds;
    }

    getAvailableSeedsForCurrentSeason() {
        const currentSeason = this.timeModule.getSeason();
        return this.getAvailableSeedsForSeason(currentSeason);
    }

    getAllFertilizers() {
        const FertilizerConfig = window.FertilizerConfig || {};
        if (FertilizerConfig.getAllFertilizers) {
            return FertilizerConfig.getAllFertilizers();
        }

        const fertilizers = [];
        for (const [id, fertilizer] of Object.entries(FertilizerConfig)) {
            if (typeof fertilizer === 'object' && fertilizer.id) {
                fertilizers.push({ id, ...fertilizer });
            }
        }
        return fertilizers;
    }

    moveToWarehouse(itemType, category) {
        const source = this.gameState.inventory[category];
        const target = this.gameState.warehouse[category];

        if (!source[itemType] || source[itemType] <= 0) {
            return { success: false, reason: '背包中没有该物品' };
        }

        source[itemType]--;
        if (!target[itemType]) {
            target[itemType] = 0;
        }
        target[itemType]++;

        this.eventBus.emit('economy:movedToWarehouse', {
            itemType,
            category
        });

        return { success: true };
    }

    moveFromWarehouse(itemType, category) {
        const source = this.gameState.warehouse[category];
        const target = this.gameState.inventory[category];

        if (!source[itemType] || source[itemType] <= 0) {
            return { success: false, reason: '仓库中没有该物品' };
        }

        source[itemType]--;
        if (!target[itemType]) {
            target[itemType] = 0;
        }
        target[itemType]++;

        this.eventBus.emit('economy:movedFromWarehouse', {
            itemType,
            category
        });

        return { success: true };
    }

    getWarehouseItems() {
        const PlantConfig = window.PlantConfig || {};
        const items = [];

        for (const category in this.gameState.warehouse) {
            for (const [itemType, count] of Object.entries(this.gameState.warehouse[category])) {
                if (count > 0) {
                    const plantData = PlantConfig.getPlant ? 
                        PlantConfig.getPlant(itemType) : PlantConfig[itemType];
                    
                    items.push({
                        itemType,
                        category,
                        count,
                        name: plantData ? plantData.name : itemType,
                        description: plantData ? plantData.description : ''
                    });
                }
            }
        }

        return items;
    }

    getInventorySummary() {
        const PlantConfig = window.PlantConfig || {};
        
        return {
            seeds: this._getInventoryItems(this.gameState.inventory.seeds, PlantConfig),
            crops: this._getInventoryItems(this.gameState.inventory.crops, PlantConfig),
            fertilizers: this.gameState.getAvailableFertilizers()
        };
    }

    _getInventoryItems(items, config) {
        const result = [];
        for (const [itemType, count] of Object.entries(items)) {
            if (count > 0) {
                const itemData = config.getPlant ? config.getPlant(itemType) : config[itemType];
                result.push({
                    type: itemType,
                    count,
                    name: itemData ? itemData.name : itemType,
                    description: itemData ? itemData.description : '',
                    seasons: itemData ? itemData.seasons : [],
                    sellPrice: itemData ? itemData.sellPrice : 0,
                    buyPrice: itemData ? itemData.buyPrice : 0
                });
            }
        }
        return result;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EconomyModule;
}
