class FarmerJohnnyApp {
    constructor() {
        this.eventBus = new EventBus();
        this.timer = new Timer(this.eventBus);
        this.logger = new Logger('FarmerJohnny');

        this.timeModule = new TimeModule(this.eventBus);
        this.environmentModule = new EnvironmentModule(this.eventBus, this.timeModule);
        this.gameState = new GameState();
        this.saveManager = new SaveManager(this.eventBus);

        this.sanityModule = new SanityModule(
            this.eventBus,
            this.gameState,
            this.timeModule
        );

        this.pollutionModule = new PollutionModule(
            this.eventBus,
            this.gameState,
            this.timeModule
        );

        this.farmingModule = new FarmingModule(
            this.eventBus, 
            this.gameState, 
            this.timeModule, 
            this.environmentModule
        );

        this.economyModule = new EconomyModule(
            this.eventBus, 
            this.gameState, 
            this.timeModule
        );

        this.livestockModule = new LivestockModule(
            this.eventBus,
            this.gameState,
            this.timeModule,
            this.sanityModule,
            this.pollutionModule
        );

        this.animationManager = new AnimationManager(this.eventBus);
        this.effectManager = new EffectManager(this.eventBus);

        this.uiRenderer = new UIRenderer(
            this.eventBus,
            this.timeModule,
            this.gameState,
            this.farmingModule,
            this.economyModule,
            this.sanityModule,
            this.pollutionModule,
            this.livestockModule,
            this.animationManager,
            this.effectManager
        );

        this.eventBinder = new EventBinder(this.eventBus);
        this.inputHandler = new InputHandler(this.eventBus, this.eventBinder);
        this.interactionManager = new InteractionManager(
            this.eventBus,
            this.farmingModule,
            this.economyModule,
            this.sanityModule,
            this.pollutionModule,
            this.livestockModule,
            this.uiRenderer
        );

        this.timeLoopId = 'gameTimeLoop';
    }

    init() {
        this.logger.info('游戏初始化中...');

        this.setupEventListeners();

        this.inputHandler.init();

        this.economyModule.init();

        this.uiRenderer.updateLoadButtonState(this.saveManager.hasSave());

        this.logger.info('游戏初始化完成');
    }

    setupEventListeners() {
        this.eventBus.on('game:startNew', () => {
            this.startNewGame();
        });

        this.eventBus.on('game:load', () => {
            this.loadGame();
        });

        this.eventBus.on('ui:seedSelected', (seedType) => {
            this.interactionManager.handleSeedSelect(seedType);
        });

        this.eventBus.on('ui:buySeed', (seedType) => {
            this.interactionManager.handleBuySeed(seedType);
        });

        this.eventBus.on('ui:buyFertilizer', (fertilizerType) => {
            this.interactionManager.handleBuyFertilizer(fertilizerType);
        });

        this.eventBus.on('ui:sellCrop', (cropType) => {
            this.interactionManager.handleSellCrop(cropType);
        });

        this.eventBus.on('ui:moveFromWarehouse', (data) => {
            this.interactionManager.handleMoveFromWarehouse(data.itemType, data.category);
        });

        this.eventBus.on('save:success', () => {
            this.logger.debug('游戏已自动存档');
        });

        this.eventBus.on('save:error', (data) => {
            this.logger.error('存档失败:', data.error);
        });
    }

    startNewGame() {
        this.logger.info('开始新游戏...');

        this.gameState.init();
        this.timeModule.init(1, 6, 0, 'spring');
        this.sanityModule.init();
        this.pollutionModule.init();
        this.farmingModule.init();
        this.economyModule.init();
        this.livestockModule.init();

        this.uiRenderer.switchToGameScreen();
        this.uiRenderer.switchToFields();
        this.uiRenderer.showInfo('游戏开始！你是一位神秘的农夫，在这片被古老力量笼罩的土地上开始了你的种植之旅。');

        this.startTimeLoop();

        this.logger.info('新游戏已启动');
    }

    loadGame() {
        this.logger.info('尝试加载存档...');

        if (!this.saveManager.hasSave()) {
            this.uiRenderer.showInfo('没有找到存档文件。');
            return;
        }

        const success = this.saveManager.load(
            this.gameState,
            this.timeModule,
            this.farmingModule,
            this.sanityModule,
            this.pollutionModule,
            this.livestockModule
        );

        if (success) {
            this.uiRenderer.switchToGameScreen();
            this.uiRenderer.switchToFields();
            this.uiRenderer.showInfo('存档读取成功！');
            this.startTimeLoop();
            this.logger.info('存档加载成功');
        } else {
            this.uiRenderer.showInfo('读取存档失败。');
            this.logger.error('存档加载失败');
        }
    }

    startTimeLoop() {
        if (this.timer.hasInterval(this.timeLoopId)) {
            this.timer.clearInterval(this.timeLoopId);
        }

        const updateInterval = 100;
        const realMsPerGameMinute = this.timeModule.getRealMsPerGameMinute();

        this.timer.setInterval(() => {
            const gameMinutesToAdvance = updateInterval / realMsPerGameMinute;
            this.timeModule.advanceTime(gameMinutesToAdvance);
            this.farmingModule.updatePlantGrowth(gameMinutesToAdvance);
            
            if (this.livestockModule && this.livestockModule.updateAnimalTimers) {
                this.livestockModule.updateAnimalTimers(gameMinutesToAdvance);
            }

            if (Math.floor(this.timeModule.state.minute) === 0) {
                this.autoSave();
            }
        }, updateInterval, this.timeLoopId);

        this.logger.info('时间循环已启动');
    }

    stopTimeLoop() {
        if (this.timer.hasInterval(this.timeLoopId)) {
            this.timer.clearInterval(this.timeLoopId);
            this.logger.info('时间循环已停止');
        }
    }

    autoSave() {
        this.saveManager.save(
            this.gameState,
            this.timeModule,
            this.farmingModule,
            this.sanityModule,
            this.pollutionModule,
            this.livestockModule
        );
    }

    saveGame() {
        const success = this.saveManager.save(
            this.gameState,
            this.timeModule,
            this.farmingModule,
            this.sanityModule,
            this.pollutionModule,
            this.livestockModule
        );

        if (success) {
            this.uiRenderer.showInfo('游戏已保存！');
        } else {
            this.uiRenderer.showInfo('保存失败。');
        }

        return success;
    }

    destroy() {
        this.stopTimeLoop();
        this.timer.clearAll();
        this.eventBus.clear();
        this.eventBinder.unbindAll();
        this.logger.info('游戏已销毁');
    }
}

let gameApp = null;

document.addEventListener('DOMContentLoaded', () => {
    gameApp = new FarmerJohnnyApp();
    gameApp.init();

    window.game = gameApp;
});
