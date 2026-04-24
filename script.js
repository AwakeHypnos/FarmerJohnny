// 游戏核心逻辑
class FarmerJohnnyGame {
    constructor() {
        // 游戏状态
        this.gameState = {
            isPlaying: false,
            money: 1000,
            day: 1,
            hour: 6,
            minute: 0,
            season: 'spring',
            seasons: ['spring', 'summer', 'autumn', 'winter'],
            seasonNames: {
                'spring': '春',
                'summer': '夏',
                'autumn': '秋',
                'winter': '冬'
            }
        };
        
        // 时间系统配置
        this.timeConfig = {
            realMinutesPerGameDay: 5,
            gameHoursPerDay: 24,
            gameMinutesPerHour: 60,
            updateInterval: 100
        };
        
        // 田地数据
        this.fields = [];
        this.totalFields = 9;
        this.unlockedFields = 1;
        
        // 植物数据 - 调整成熟时间确保一个季节（7天）至少成熟2次，最多7次
        // 最快：约1天成熟（7天可成熟7次）
        // 最慢：约3.5天成熟（7天可成熟2次）
        this.plants = {
            'cthulhu_seedling': {
                name: '克苏鲁幼苗',
                stages: ['种', '芽', '苗', '株', '克苏鲁幼苗'],
                growthDays: 2.5,
                seasons: ['spring', 'summer'],
                sellPrice: 50,
                buyPrice: 20,
                description: '神秘的幼苗，据说与古老者有关'
            },
            'deep_onion': {
                name: '深渊洋葱',
                stages: ['种', '芽', '苗', '深渊洋葱'],
                growthDays: 2,
                seasons: ['spring', 'autumn'],
                sellPrice: 40,
                buyPrice: 15,
                description: '来自深渊的洋葱，味道奇特'
            },
            'nightshade_berry': {
                name: '夜影浆果',
                stages: ['种', '芽', '花', '夜影浆果'],
                growthDays: 3,
                seasons: ['summer', 'autumn'],
                sellPrice: 70,
                buyPrice: 30,
                description: '只在夜间生长的神秘浆果'
            },
            'frost_mushroom': {
                name: '寒霜蘑菇',
                stages: ['种', '丝', '伞', '寒霜蘑菇'],
                growthDays: 1.5,
                seasons: ['autumn', 'winter'],
                sellPrice: 80,
                buyPrice: 35,
                description: '在寒冷中生长的奇异蘑菇'
            },
            'void_wheat': {
                name: '虚空小麦',
                stages: ['种', '芽', '苗', '穗', '虚空小麦'],
                growthDays: 3.5,
                seasons: ['spring', 'summer', 'autumn'],
                sellPrice: 60,
                buyPrice: 25,
                description: '来自虚空的小麦，颗粒饱满'
            },
            'dark_pumpkin': {
                name: '黑暗南瓜',
                stages: ['种', '芽', '藤', '花', '黑暗南瓜'],
                growthDays: 1,
                seasons: ['autumn'],
                sellPrice: 100,
                buyPrice: 40,
                description: '万圣节特供，散发着神秘气息'
            }
        };
        
        // 肥料数据
        this.fertilizers = {
            'basic_fertilizer': {
                name: '基础肥料',
                description: '加速植物生长百分之十',
                buyPrice: 10,
                growthBoost: 0.1
            },
            'premium_fertilizer': {
                name: '高级肥料',
                description: '加速植物生长百分之二十五',
                buyPrice: 30,
                growthBoost: 0.25
            },
            'ancient_fertilizer': {
                name: '古老肥料',
                description: '加速植物生长百分之五十',
                buyPrice: 80,
                growthBoost: 0.5
            }
        };
        
        // 背包数据 - 放种子和道具，堆叠上限30
        this.backpack = {
            seeds: {},
            items: {}
        };
        this.backpackMaxStack = 30;
        
        // 仓库数据 - 放作物，堆叠上限50
        this.warehouse = {
            crops: {}
        };
        this.warehouseMaxStack = 50;
        
        // 动态市场系统
        this.market = {
            dailyCrops: [],
            prices: {},
            basePrices: {},
            sellHistory: {},
            priceIndex: {}
        };
        
        // 时间循环定时器
        this.timeLoop = null;
        
        // 选中的种子（用于种植）
        this.selectedSeed = null;
        
        // 初始化DOM元素
        this.initDOMElements();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化市场
        this.initMarket();
    }
    
    // ========== 田块解锁系统 ==========
    
    // 计算解锁价格：y = x^(3/2) * 基础价格系数
    calculateUnlockPrice(unlockedCount) {
        const basePrice = 100;
        const price = Math.pow(unlockedCount, 1.5) * basePrice;
        return Math.round(price);
    }
    
    // 获取下一个待解锁的田地ID
    getNextUnlockableField() {
        for (let i = 0; i < this.totalFields; i++) {
            if (!this.fields[i].unlocked) {
                return i;
            }
        }
        return -1;
    }
    
    // 解锁田地
    unlockField(fieldId) {
        const field = this.fields[fieldId];
        if (field.unlocked) {
            this.showInfo('这块田地已经解锁了。');
            return false;
        }
        
        // 检查是否是下一个待解锁的
        const nextField = this.getNextUnlockableField();
        if (fieldId !== nextField) {
            this.showInfo('请按顺序解锁田地。');
            return false;
        }
        
        const price = this.calculateUnlockPrice(this.unlockedFields);
        
        if (this.gameState.money < price) {
            this.showInfo(`资金不足！解锁需要 ${price} 金币。`);
            return false;
        }
        
        // 扣除资金
        this.gameState.money -= price;
        
        // 解锁田地
        field.unlocked = true;
        this.unlockedFields++;
        
        this.showInfo(`成功解锁了新田地！花费 ${price} 金币。`);
        this.updateMoneyDisplay();
        this.renderFields();
        
        return true;
    }
    
    // ========== 资源循环系统 ==========
    
    // 初始化田地
    initFields() {
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
        this.renderFields();
    }
    
    // 重置每日田地状态 - 每天06:00刷新
    resetDailyFieldStates() {
        this.fields.forEach(field => {
            if (field.unlocked) {
                // 浇水状态每天06:00刷新
                field.watered = false;
                // 施肥效果持续到收获
            }
        });
        this.renderFields();
    }
    
    // 更新植物生长
    updatePlantGrowth(gameMinutes) {
        let needsRender = false;
        
        this.fields.forEach(field => {
            if (field.plant) {
                const plantData = this.plants[field.plant];
                
                // 计算生长速度
                let growthRate = 1;
                
                // 未浇水时生长速度为0.5倍
                if (!field.watered) {
                    growthRate *= 0.5;
                }
                
                // 施肥加成
                if (field.fertilized && field.fertilizerType) {
                    const fertilizer = this.fertilizers[field.fertilizerType];
                    if (fertilizer) {
                        growthRate += fertilizer.growthBoost;
                    }
                }
                
                // 计算总生长时间（分钟）
                const totalGrowthMinutes = plantData.growthDays * 24 * 60;
                const growthPerMinute = 1 / totalGrowthMinutes;
                
                // 增加生长进度
                const growthIncrement = growthPerMinute * gameMinutes * growthRate;
                field.growthProgress += growthIncrement;
                
                // 检查阶段升级
                const totalStages = plantData.stages.length;
                const progressPerStage = 1 / (totalStages - 1);
                
                const newStage = Math.min(
                    Math.floor(field.growthProgress / progressPerStage),
                    totalStages - 1
                );
                
                if (newStage > field.stage) {
                    field.stage = newStage;
                    needsRender = true;
                    
                    // 如果成熟了，显示提示
                    if (field.stage >= totalStages - 1) {
                        this.showInfo(`${plantData.name}成熟了！可以采摘了。`);
                    }
                }
            }
        });
        
        if (needsRender) {
            this.renderFields();
        }
    }
    
    // 浇水
    waterField(fieldId) {
        const field = this.fields[fieldId];
        
        if (field.watered) {
            this.showInfo('这块田地已经浇过水了。');
            return;
        }
        
        field.watered = true;
        this.showInfo('浇水成功！');
        this.renderFields();
    }
    
    // 施肥
    applyFertilizer(fieldId, fertilizerType) {
        const field = this.fields[fieldId];
        const fertilizer = this.fertilizers[fertilizerType];
        
        if (field.fertilized) {
            this.showInfo('这块田地已经施过肥了。');
            return;
        }
        
        // 检查背包中的肥料数量
        if (!this.backpack.items.fertilizers) {
            this.backpack.items.fertilizers = {};
        }
        
        if (!this.backpack.items.fertilizers[fertilizerType] || this.backpack.items.fertilizers[fertilizerType] <= 0) {
            this.showInfo('没有足够的肥料。');
            return;
        }
        
        // 扣除肥料
        this.backpack.items.fertilizers[fertilizerType]--;
        
        field.fertilized = true;
        field.fertilizerType = fertilizerType;
        
        this.showInfo(`成功施用了${fertilizer.name}！`);
        this.renderFields();
    }
    
    // ========== 动态市场经济系统 ==========
    
    // 初始化市场
    initMarket() {
        // 初始化基础价格
        for (const [plantType, plantData] of Object.entries(this.plants)) {
            this.market.basePrices[plantType] = plantData.sellPrice;
            this.market.priceIndex[plantType] = 1.0;
            this.market.sellHistory[plantType] = 0;
        }
        
        // 刷新每日市场
        this.refreshDailyMarket();
    }
    
    // 刷新每日市场
    refreshDailyMarket() {
        // 1. 根据昨日销售情况调整价格指数
        this.adjustPriceIndexBySales();
        
        // 2. 随机选择今日收购的作物种类
        this.market.dailyCrops = this.selectDailyCrops();
        
        // 3. 生成今日价格（基于价格指数 + 随机波动）
        this.generateDailyPrices();
        
        // 4. 重置销售记录
        for (const plantType of Object.keys(this.market.sellHistory)) {
            this.market.sellHistory[plantType] = 0;
        }
    }
    
    // 选择今日收购的作物
    selectDailyCrops() {
        const allCrops = Object.keys(this.plants);
        const currentSeason = this.gameState.season;
        
        // 筛选当季作物和全季度作物
        const seasonalCrops = allCrops.filter(type => {
            const plant = this.plants[type];
            return plant.seasons.includes(currentSeason);
        });
        
        // 至少选择2种当季作物
        const selected = [];
        const shuffledSeasonal = [...seasonalCrops].sort(() => Math.random() - 0.5);
        
        // 选择2种当季作物
        for (let i = 0; i < Math.min(2, shuffledSeasonal.length); i++) {
            selected.push(shuffledSeasonal[i]);
        }
        
        // 随机选择额外的作物（总共3-5种）
        const remaining = allCrops.filter(type => !selected.includes(type));
        const extraCount = Math.floor(Math.random() * 3) + 1; // 1-3种额外
        
        const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(extraCount, shuffledRemaining.length); i++) {
            selected.push(shuffledRemaining[i]);
        }
        
        return selected;
    }
    
    // 根据销售情况调整价格指数
    adjustPriceIndexBySales() {
        for (const [plantType, sellCount] of Object.entries(this.market.sellHistory)) {
            if (sellCount > 0) {
                // 供大于求时，价格指数下降
                // 每卖出1个，价格指数下降2%，最低0.5
                const decrease = sellCount * 0.02;
                this.market.priceIndex[plantType] = Math.max(
                    0.5,
                    this.market.priceIndex[plantType] - decrease
                );
            } else {
                // 没有卖出时，价格指数缓慢回升
                this.market.priceIndex[plantType] = Math.min(
                    1.5,
                    this.market.priceIndex[plantType] + 0.05
                );
            }
        }
    }
    
    // 生成带权重的随机波动
    generateWeightedFluctuation() {
        // 生成0-500%的波动，但大幅波动概率更低
        const rand = Math.random();
        
        let fluctuation;
        if (rand < 0.5) {
            // 50%概率：-50% ~ +50%
            fluctuation = 1 + (Math.random() * 1 - 0.5);
        } else if (rand < 0.8) {
            // 30%概率：+50% ~ +150% 或 -50% ~ -150%
            const direction = Math.random() > 0.5 ? 1 : -1;
            fluctuation = 1 + direction * (0.5 + Math.random() * 1);
        } else if (rand < 0.95) {
            // 15%概率：+150% ~ +300% 或 -150% ~ -300%
            const direction = Math.random() > 0.5 ? 1 : -1;
            fluctuation = 1 + direction * (1.5 + Math.random() * 1.5);
        } else {
            // 5%概率：+300% ~ +500% 或 -300% ~ -500%
            const direction = Math.random() > 0.5 ? 1 : -1;
            fluctuation = 1 + direction * (3 + Math.random() * 2);
        }
        
        // 限制在0.5到6.0之间（原价的50%到500%）
        return Math.max(0.5, Math.min(6.0, fluctuation));
    }
    
    // 生成每日价格
    generateDailyPrices() {
        for (const plantType of Object.keys(this.plants)) {
            const basePrice = this.market.basePrices[plantType];
            const priceIndex = this.market.priceIndex[plantType];
            const fluctuation = this.generateWeightedFluctuation();
            
            // 最终价格 = 基础价格 × 价格指数 × 随机波动
            const finalPrice = Math.round(basePrice * priceIndex * fluctuation);
            
            this.market.prices[plantType] = finalPrice;
        }
    }
    
    // 出售作物
    sellCrop(cropType) {
        // 检查仓库中是否有该作物
        if (!this.warehouse.crops[cropType] || this.warehouse.crops[cropType] <= 0) {
            this.showInfo('仓库中没有该作物。');
            return;
        }
        
        // 检查市场是否今日收购该作物
        if (!this.market.dailyCrops.includes(cropType)) {
            this.showInfo('市场今日不收购该作物。');
            return;
        }
        
        const price = this.market.prices[cropType];
        
        // 扣除作物
        this.warehouse.crops[cropType]--;
        
        // 增加资金
        this.gameState.money += price;
        
        // 记录销售
        this.market.sellHistory[cropType]++;
        
        const plantData = this.plants[cropType];
        this.showInfo(`成功出售了${plantData.name}，获得${price}金币！`);
        
        this.updateMoneyDisplay();
        this.updateMarketContent();
    }
    
    // ========== 物品存储系统 ==========
    
    // 购买种子
    buySeed(seedType) {
        const plantData = this.plants[seedType];
        
        if (this.gameState.money < plantData.buyPrice) {
            this.showInfo('资金不足！');
            return;
        }
        
        // 检查背包容量
        const currentCount = this.backpack.seeds[seedType] || 0;
        if (currentCount >= this.backpackMaxStack) {
            this.showInfo(`背包中${plantData.name}种子已达堆叠上限（${this.backpackMaxStack}个）。`);
            return;
        }
        
        // 扣除资金
        this.gameState.money -= plantData.buyPrice;
        
        // 添加到背包
        if (!this.backpack.seeds[seedType]) {
            this.backpack.seeds[seedType] = 0;
        }
        this.backpack.seeds[seedType]++;
        
        this.showInfo(`成功购买了${plantData.name}种子！`);
        this.updateMoneyDisplay();
        this.updateMerchantContent('merchant-seeds');
    }
    
    // 购买肥料
    buyFertilizer(fertType) {
        const fertilizer = this.fertilizers[fertType];
        
        if (this.gameState.money < fertilizer.buyPrice) {
            this.showInfo('资金不足！');
            return;
        }
        
        // 检查背包容量
        if (!this.backpack.items.fertilizers) {
            this.backpack.items.fertilizers = {};
        }
        const currentCount = this.backpack.items.fertilizers[fertType] || 0;
        if (currentCount >= this.backpackMaxStack) {
            this.showInfo(`背包中${fertilizer.name}已达堆叠上限（${this.backpackMaxStack}个）。`);
            return;
        }
        
        // 扣除资金
        this.gameState.money -= fertilizer.buyPrice;
        
        // 添加到背包
        if (!this.backpack.items.fertilizers[fertType]) {
            this.backpack.items.fertilizers[fertType] = 0;
        }
        this.backpack.items.fertilizers[fertType]++;
        
        this.showInfo(`成功购买了${fertilizer.name}！`);
        this.updateMoneyDisplay();
        this.updateMerchantContent('merchant-fertilizer');
    }
    
    // 种植种子
    plantSeed(fieldId, seedType) {
        const field = this.fields[fieldId];
        const plantData = this.plants[seedType];
        
        // 检查季节
        if (!plantData.seasons.includes(this.gameState.season)) {
            this.showInfo(`${plantData.name}不能在${this.gameState.seasonNames[this.gameState.season]}季种植。`);
            return;
        }
        
        // 检查背包中的种子数量
        if (!this.backpack.seeds[seedType] || this.backpack.seeds[seedType] <= 0) {
            this.showInfo('背包中没有足够的种子。');
            return;
        }
        
        // 扣除种子
        this.backpack.seeds[seedType]--;
        
        // 种植
        field.plant = seedType;
        field.stage = 0;
        field.growthProgress = 0;
        field.watered = false;
        // 保持之前的施肥状态
        
        this.selectedSeed = null;
        this.showInfo(`成功种植了${plantData.name}！`);
        this.renderFields();
        this.updateMoneyDisplay();
    }
    
    // 采摘作物 - 放入仓库
    harvestPlant(fieldId) {
        const field = this.fields[fieldId];
        const plantData = this.plants[field.plant];
        
        // 检查仓库容量
        const currentCount = this.warehouse.crops[field.plant] || 0;
        if (currentCount >= this.warehouseMaxStack) {
            this.showInfo(`仓库中${plantData.name}已达堆叠上限（${this.warehouseMaxStack}个）。`);
            return;
        }
        
        // 添加到仓库
        if (!this.warehouse.crops[field.plant]) {
            this.warehouse.crops[field.plant] = 0;
        }
        this.warehouse.crops[field.plant]++;
        
        // 重置田地
        const wasFertilized = field.fertilized;
        const fertilizerType = field.fertilizerType;
        
        field.plant = null;
        field.stage = 0;
        field.growthProgress = 0;
        field.watered = false;
        // 施肥效果在收获后消失
        field.fertilized = false;
        field.fertilizerType = null;
        
        this.showInfo(`成功采摘了${plantData.name}！已放入仓库。`);
        this.renderFields();
    }
    
    // 获取可用的肥料
    getAvailableFertilizers() {
        const available = [];
        
        if (this.backpack.items.fertilizers) {
            for (const [key, count] of Object.entries(this.backpack.items.fertilizers)) {
                if (count > 0) {
                    available.push({ 
                        type: key, 
                        ...this.fertilizers[key],
                        count: count
                    });
                }
            }
        }
        
        return available;
    }
    
    // ========== 时间系统 ==========
    
    // 推进时间
    advanceTime(realMsPerGameMinute) {
        const gameMinutesToAdvance = this.timeConfig.updateInterval / realMsPerGameMinute;
        
        const oldHour = Math.floor(this.gameState.hour);
        const oldDay = this.gameState.day;
        
        this.gameState.minute += gameMinutesToAdvance;
        
        // 处理分钟进位
        while (this.gameState.minute >= 60) {
            this.gameState.minute -= 60;
            this.gameState.hour++;
            
            // 处理小时进位
            while (this.gameState.hour >= 24) {
                this.gameState.hour -= 24;
                this.gameState.day++;
                
                // 新的一天开始
                // 每日06:00刷新浇水状态
                this.resetDailyFieldStates();
                
                // 刷新每日市场
                this.refreshDailyMarket();
                
                // 每7天换一个季节
                if (this.gameState.day % 7 === 1 && this.gameState.day > 1) {
                    this.advanceSeason();
                }
                
                // 自动存档
                this.saveGame();
            }
        }
        
        // 检查是否到了06:00
        const newHour = Math.floor(this.gameState.hour);
        if (oldHour < 6 && newHour >= 6 && oldDay === this.gameState.day) {
            // 06:00时刷新浇水状态
            this.resetDailyFieldStates();
            this.showInfo('新的一天开始了，田地需要重新浇水。');
        }
        
        // 更新植物生长
        this.updatePlantGrowth(gameMinutesToAdvance);
        
        // 更新显示
        this.updateTimeDisplay();
        this.updateDayNightTheme();
    }
    
    // 推进季节
    advanceSeason() {
        const currentIndex = this.gameState.seasons.indexOf(this.gameState.season);
        const nextIndex = (currentIndex + 1) % this.gameState.seasons.length;
        this.gameState.season = this.gameState.seasons[nextIndex];
        
        // 季节变化时，清除不在当前季节生长的植物
        this.fields.forEach(field => {
            if (field.plant) {
                const plantData = this.plants[field.plant];
                if (!plantData.seasons.includes(this.gameState.season)) {
                    // 植物枯萎
                    const plantName = plantData.name;
                    field.plant = null;
                    field.stage = 0;
                    field.growthProgress = 0;
                    field.fertilized = false;
                    field.fertilizerType = null;
                    this.showInfo(`${plantName}因季节变化枯萎了。`);
                }
            }
        });
        
        this.showInfo(`季节变化：现在是${this.gameState.seasonNames[this.gameState.season]}季！`);
        this.renderFields();
        
        // 更新市场
        this.refreshDailyMarket();
    }
    
    // ========== UI渲染 ==========
    
    // 渲染田地
    renderFields() {
        this.fieldsContainer.innerHTML = '';
        
        this.fields.forEach((field, index) => {
            const fieldElement = document.createElement('div');
            fieldElement.className = 'field';
            fieldElement.dataset.fieldId = index;
            
            if (!field.unlocked) {
                fieldElement.classList.add('locked');
                const price = this.calculateUnlockPrice(this.unlockedFields);
                const isNextUnlockable = this.getNextUnlockableField() === index;
                
                fieldElement.innerHTML = `
                    <div class="field-content">
                        <div class="locked-text">未解锁</div>
                        ${isNextUnlockable ? `<div class="unlock-price">解锁: ${price}金币</div>` : ''}
                    </div>
                `;
                
                if (isNextUnlockable) {
                    fieldElement.addEventListener('click', () => this.unlockField(index));
                }
            } else if (!field.plant) {
                fieldElement.innerHTML = `
                    <div class="field-content">空地</div>
                    <div class="field-status">
                        <span class="water-indicator">${field.watered ? '已浇水' : '未浇水'}</span>
                        <span class="fertilizer-indicator">${field.fertilized ? '已施肥' : '未施肥'}</span>
                    </div>
                `;
                fieldElement.addEventListener('click', () => this.handleFieldClick(index));
            } else {
                const plantData = this.plants[field.plant];
                const stageText = plantData.stages[field.stage];
                const isReady = field.stage >= plantData.stages.length - 1;
                
                // 计算生长进度百分比（用于字体大小）
                const growthPercent = Math.min(100, (field.growthProgress / 1) * 100);
                
                fieldElement.innerHTML = `
                    <div class="field-content">
                        <div class="plant-breathing" style="--growth-percent: ${growthPercent}">${stageText}</div>
                    </div>
                    <div class="field-status">
                        <span class="water-indicator">${field.watered ? '已浇水' : '未浇水'}</span>
                        <span class="fertilizer-indicator">${field.fertilized ? '已施肥' : '未施肥'}</span>
                    </div>
                `;
                
                if (isReady) {
                    fieldElement.classList.add('ready-to-harvest');
                }
                
                fieldElement.addEventListener('click', () => this.handleFieldClick(index));
            }
            
            this.fieldsContainer.appendChild(fieldElement);
        });
    }
    
    // 处理田地点击
    handleFieldClick(fieldId) {
        const field = this.fields[fieldId];
        
        if (!field.unlocked) {
            return; // 已在renderFields中处理
        }
        
        if (!field.plant) {
            // 空地，可以种植
            if (this.selectedSeed) {
                this.plantSeed(fieldId, this.selectedSeed);
            } else {
                this.showInfo('请先在背包中选择一种种子。');
            }
        } else {
            // 有植物，显示操作选项
            this.showFieldActions(fieldId);
        }
    }
    
    // 显示田地操作
    showFieldActions(fieldId) {
        const field = this.fields[fieldId];
        const plantData = this.plants[field.plant];
        const isReady = field.stage >= plantData.stages.length - 1;
        
        // 移除旧的操作按钮
        const oldActions = document.querySelectorAll('.field-action-buttons');
        oldActions.forEach(el => el.remove());
        
        // 创建操作按钮容器
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!fieldElement) return;
        
        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-buttons field-action-buttons';
        actionContainer.style.marginTop = '0.5rem';
        
        // 浇水按钮
        const waterBtn = document.createElement('button');
        waterBtn.className = 'action-btn';
        waterBtn.textContent = '浇水';
        waterBtn.disabled = field.watered;
        waterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.waterField(fieldId);
            actionContainer.remove();
        });
        
        // 施肥按钮
        const fertilizerBtn = document.createElement('button');
        fertilizerBtn.className = 'action-btn';
        fertilizerBtn.textContent = '施肥';
        fertilizerBtn.disabled = field.fertilized || this.getAvailableFertilizers().length === 0;
        fertilizerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showFertilizerSelection(fieldId);
            actionContainer.remove();
        });
        
        // 采摘按钮（仅在成熟时显示）
        if (isReady) {
            const harvestBtn = document.createElement('button');
            harvestBtn.className = 'action-btn';
            harvestBtn.textContent = '采摘';
            harvestBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.harvestPlant(fieldId);
                actionContainer.remove();
            });
            actionContainer.appendChild(harvestBtn);
        }
        
        actionContainer.appendChild(waterBtn);
        actionContainer.appendChild(fertilizerBtn);
        
        fieldElement.appendChild(actionContainer);
        
        // 点击其他地方移除操作按钮
        setTimeout(() => {
            const removeActions = (e) => {
                if (!fieldElement.contains(e.target)) {
                    actionContainer.remove();
                    document.removeEventListener('click', removeActions);
                }
            };
            document.addEventListener('click', removeActions);
        }, 100);
    }
    
    // 显示肥料选择
    showFertilizerSelection(fieldId) {
        const availableFertilizers = this.getAvailableFertilizers();
        
        if (availableFertilizers.length === 0) {
            this.showInfo('没有可用的肥料。');
            return;
        }
        
        // 创建肥料选择弹窗
        const existingModal = document.getElementById('fertilizer-selection-modal');
        if (existingModal) existingModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'fertilizer-selection-modal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>选择肥料</h2>
                    <button class="close-btn" id="close-fertilizer-modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="inventory-content" id="fertilizer-selection-content"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const content = document.getElementById('fertilizer-selection-content');
        availableFertilizers.forEach(fertilizer => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-name">${fertilizer.name}</div>
                <div class="item-info">${fertilizer.description}</div>
                <div class="item-count">${fertilizer.count}</div>
            `;
            card.addEventListener('click', () => {
                this.applyFertilizer(fieldId, fertilizer.type);
                modal.remove();
            });
            content.appendChild(card);
        });
        
        // 关闭按钮
        document.getElementById('close-fertilizer-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        // 点击外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // ========== 背包和商人UI ==========
    
    // 显示背包
    showBackpack() {
        this.updateBackpackContent('seeds');
        this.showModal(this.backpackModal);
    }
    
    // 更新背包内容
    updateBackpackContent(tabType) {
        this.backpackContent.innerHTML = '';
        
        if (tabType === 'seeds') {
            // 显示种子
            let hasSeeds = false;
            for (const [seedType, count] of Object.entries(this.backpack.seeds)) {
                if (count > 0) {
                    hasSeeds = true;
                    const plantData = this.plants[seedType];
                    const card = this.createItemCard(
                        seedType,
                        plantData.name,
                        `可在${plantData.seasons.map(s => this.gameState.seasonNames[s]).join('、')}季种植`,
                        count,
                        'seed',
                        `${count}/${this.backpackMaxStack}`
                    );
                    this.backpackContent.appendChild(card);
                }
            }
            
            if (!hasSeeds) {
                this.backpackContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">背包中没有种子</div>';
            }
        } else if (tabType === 'items') {
            // 显示物品（肥料）
            let hasItems = false;
            
            if (this.backpack.items.fertilizers) {
                for (const [fertType, count] of Object.entries(this.backpack.items.fertilizers)) {
                    if (count > 0) {
                        hasItems = true;
                        const fertilizer = this.fertilizers[fertType];
                        const card = document.createElement('div');
                        card.className = 'item-card';
                        card.innerHTML = `
                            <div class="item-name">${fertilizer.name}</div>
                            <div class="item-info">${fertilizer.description}</div>
                            <div class="item-count">${count}/${this.backpackMaxStack}</div>
                        `;
                        this.backpackContent.appendChild(card);
                    }
                }
            }
            
            if (!hasItems) {
                this.backpackContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">背包中没有物品</div>';
            }
        }
    }
    
    // 创建物品卡片
    createItemCard(itemType, name, info, count, itemCategory, countText = null) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.itemType = itemType;
        card.dataset.itemCategory = itemCategory;
        
        if (itemCategory === 'seed' && this.selectedSeed === itemType) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <div class="item-name">${name}</div>
            <div class="item-info">${info}</div>
            <div class="item-count">${countText || count}</div>
        `;
        
        if (itemCategory === 'seed') {
            card.addEventListener('click', () => {
                // 移除其他选中状态
                document.querySelectorAll('.item-card.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // 选中当前种子
                card.classList.add('selected');
                this.selectedSeed = itemType;
                this.showInfo(`已选择${name}，点击空地进行种植。`);
            });
        }
        
        return card;
    }
    
    // 显示商人
    showMerchant() {
        this.updateMerchantContent('merchant-seeds');
        this.showModal(this.merchantModal);
    }
    
    // 更新商人内容
    updateMerchantContent(tabType) {
        this.merchantContent.innerHTML = '';
        
        if (tabType === 'merchant-seeds') {
            // 显示当季种子
            const currentSeason = this.gameState.season;
            let hasSeeds = false;
            
            for (const [seedType, plantData] of Object.entries(this.plants)) {
                if (plantData.seasons.includes(currentSeason)) {
                    hasSeeds = true;
                    const card = document.createElement('div');
                    card.className = 'item-card';
                    card.innerHTML = `
                        <div class="item-name">${plantData.name}</div>
                        <div class="item-info">${plantData.description}</div>
                        <div class="item-info">生长时间: ${plantData.growthDays}天</div>
                        <div class="item-price">${plantData.buyPrice}金币</div>
                    `;
                    
                    card.addEventListener('click', () => {
                        this.buySeed(seedType);
                    });
                    
                    this.merchantContent.appendChild(card);
                }
            }
            
            if (!hasSeeds) {
                this.merchantContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">当前季节没有可用的种子</div>';
            }
        } else if (tabType === 'merchant-fertilizer') {
            // 显示肥料
            for (const [fertType, fertilizer] of Object.entries(this.fertilizers)) {
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-name">${fertilizer.name}</div>
                    <div class="item-info">${fertilizer.description}</div>
                    <div class="item-price">${fertilizer.buyPrice}金币</div>
                `;
                
                card.addEventListener('click', () => {
                    this.buyFertilizer(fertType);
                });
                
                this.merchantContent.appendChild(card);
            }
        }
    }
    
    // ========== 市场和仓库UI ==========
    
    // 显示市场
    showMarket() {
        this.updateMarketContent();
        this.showModal(this.marketModal);
    }
    
    // 更新市场内容
    updateMarketContent() {
        this.marketContent.innerHTML = '';
        
        // 显示今日收购信息
        const infoDiv = document.createElement('div');
        infoDiv.style.gridColumn = '1/-1';
        infoDiv.style.marginBottom = '1rem';
        infoDiv.style.padding = '0.5rem';
        infoDiv.style.backgroundColor = 'var(--day-border)';
        infoDiv.style.borderRadius = '4px';
        infoDiv.innerHTML = `
            <strong>今日收购作物：</strong>${this.market.dailyCrops.map(type => this.plants[type].name).join('、')}
        `;
        this.marketContent.appendChild(infoDiv);
        
        // 显示市场收购信息
        for (const plantType of this.market.dailyCrops) {
            const plantData = this.plants[plantType];
            const marketPrice = this.market.prices[plantType];
            const basePrice = this.market.basePrices[plantType];
            const priceIndex = this.market.priceIndex[plantType];
            
            const priceDiff = marketPrice - basePrice;
            const priceDiffPercent = Math.round((priceDiff / basePrice) * 100);
            
            const card = document.createElement('div');
            card.className = 'item-card';
            
            const priceColor = priceDiff > 0 ? 'color: #4caf50;' : priceDiff < 0 ? 'color: #f44336;' : '';
            const priceDiffText = priceDiff > 0 ? `+${priceDiffPercent}%` : priceDiff < 0 ? `${priceDiffPercent}%` : '平价';
            
            // 检查仓库中是否有该作物
            const hasCrop = this.warehouse.crops[plantType] && this.warehouse.crops[plantType] > 0;
            const cropCount = this.warehouse.crops[plantType] || 0;
            
            card.innerHTML = `
                <div class="item-name">${plantData.name}</div>
                <div class="item-info">基础价格: ${basePrice}金币</div>
                <div class="item-info">价格指数: ${Math.round(priceIndex * 100)}%</div>
                <div class="item-price" style="${priceColor}">
                    ${marketPrice}金币 (${priceDiffText})
                </div>
                ${hasCrop ? `<div class="item-info" style="margin-top: 0.5rem;">仓库中: ${cropCount}/${this.warehouseMaxStack}个</div>` : ''}
            `;
            
            if (hasCrop) {
                card.addEventListener('click', () => {
                    this.sellCrop(plantType);
                });
                card.style.cursor = 'pointer';
            } else {
                card.style.opacity = '0.6';
                card.style.cursor = 'not-allowed';
            }
            
            this.marketContent.appendChild(card);
        }
    }
    
    // 显示仓库
    showWarehouse() {
        this.updateWarehouseContent();
        this.showModal(this.warehouseModal);
    }
    
    // 更新仓库内容
    updateWarehouseContent() {
        this.warehouseContent.innerHTML = '';
        
        // 显示仓库中的作物
        let hasItems = false;
        
        for (const [cropType, count] of Object.entries(this.warehouse.crops)) {
            if (count > 0) {
                hasItems = true;
                const plantData = this.plants[cropType];
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-name">${plantData.name}</div>
                    <div class="item-info">基础售价: ${plantData.sellPrice}金币</div>
                    <div class="item-count">${count}/${this.warehouseMaxStack}</div>
                    <div class="item-info" style="margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.7;">
                        请在市场中出售
                    </div>
                `;
                
                this.warehouseContent.appendChild(card);
            }
        }
        
        if (!hasItems) {
            this.warehouseContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">仓库中没有作物</div>';
        }
    }
    
    // ========== 基础UI方法 ==========
    
    // 初始化DOM元素
    initDOMElements() {
        // 屏幕
        this.mainMenu = document.getElementById('main-menu');
        this.gameScreen = document.getElementById('game-screen');
        
        // 菜单按钮
        this.startGameBtn = document.getElementById('start-game');
        this.loadGameBtn = document.getElementById('load-game');
        this.developerBtn = document.getElementById('developer');
        
        // 功能按钮
        this.backpackBtn = document.getElementById('backpack-btn');
        this.merchantBtn = document.getElementById('merchant-btn');
        this.marketBtn = document.getElementById('market-btn');
        this.warehouseBtn = document.getElementById('warehouse-btn');
        
        // 弹窗
        this.backpackModal = document.getElementById('backpack-modal');
        this.merchantModal = document.getElementById('merchant-modal');
        this.marketModal = document.getElementById('market-modal');
        this.warehouseModal = document.getElementById('warehouse-modal');
        this.developerModal = document.getElementById('developer-modal');
        
        // 关闭按钮
        this.closeBackpackBtn = document.getElementById('close-backpack');
        this.closeMerchantBtn = document.getElementById('close-merchant');
        this.closeMarketBtn = document.getElementById('close-market');
        this.closeWarehouseBtn = document.getElementById('close-warehouse');
        this.closeDeveloperBtn = document.getElementById('close-developer');
        
        // 时间显示
        this.timeProgress = document.getElementById('time-progress');
        this.timeIndicator = document.getElementById('time-indicator');
        this.currentSeason = document.getElementById('current-season');
        this.currentDay = document.getElementById('current-day');
        this.currentTime = document.getElementById('current-time');
        
        // 资金显示
        this.moneyDisplay = document.getElementById('money-display');
        
        // 田地容器
        this.fieldsContainer = document.getElementById('fields-container');
        
        // 信息面板
        this.infoPanel = document.getElementById('info-panel');
        this.infoContent = document.getElementById('info-content');
        
        // 内容区域
        this.backpackContent = document.getElementById('backpack-content');
        this.merchantContent = document.getElementById('merchant-content');
        this.marketContent = document.getElementById('market-content');
        this.warehouseContent = document.getElementById('warehouse-content');
    }
    
    // 绑定事件
    bindEvents() {
        // 菜单按钮
        this.startGameBtn.addEventListener('click', () => this.startNewGame());
        this.loadGameBtn.addEventListener('click', () => this.loadGame());
        this.developerBtn.addEventListener('click', () => this.showModal(this.developerModal));
        
        // 功能按钮
        this.backpackBtn.addEventListener('click', () => this.showBackpack());
        this.merchantBtn.addEventListener('click', () => this.showMerchant());
        this.marketBtn.addEventListener('click', () => this.showMarket());
        this.warehouseBtn.addEventListener('click', () => this.showWarehouse());
        
        // 关闭按钮
        this.closeBackpackBtn.addEventListener('click', () => this.hideModal(this.backpackModal));
        this.closeMerchantBtn.addEventListener('click', () => this.hideModal(this.merchantModal));
        this.closeMarketBtn.addEventListener('click', () => this.hideModal(this.marketModal));
        this.closeWarehouseBtn.addEventListener('click', () => this.hideModal(this.warehouseModal));
        this.closeDeveloperBtn.addEventListener('click', () => this.hideModal(this.developerModal));
        
        // 点击弹窗外部关闭
        [this.backpackModal, this.merchantModal, this.marketModal, this.warehouseModal, this.developerModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });
        
        // 选项卡切换
        this.bindTabEvents();
    }
    
    // 绑定选项卡事件
    bindTabEvents() {
        // 背包选项卡
        document.querySelectorAll('.inventory-tabs .tab-button').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.inventory-tabs .tab-button').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.updateBackpackContent(tab.dataset.tab);
            });
        });
        
        // 商人选项卡
        document.querySelectorAll('.merchant-tabs .tab-button').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.merchant-tabs .tab-button').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.updateMerchantContent(tab.dataset.tab);
            });
        });
    }
    
    // 开始新游戏
    startNewGame() {
        this.resetGameState();
        this.initFields();
        this.initMarket();
        this.switchToGameScreen();
        this.startTimeLoop();
        this.showInfo('游戏开始！你是一位神秘的农夫，在这片被古老力量笼罩的土地上开始了你的种植之旅。');
    }
    
    // 重置游戏状态
    resetGameState() {
        this.gameState = {
            isPlaying: true,
            money: 1000,
            day: 1,
            hour: 6,
            minute: 0,
            season: 'spring',
            seasons: ['spring', 'summer', 'autumn', 'winter'],
            seasonNames: {
                'spring': '春',
                'summer': '夏',
                'autumn': '秋',
                'winter': '冬'
            }
        };
        
        // 重置田块解锁
        this.unlockedFields = 1;
        
        // 重置背包
        this.backpack = {
            seeds: {},
            items: {}
        };
        
        // 重置仓库
        this.warehouse = {
            crops: {}
        };
        
        // 重置市场
        this.market = {
            dailyCrops: [],
            prices: {},
            basePrices: {},
            sellHistory: {},
            priceIndex: {}
        };
        
        this.selectedSeed = null;
    }
    
    // 切换到游戏界面
    switchToGameScreen() {
        this.mainMenu.classList.remove('active');
        this.mainMenu.classList.add('hidden');
        
        this.gameScreen.classList.remove('hidden');
        this.gameScreen.classList.add('active');
        
        this.updateAllDisplays();
    }
    
    // 开始时间循环
    startTimeLoop() {
        if (this.timeLoop) {
            clearInterval(this.timeLoop);
        }
        
        const realMsPerGameMinute = (this.timeConfig.realMinutesPerGameDay * 60 * 1000) / 
                                     (this.timeConfig.gameHoursPerDay * this.timeConfig.gameMinutesPerHour);
        
        this.timeLoop = setInterval(() => {
            this.advanceTime(realMsPerGameMinute);
        }, this.timeConfig.updateInterval);
    }
    
    // 更新时间显示
    updateTimeDisplay() {
        // 格式化时间
        const hour = Math.floor(this.gameState.hour);
        const minute = Math.floor(this.gameState.minute);
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        this.currentTime.textContent = `时间: ${timeString}`;
        this.currentDay.textContent = `第 ${this.gameState.day} 天`;
        this.currentSeason.textContent = `季节: ${this.gameState.seasonNames[this.gameState.season]}`;
        
        // 更新进度条
        const totalMinutes = this.gameState.hour * 60 + this.gameState.minute;
        const progress = totalMinutes / (24 * 60) * 100;
        
        this.timeProgress.style.width = `${progress}%`;
        this.timeIndicator.style.left = `${progress}%`;
    }
    
    // 更新日夜主题
    updateDayNightTheme() {
        const hour = this.gameState.hour;
        const isNight = hour >= 18 || hour < 6;
        
        if (isNight && !document.body.classList.contains('night-theme')) {
            document.body.classList.add('night-theme');
            if (hour === 18) {
                this.showInfo('夜幕降临，古老的力量开始苏醒...');
            }
        } else if (!isNight && document.body.classList.contains('night-theme')) {
            document.body.classList.remove('night-theme');
            if (hour === 6) {
                this.showInfo('黎明破晓，新的一天开始了。');
            }
        }
    }
    
    // 更新所有显示
    updateAllDisplays() {
        this.updateTimeDisplay();
        this.updateMoneyDisplay();
        this.updateDayNightTheme();
    }
    
    // 更新资金显示
    updateMoneyDisplay() {
        this.moneyDisplay.textContent = this.gameState.money;
    }
    
    // 显示信息
    showInfo(message) {
        this.infoContent.textContent = message;
        
        // 添加高亮效果
        this.infoPanel.style.transition = 'background-color 0.3s ease';
        this.infoPanel.style.backgroundColor = 'var(--cthulhu-gold)';
        
        setTimeout(() => {
            this.infoPanel.style.backgroundColor = '';
        }, 500);
        
        // 同时显示toast提示
        this.showToast(message);
    }
    
    // 显示Toast提示
    showToast(message) {
        // 移除旧的toast
        const oldToast = document.querySelector('.toast');
        if (oldToast) oldToast.remove();
        
        // 创建新的toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 显示
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // 显示弹窗
    showModal(modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
    }
    
    // 隐藏弹窗
    hideModal(modal) {
        modal.classList.remove('active');
        modal.classList.add('hidden');
    }
    
    // ========== 存档系统 ==========
    
    // 存档游戏
    saveGame() {
        const saveData = {
            gameState: this.gameState,
            fields: this.fields,
            unlockedFields: this.unlockedFields,
            backpack: this.backpack,
            warehouse: this.warehouse,
            market: this.market,
            savedAt: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('farmerJohnny_save', JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('存档失败:', error);
            return false;
        }
    }
    
    // 读取存档
    loadGame() {
        try {
            const saveData = localStorage.getItem('farmerJohnny_save');
            
            if (!saveData) {
                this.showInfo('没有找到存档文件。');
                return false;
            }
            
            const parsedData = JSON.parse(saveData);
            
            // 恢复游戏状态
            this.gameState = parsedData.gameState;
            this.fields = parsedData.fields;
            this.unlockedFields = parsedData.unlockedFields || 1;
            this.backpack = parsedData.backpack;
            this.warehouse = parsedData.warehouse;
            this.market = parsedData.market || this.market;
            
            // 切换到游戏界面
            this.switchToGameScreen();
            this.renderFields();
            this.startTimeLoop();
            
            this.showInfo('存档读取成功！');
            return true;
        } catch (error) {
            console.error('读档失败:', error);
            this.showInfo('读取存档失败。');
            return false;
        }
    }
    
    // 检查是否有存档
    hasSave() {
        return localStorage.getItem('farmerJohnny_save') !== null;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new FarmerJohnnyGame();
    
    // 检查是否有存档，更新读取存档按钮状态
    if (!game.hasSave()) {
        document.getElementById('load-game').style.opacity = '0.5';
        document.getElementById('load-game').style.cursor = 'not-allowed';
    }
    
    // 暴露到全局以便调试
    window.game = game;
});