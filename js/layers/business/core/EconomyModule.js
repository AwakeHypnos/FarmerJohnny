class EconomyModule {
    constructor(eventBus, gameState, timeModule) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        this.timeModule = timeModule;

        this.config = {
            marketDailyCrops: 6,
            minInSeasonCrops: 4,
            maxPriceMultiplier: 5,
            supplyThreshold: 5,
            priceDecreasePerSupply: 0.1,
            maxPriceDecrease: 0.5
        };

        this.marketState = {
            dailyCrops: [],
            supplyData: {}
        };

        this.setupListeners();
    }

    setupListeners() {
        this.eventBus.on('time:seasonChanged', () => {
            this.refreshDailyMarket();
        });

        this.eventBus.on('time:newDay', () => {
            this.refreshDailyMarket();
        });
    }

    init() {
        this.refreshDailyMarket();
    }

    getMoney() {
        return this.gameState.getMoney();
    }

    getRandomPriceMultiplier() {
        const random = Math.random();
        let multiplier;

        if (random < 0.4) {
            multiplier = 0.8 + Math.random() * 0.4;
        } else if (random < 0.7) {
            multiplier = 0.6 + Math.random() * 0.8;
        } else if (random < 0.85) {
            multiplier = 0.5 + Math.random() * 1.5;
        } else if (random < 0.95) {
            multiplier = 0.5 + Math.random() * 3;
        } else {
            multiplier = 0.5 + Math.random() * 4;
        }

        return Math.max(0.5, Math.min(this.config.maxPriceMultiplier, multiplier));
    }

    refreshDailyMarket() {
        const PlantConfig = window.PlantConfig || {};
        const currentSeason = this.timeModule.getSeason();

        const allPlants = PlantConfig.getAllPlants ? PlantConfig.getAllPlants() : PlantConfig;
        const allPlantList = [];
        const inSeasonPlants = [];

        for (const [plantType, plantData] of Object.entries(allPlants)) {
            if (typeof plantData === 'object' && plantData.sellPrice) {
                allPlantList.push({ id: plantType, ...plantData });
                
                if (plantData.seasons && plantData.seasons.includes(currentSeason)) {
                    inSeasonPlants.push({ id: plantType, ...plantData });
                }
            }
        }

        const selectedCrops = [];
        const usedIds = new Set();

        const inSeasonCount = Math.min(this.config.minInSeasonCrops, inSeasonPlants.length);
        const shuffledInSeason = [...inSeasonPlants].sort(() => Math.random() - 0.5);
        for (let i = 0; i < inSeasonCount && i < shuffledInSeason.length; i++) {
            selectedCrops.push(shuffledInSeason[i]);
            usedIds.add(shuffledInSeason[i].id);
        }

        const remaining = this.config.marketDailyCrops - selectedCrops.length;
        const availablePlants = allPlantList.filter(p => !usedIds.has(p.id));
        const shuffledRemaining = [...availablePlants].sort(() => Math.random() - 0.5);
        for (let i = 0; i < remaining && i < shuffledRemaining.length; i++) {
            selectedCrops.push(shuffledRemaining[i]);
        }

        this.marketState.dailyCrops = [];

        selectedCrops.forEach(plant => {
            const basePrice = plant.sellPrice;
            const randomMultiplier = this.getRandomPriceMultiplier();
            
            let supplyMultiplier = 1;
            const supplyCount = this.marketState.supplyData[plant.id] || 0;
            if (supplyCount >= this.config.supplyThreshold) {
                const excessSupply = supplyCount - this.config.supplyThreshold;
                const decrease = Math.min(excessSupply * this.config.priceDecreasePerSupply, this.config.maxPriceDecrease);
                supplyMultiplier = 1 - decrease;
            }

            const finalMultiplier = Math.max(0.5, randomMultiplier * supplyMultiplier);
            const finalPrice = Math.max(1, Math.floor(basePrice * finalMultiplier));

            this.gameState.setMarketPrice(plant.id, finalPrice);
            this.marketState.dailyCrops.push({
                plantType: plant.id,
                plantName: plant.name,
                basePrice: basePrice,
                currentPrice: finalPrice,
                multiplier: finalMultiplier,
                supplyCount: supplyCount
            });
        });

        for (const plantId in this.marketState.supplyData) {
            this.marketState.supplyData[plantId] = Math.max(0, this.marketState.supplyData[plantId] - 1);
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

    getDailyMarketCrops() {
        return [...this.marketState.dailyCrops];
    }

    getAllMarketPrices() {
        const PlantConfig = window.PlantConfig || {};
        const prices = [];

        const dailyCrops = this.getDailyMarketCrops();
        
        dailyCrops.forEach(crop => {
            const hasCropInventory = this.gameState.getCropCount(crop.plantType, false) > 0;
            const hasCropWarehouse = this.gameState.getCropCount(crop.plantType, true) > 0;
            const cropCountInventory = this.gameState.getCropCount(crop.plantType, false);
            const cropCountWarehouse = this.gameState.getCropCount(crop.plantType, true);

            prices.push({
                plantType: crop.plantType,
                plantName: crop.plantName,
                basePrice: crop.basePrice,
                currentPrice: crop.currentPrice,
                hasCrop: hasCropInventory || hasCropWarehouse,
                cropCount: cropCountInventory,
                cropCountWarehouse: cropCountWarehouse,
                multiplier: crop.multiplier,
                supplyCount: crop.supplyCount
            });
        });

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
        const result = this.gameState.addSeed(seedType);

        if (!result.success) {
            this.gameState.addMoney(price);
            return { success: false, reason: result.reason };
        }

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
        const result = this.gameState.addFertilizer(fertilizerType);

        if (!result.success) {
            this.gameState.addMoney(price);
            return { success: false, reason: result.reason };
        }

        this.eventBus.emit('economy:fertilizerBought', {
            fertilizerType,
            fertilizerName: fertilizer.name,
            price
        });
        this.eventBus.emit('economy:moneyChanged', this.getMoney());

        return { success: true };
    }

    buyCrop(cropType) {
        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? 
            PlantConfig.getPlant(cropType) : PlantConfig[cropType];

        if (!plantData) {
            return { success: false, reason: '作物不存在' };
        }

        const price = plantData.buyPrice || Math.floor(plantData.sellPrice * 1.5);

        if (!this.gameState.hasEnoughMoney(price)) {
            this.eventBus.emit('economy:notEnoughMoney');
            return { success: false, reason: '资金不足' };
        }

        this.gameState.subtractMoney(price);
        const result = this.gameState.addCrop(cropType);

        if (!result.success) {
            this.gameState.addMoney(price);
            return { success: false, reason: result.reason };
        }

        this.eventBus.emit('economy:cropBought', {
            cropType,
            cropName: plantData.name,
            price
        });
        this.eventBus.emit('economy:moneyChanged', this.getMoney());

        return { success: true };
    }

    buyTrap(trapType) {
        const AnimalConfig = window.AnimalConfig || {};
        const trap = AnimalConfig.getCaptureTool ? 
            AnimalConfig.getCaptureTool(trapType) : 
            (AnimalConfig._captureTools ? AnimalConfig._captureTools[trapType] : null);

        if (!trap) {
            return { success: false, reason: '陷阱不存在' };
        }

        const price = trap.buyPrice;

        if (!this.gameState.hasEnoughMoney(price)) {
            this.eventBus.emit('economy:notEnoughMoney');
            return { success: false, reason: '资金不足' };
        }

        this.gameState.subtractMoney(price);
        this.gameState.addCaptureTool(trapType);

        this.eventBus.emit('economy:trapBought', {
            trapType,
            trapName: trap.name,
            price
        });
        this.eventBus.emit('economy:moneyChanged', this.getMoney());

        return { success: true };
    }

    getAllAvailableTrapsForSale() {
        const AnimalConfig = window.AnimalConfig || {};
        const traps = AnimalConfig.getAllCaptureTools ? 
            AnimalConfig.getAllCaptureTools() : 
            (AnimalConfig._captureTools ? Object.values(AnimalConfig._captureTools) : []);

        return traps;
    }

    getAllAvailableCropsForSale() {
        const PlantConfig = window.PlantConfig || {};
        const crops = [];

        const allPlants = PlantConfig.getAllPlants ? PlantConfig.getAllPlants() : PlantConfig;
        
        for (const [plantType, plantData] of Object.entries(allPlants)) {
            if (typeof plantData === 'object' && plantData.sellPrice && !plantData.isTaboo) {
                crops.push({ 
                    id: plantType, 
                    ...plantData,
                    buyPrice: plantData.buyPrice || Math.floor(plantData.sellPrice * 1.5)
                });
            }
        }

        return crops;
    }

    sellCrop(cropType, fromWarehouse = true) {
        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? 
            PlantConfig.getPlant(cropType) : PlantConfig[cropType];

        if (!plantData) {
            return { success: false, reason: '作物不存在' };
        }

        const hasCropInventory = this.gameState.getCropCount(cropType, false) > 0;
        const hasCropWarehouse = this.gameState.getCropCount(cropType, true) > 0;

        if (!hasCropInventory && !hasCropWarehouse) {
            return { success: false, reason: '没有该作物可出售' };
        }

        const useWarehouse = fromWarehouse && hasCropWarehouse;
        const price = this.gameState.getMarketPrice(cropType, plantData.sellPrice);

        const removeResult = this.gameState.removeCrop(cropType, 1, useWarehouse);
        if (!removeResult) {
            return { success: false, reason: '作物数量不足' };
        }

        this.gameState.addMoney(price);

        if (!this.marketState.supplyData[cropType]) {
            this.marketState.supplyData[cropType] = 0;
        }
        this.marketState.supplyData[cropType]++;

        this.eventBus.emit('economy:cropSold', {
            cropType,
            cropName: plantData.name,
            price,
            fromWarehouse: useWarehouse
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

        if (!this.gameState.canAddToWarehouse(itemType, category)) {
            return { success: false, reason: '仓库已满' };
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

        if (!this.gameState.canAddToInventory(itemType, category)) {
            return { success: false, reason: '背包已满' };
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
            fertilizers: this.gameState.getAvailableFertilizers(),
            captureTools: this.gameState.getAvailableCaptureTools()
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
