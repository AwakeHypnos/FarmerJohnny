// 游戏核心逻辑
class FarmerJohnnyGame {
    constructor() {
        // 游戏状态
        this.gameState = {
            isPlaying: false,
            money: 1000,
            day: 1,
            hour: 0,
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
            updateInterval: 100 // 毫秒
        };
        
        // 田地数据
        this.fields = [];
        this.totalFields = 9;
        this.unlockedFields = 1;
        
        // 植物数据
        this.plants = {
            'cthulhu_seedling': {
                name: '克苏鲁幼苗',
                stages: ['种', '克苏鲁幼苗'],
                growthTime: { hours: 6, minutes: 0 },
                seasons: ['spring', 'summer'],
                sellPrice: 50,
                buyPrice: 20,
                description: '神秘的幼苗，据说与古老者有关'
            },
            'deep_onion': {
                name: '深渊洋葱',
                stages: ['种', '深渊洋葱'],
                growthTime: { hours: 8, minutes: 0 },
                seasons: ['spring', 'autumn'],
                sellPrice: 40,
                buyPrice: 15,
                description: '来自深渊的洋葱，味道奇特'
            },
            'nightshade_berry': {
                name: '夜影浆果',
                stages: ['种', '夜影浆果'],
                growthTime: { hours: 10, minutes: 0 },
                seasons: ['summer', 'autumn'],
                sellPrice: 70,
                buyPrice: 30,
                description: '只在夜间生长的神秘浆果'
            },
            'frost_mushroom': {
                name: '寒霜蘑菇',
                stages: ['种', '寒霜蘑菇'],
                growthTime: { hours: 12, minutes: 0 },
                seasons: ['autumn', 'winter'],
                sellPrice: 80,
                buyPrice: 35,
                description: '在寒冷中生长的奇异蘑菇'
            },
            'void_wheat': {
                name: '虚空小麦',
                stages: ['种', '虚空小麦'],
                growthTime: { hours: 14, minutes: 0 },
                seasons: ['spring', 'summer', 'autumn'],
                sellPrice: 60,
                buyPrice: 25,
                description: '来自虚空的小麦，颗粒饱满'
            },
            'dark_pumpkin': {
                name: '黑暗南瓜',
                stages: ['种', '黑暗南瓜'],
                growthTime: { hours: 16, minutes: 0 },
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
                description: '加速植物生长10%',
                buyPrice: 10,
                growthBoost: 0.1,
                count: 0
            },
            'premium_fertilizer': {
                name: '高级肥料',
                description: '加速植物生长25%',
                buyPrice: 30,
                growthBoost: 0.25,
                count: 0
            },
            'ancient_fertilizer': {
                name: '古老肥料',
                description: '加速植物生长50%',
                buyPrice: 80,
                growthBoost: 0.5,
                count: 0
            }
        };
        
        // 背包数据
        this.backpack = {
            seeds: {},
            crops: {},
            items: {}
        };
        
        // 仓库数据
        this.warehouse = {
            seeds: {},
            crops: {},
            items: {}
        };
        
        // 市场价格波动
        this.marketPrices = {};
        
        // 时间循环定时器
        this.timeLoop = null;
        
        // 选中的种子（用于种植）
        this.selectedSeed = null;
        
        // 初始化DOM元素
        this.initDOMElements();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化市场价格
        this.initMarketPrices();
    }
    
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
        
        this.backpack = {
            seeds: {},
            crops: {},
            items: {}
        };
        
        // 初始化肥料数量
        this.fertilizers = {
            'basic_fertilizer': {
                name: '基础肥料',
                description: '加速植物生长10%',
                buyPrice: 10,
                growthBoost: 0.1,
                count: 0
            },
            'premium_fertilizer': {
                name: '高级肥料',
                description: '加速植物生长25%',
                buyPrice: 30,
                growthBoost: 0.25,
                count: 0
            },
            'ancient_fertilizer': {
                name: '古老肥料',
                description: '加速植物生长50%',
                buyPrice: 80,
                growthBoost: 0.5,
                count: 0
            }
        };
        
        this.warehouse = {
            seeds: {},
            crops: {},
            items: {}
        };
        
        this.selectedSeed = null;
    }
    
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
    
    // 渲染田地
    renderFields() {
        this.fieldsContainer.innerHTML = '';
        
        this.fields.forEach((field, index) => {
            const fieldElement = document.createElement('div');
            fieldElement.className = 'field';
            fieldElement.dataset.fieldId = index;
            
            if (!field.unlocked) {
                fieldElement.classList.add('locked');
                fieldElement.innerHTML = '<div class="field-content">🔒</div>';
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
                
                fieldElement.innerHTML = `
                    <div class="field-content">
                        <div class="plant-breathing">${stageText}</div>
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
            this.showInfo('这块田地还未解锁。');
            return;
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
        
        // 种植
        this.backpack.seeds[seedType]--;
        field.plant = seedType;
        field.stage = 0;
        field.growthProgress = 0;
        field.watered = false;
        field.fertilized = false;
        field.fertilizerType = null;
        
        this.selectedSeed = null;
        this.showInfo(`成功种植了${plantData.name}！`);
        this.renderFields();
        this.updateMoneyDisplay();
        
        // 添加生长动画
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (fieldElement) {
            const plantContent = fieldElement.querySelector('.field-content');
            if (plantContent) {
                plantContent.classList.add('plant-growing');
                setTimeout(() => {
                    plantContent.classList.remove('plant-growing');
                }, 500);
            }
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
        waterBtn.textContent = '💧 浇水';
        waterBtn.disabled = field.watered;
        waterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.waterField(fieldId);
            actionContainer.remove();
        });
        
        // 施肥按钮
        const fertilizerBtn = document.createElement('button');
        fertilizerBtn.className = 'action-btn';
        fertilizerBtn.textContent = '🌱 施肥';
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
            harvestBtn.textContent = '✂️ 采摘';
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
    
    // 获取可用的肥料
    getAvailableFertilizers() {
        const available = [];
        for (const [key, fertilizer] of Object.entries(this.fertilizers)) {
            if (fertilizer.count > 0) {
                available.push({ type: key, ...fertilizer });
            }
        }
        // 检查背包中的肥料物品
        if (this.backpack.items.fertilizers) {
            for (const [key, count] of Object.entries(this.backpack.items.fertilizers)) {
                if (count > 0 && !available.find(f => f.type === key)) {
                    available.push({ type: key, ...this.fertilizers[key] });
                }
            }
        }
        return available;
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
                    <h2>🌱 选择肥料</h2>
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
    
    // 施肥
    applyFertilizer(fieldId, fertilizerType) {
        const field = this.fields[fieldId];
        const fertilizer = this.fertilizers[fertilizerType];
        
        if (field.fertilized) {
            this.showInfo('这块田地已经施过肥了。');
            return;
        }
        
        // 检查肥料数量
        let hasEnough = false;
        if (fertilizer.count > 0) {
            fertilizer.count--;
            hasEnough = true;
        } else if (this.backpack.items.fertilizers && this.backpack.items.fertilizers[fertilizerType] > 0) {
            this.backpack.items.fertilizers[fertilizerType]--;
            hasEnough = true;
        }
        
        if (!hasEnough) {
            this.showInfo('没有足够的肥料。');
            return;
        }
        
        field.fertilized = true;
        field.fertilizerType = fertilizerType;
        
        this.showInfo(`成功施用了${fertilizer.name}！`);
        this.renderFields();
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
    
    // 采摘
    harvestPlant(fieldId) {
        const field = this.fields[fieldId];
        const plantData = this.plants[field.plant];
        
        // 添加到背包
        if (!this.backpack.crops[field.plant]) {
            this.backpack.crops[field.plant] = 0;
        }
        this.backpack.crops[field.plant]++;
        
        // 重置田地
        field.plant = null;
        field.stage = 0;
        field.growthProgress = 0;
        field.watered = false;
        field.fertilized = false;
        field.fertilizerType = null;
        
        this.showInfo(`成功采摘了${plantData.name}！已放入背包。`);
        this.renderFields();
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
    
    // 推进时间
    advanceTime(realMsPerGameMinute) {
        const gameMinutesToAdvance = this.timeConfig.updateInterval / realMsPerGameMinute;
        
        this.gameState.minute += gameMinutesToAdvance;
        
        // 处理分钟进位
        while (this.gameState.minute >= 60) {
            this.gameState.minute -= 60;
            this.gameState.hour++;
            
            // 处理小时进位
            while (this.gameState.hour >= 24) {
                this.gameState.hour -= 24;
                this.gameState.day++;
                
                // 新的一天，重置浇水状态
                this.resetDailyFieldStates();
                
                // 每7天换一个季节
                if (this.gameState.day % 7 === 1 && this.gameState.day > 1) {
                    this.advanceSeason();
                }
                
                // 自动存档
                this.saveGame();
            }
        }
        
        // 更新植物生长
        this.updatePlantGrowth(gameMinutesToAdvance);
        
        // 更新显示
        this.updateTimeDisplay();
        this.updateDayNightTheme();
        
        // 自动存档（每分钟一次）
        if (Math.floor(this.gameState.minute) === 0) {
            this.saveGame();
        }
    }
    
    // 重置每日田地状态
    resetDailyFieldStates() {
        this.fields.forEach(field => {
            if (field.unlocked) {
                field.watered = false;
                // 施肥效果持续一天，所以不需要重置
            }
        });
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
                    field.plant = null;
                    field.stage = 0;
                    field.growthProgress = 0;
                }
            }
        });
        
        this.showInfo(`季节变化：现在是${this.gameState.seasonNames[this.gameState.season]}季！`);
        this.renderFields();
        
        // 更新市场价格
        this.updateMarketPrices();
    }
    
    // 更新植物生长
    updatePlantGrowth(gameMinutes) {
        let needsRender = false;
        
        this.fields.forEach(field => {
            if (field.plant && field.watered) {
                const plantData = this.plants[field.plant];
                
                // 计算生长速度（分钟）
                let growthRate = 1;
                
                // 施肥加成
                if (field.fertilized && field.fertilizerType) {
                    const fertilizer = this.fertilizers[field.fertilizerType];
                    if (fertilizer) {
                        growthRate += fertilizer.growthBoost;
                    }
                }
                
                // 计算总生长时间（分钟）
                const totalGrowthMinutes = plantData.growthTime.hours * 60 + plantData.growthTime.minutes;
                const growthPerMinute = 1 / totalGrowthMinutes;
                
                // 增加生长进度
                field.growthProgress += growthPerMinute * gameMinutes * growthRate;
                
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
                        'seed'
                    );
                    this.backpackContent.appendChild(card);
                }
            }
            
            if (!hasSeeds) {
                this.backpackContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">背包中没有种子</div>';
            }
        } else if (tabType === 'crops') {
            // 显示作物
            let hasCrops = false;
            for (const [cropType, count] of Object.entries(this.backpack.crops)) {
                if (count > 0) {
                    hasCrops = true;
                    const plantData = this.plants[cropType];
                    const card = this.createItemCard(
                        cropType,
                        plantData.name,
                        `售价: ${plantData.sellPrice}金币`,
                        count,
                        'crop'
                    );
                    this.backpackContent.appendChild(card);
                }
            }
            
            if (!hasCrops) {
                this.backpackContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">背包中没有作物</div>';
            }
        } else if (tabType === 'items') {
            // 显示物品（肥料）
            let hasItems = false;
            
            // 显示肥料
            for (const [fertType, fertilizer] of Object.entries(this.fertilizers)) {
                if (fertilizer.count > 0) {
                    hasItems = true;
                    const card = this.createItemCard(
                        fertType,
                        fertilizer.name,
                        fertilizer.description,
                        fertilizer.count,
                        'fertilizer'
                    );
                    this.backpackContent.appendChild(card);
                }
            }
            
            // 显示背包物品中的肥料
            if (this.backpack.items.fertilizers) {
                for (const [fertType, count] of Object.entries(this.backpack.items.fertilizers)) {
                    if (count > 0) {
                        hasItems = true;
                        const fertilizer = this.fertilizers[fertType];
                        const card = this.createItemCard(
                            fertType,
                            fertilizer.name,
                            fertilizer.description,
                            count,
                            'fertilizer'
                        );
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
    createItemCard(itemType, name, info, count, itemCategory) {
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
            <div class="item-count">${count}</div>
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
                        <div class="item-name">${plantData.name}种子</div>
                        <div class="item-info">${plantData.description}</div>
                        <div class="item-info">生长时间: ${plantData.growthTime.hours}小时</div>
                        <div class="item-price">💰 ${plantData.buyPrice}金币</div>
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
                    <div class="item-price">💰 ${fertilizer.buyPrice}金币</div>
                `;
                
                card.addEventListener('click', () => {
                    this.buyFertilizer(fertType);
                });
                
                this.merchantContent.appendChild(card);
            }
        }
    }
    
    // 购买种子
    buySeed(seedType) {
        const plantData = this.plants[seedType];
        
        if (this.gameState.money < plantData.buyPrice) {
            this.showInfo('资金不足！');
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
        
        // 扣除资金
        this.gameState.money -= fertilizer.buyPrice;
        
        // 添加到物品
        fertilizer.count++;
        
        this.showInfo(`成功购买了${fertilizer.name}！`);
        this.updateMoneyDisplay();
        this.updateMerchantContent('merchant-fertilizer');
    }
    
    // 初始化市场价格
    initMarketPrices() {
        this.updateMarketPrices();
    }
    
    // 更新市场价格
    updateMarketPrices() {
        // 市场价格波动：±20%
        for (const [plantType, plantData] of Object.entries(this.plants)) {
            const basePrice = plantData.sellPrice;
            const fluctuation = 0.2;
            const randomFactor = 1 + (Math.random() * fluctuation * 2 - fluctuation);
            this.marketPrices[plantType] = Math.floor(basePrice * randomFactor);
        }
    }
    
    // 显示市场
    showMarket() {
        this.updateMarketContent();
        this.showModal(this.marketModal);
    }
    
    // 更新市场内容
    updateMarketContent() {
        this.marketContent.innerHTML = '';
        
        // 显示市场收购信息
        for (const [plantType, plantData] of Object.entries(this.plants)) {
            const marketPrice = this.marketPrices[plantType] || plantData.sellPrice;
            const basePrice = plantData.sellPrice;
            const priceDiff = marketPrice - basePrice;
            const priceDiffPercent = Math.round((priceDiff / basePrice) * 100);
            
            const card = document.createElement('div');
            card.className = 'item-card';
            
            const priceColor = priceDiff > 0 ? 'color: #4caf50;' : priceDiff < 0 ? 'color: #f44336;' : '';
            const priceDiffText = priceDiff > 0 ? `+${priceDiffPercent}%` : priceDiff < 0 ? `${priceDiffPercent}%` : '平价';
            
            // 检查背包中是否有该作物
            const hasCrop = this.backpack.crops[plantType] && this.backpack.crops[plantType] > 0;
            const cropCount = this.backpack.crops[plantType] || 0;
            
            card.innerHTML = `
                <div class="item-name">${plantData.name}</div>
                <div class="item-info">基础价格: ${basePrice}金币</div>
                <div class="item-price" style="${priceColor}">
                    💰 ${marketPrice}金币 (${priceDiffText})
                </div>
                ${hasCrop ? `<div class="item-info" style="margin-top: 0.5rem;">背包中: ${cropCount}个</div>` : ''}
            `;
            
            if (hasCrop) {
                card.addEventListener('click', () => {
                    this.sellCrop(plantType, marketPrice);
                });
                card.style.cursor = 'pointer';
            } else {
                card.style.opacity = '0.6';
                card.style.cursor = 'not-allowed';
            }
            
            this.marketContent.appendChild(card);
        }
    }
    
    // 出售作物
    sellCrop(cropType, price) {
        if (!this.backpack.crops[cropType] || this.backpack.crops[cropType] <= 0) {
            this.showInfo('背包中没有该作物。');
            return;
        }
        
        // 扣除作物
        this.backpack.crops[cropType]--;
        
        // 增加资金
        this.gameState.money += price;
        
        const plantData = this.plants[cropType];
        this.showInfo(`成功出售了${plantData.name}，获得${price}金币！`);
        
        this.updateMoneyDisplay();
        this.updateMarketContent();
    }
    
    // 显示仓库
    showWarehouse() {
        this.updateWarehouseContent();
        this.showModal(this.warehouseModal);
    }
    
    // 更新仓库内容
    updateWarehouseContent() {
        this.warehouseContent.innerHTML = '';
        
        // 显示仓库中的物品
        let hasItems = false;
        
        // 种子
        for (const [seedType, count] of Object.entries(this.warehouse.seeds)) {
            if (count > 0) {
                hasItems = true;
                const plantData = this.plants[seedType];
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-name">${plantData.name}种子</div>
                    <div class="item-info">可在${plantData.seasons.map(s => this.gameState.seasonNames[s]).join('、')}季种植</div>
                    <div class="item-count">${count}</div>
                    <div class="action-buttons" style="margin-top: 0.5rem;">
                        <button class="action-btn" style="font-size: 0.8rem;">取出</button>
                    </div>
                `;
                
                // 取出按钮
                card.querySelector('.action-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.moveFromWarehouse(seedType, 'seeds');
                });
                
                this.warehouseContent.appendChild(card);
            }
        }
        
        // 作物
        for (const [cropType, count] of Object.entries(this.warehouse.crops)) {
            if (count > 0) {
                hasItems = true;
                const plantData = this.plants[cropType];
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-name">${plantData.name}</div>
                    <div class="item-info">售价: ${plantData.sellPrice}金币</div>
                    <div class="item-count">${count}</div>
                    <div class="action-buttons" style="margin-top: 0.5rem;">
                        <button class="action-btn" style="font-size: 0.8rem;">取出</button>
                    </div>
                `;
                
                card.querySelector('.action-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.moveFromWarehouse(cropType, 'crops');
                });
                
                this.warehouseContent.appendChild(card);
            }
        }
        
        if (!hasItems) {
            this.warehouseContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">仓库中没有物品</div>';
        }
    }
    
    // 从仓库取出物品
    moveFromWarehouse(itemType, category) {
        if (!this.warehouse[category][itemType] || this.warehouse[category][itemType] <= 0) {
            this.showInfo('仓库中没有该物品。');
            return;
        }
        
        // 从仓库扣除
        this.warehouse[category][itemType]--;
        
        // 添加到背包
        if (!this.backpack[category][itemType]) {
            this.backpack[category][itemType] = 0;
        }
        this.backpack[category][itemType]++;
        
        this.showInfo('物品已取出到背包。');
        this.updateWarehouseContent();
    }
    
    // 存档游戏
    saveGame() {
        const saveData = {
            gameState: this.gameState,
            fields: this.fields,
            backpack: this.backpack,
            warehouse: this.warehouse,
            fertilizers: this.fertilizers,
            marketPrices: this.marketPrices,
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
            this.backpack = parsedData.backpack;
            this.warehouse = parsedData.warehouse;
            this.fertilizers = parsedData.fertilizers || this.fertilizers;
            this.marketPrices = parsedData.marketPrices || {};
            
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