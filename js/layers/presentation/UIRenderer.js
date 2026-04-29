class UIRenderer {
    constructor(eventBus, timeModule, gameState, farmingModule, economyModule, sanityModule, pollutionModule, livestockModule, sleepModule, explorationModule, animationManager, effectManager) {
        this.eventBus = eventBus;
        this.timeModule = timeModule;
        this.gameState = gameState;
        this.farmingModule = farmingModule;
        this.economyModule = economyModule;
        this.sanityModule = sanityModule;
        this.pollutionModule = pollutionModule;
        this.livestockModule = livestockModule;
        this.sleepModule = sleepModule;
        this.explorationModule = explorationModule;
        this.animationManager = animationManager;
        this.effectManager = effectManager;

        this.currentView = 'fields';
        this.currentExplorationTab = 'exploration-map';

        this.initDOMElements();
        this.setupListeners();
    }

    initDOMElements() {
        this.mainMenu = document.getElementById('main-menu');
        this.gameScreen = document.getElementById('game-screen');
        
        this.timeProgress = document.getElementById('time-progress');
        this.timeIndicator = document.getElementById('time-indicator');
        this.currentSeason = document.getElementById('current-season');
        this.currentDay = document.getElementById('current-day');
        this.currentTime = document.getElementById('current-time');
        
        this.moneyDisplay = document.getElementById('money-display');
        
        this.sanityProgress = document.getElementById('sanity-progress');
        this.sanityDisplay = document.getElementById('sanity-display');
        this.sanityLevel = document.getElementById('sanity-level');
        
        this.pollutionProgress = document.getElementById('pollution-progress');
        this.pollutionDisplay = document.getElementById('pollution-display');
        this.pollutionLevel = document.getElementById('pollution-level');
        
        this.fieldsView = document.getElementById('fields-view');
        this.barnView = document.getElementById('barn-view');
        this.pondView = document.getElementById('pond-view');
        this.fieldsContainer = document.getElementById('fields-container');
        this.barnContainer = document.getElementById('barn-container');
        this.barnInfo = document.getElementById('barn-info');
        this.pondContainer = document.getElementById('pond-container');
        this.pondInfo = document.getElementById('pond-info');
        this.baitArea = document.getElementById('bait-area');
        
        this.navLeft = document.getElementById('nav-left');
        this.navRight = document.getElementById('nav-right');
        
        this.infoPanel = document.getElementById('info-panel');
        this.infoContent = document.getElementById('info-content');
        
        this.backpackContent = document.getElementById('backpack-content');
        this.merchantContent = document.getElementById('merchant-content');
        this.marketContent = document.getElementById('market-content');
        this.warehouseContent = document.getElementById('warehouse-content');
        this.logContent = document.getElementById('log-content');
        this.sleepContent = document.getElementById('sleep-content');

        this.modals = {
            backpack: document.getElementById('backpack-modal'),
            merchant: document.getElementById('merchant-modal'),
            market: document.getElementById('market-modal'),
            warehouse: document.getElementById('warehouse-modal'),
            developer: document.getElementById('developer-modal'),
            log: document.getElementById('log-modal'),
            sleep: document.getElementById('sleep-modal'),
            exploration: document.getElementById('exploration-modal'),
            mysteryEvent: document.getElementById('mystery-event-modal'),
            artifactRead: document.getElementById('artifact-read-modal'),
            pause: document.getElementById('pause-modal')
        };

        this.explorationMap = document.getElementById('exploration-map');
        this.regionsContainer = document.getElementById('regions-container');
        this.explorationArtifacts = document.getElementById('exploration-artifacts');
        this.explorationTalents = document.getElementById('exploration-talents');
        this.explorationProgressBar = document.getElementById('exploration-progress');
        this.explorationProgressFill = document.getElementById('exploration-progress-fill');
        this.explorationProgressText = document.getElementById('exploration-progress-text');

        this.eventIcon = document.getElementById('event-icon');
        this.eventTitle = document.getElementById('event-title');
        this.eventDescription = document.getElementById('event-description');
        this.eventChoices = document.getElementById('event-choices');

        this.artifactReadIcon = document.getElementById('artifact-read-icon');
        this.artifactReadTitle = document.getElementById('artifact-read-title');
        this.artifactReadDescription = document.getElementById('artifact-read-description');
        this.artifactReadEffects = document.getElementById('artifact-read-effects');
    }

    setupListeners() {
        this.eventBus.on('time:updated', () => {
            this.updateTimeDisplay();
        });

        this.eventBus.on('time:seasonChanged', () => {
            this.updateTimeDisplay();
        });

        this.eventBus.on('time:dusk', () => {
            this.showInfo('夜幕降临，古老的力量开始苏醒...');
        });

        this.eventBus.on('time:dawn', () => {
            this.showInfo('黎明破晓，新的一天开始了。');
        });

        this.eventBus.on('environment:dayNightChanged', (data) => {
            this.effectManager.updateDayNightTheme(data.isNight);
        });

        this.eventBus.on('economy:moneyChanged', () => {
            this.updateMoneyDisplay();
        });

        this.eventBus.on('economy:trapBought', (data) => {
            this.showInfo(`成功购买了${data.trapName}！`);
            if (this.currentView === 'fields') {
                this.renderWildAnimals();
            }
        });

        this.eventBus.on('farming:fieldsUpdated', () => {
            this.renderFields();
        });

        this.eventBus.on('farming:planted', (data) => {
            this.showInfo(`成功种植了${data.plantName}！`);
            this.renderFields();
            this.updateMoneyDisplay();
            this.animationManager.addPlantGrowingAnimation(data.fieldId);
        });

        this.eventBus.on('farming:plantReady', (data) => {
            this.showInfo(`${data.plantName}成熟了！可以采摘了。`);
            this.renderFields();
        });

        this.eventBus.on('farming:harvested', (data) => {
            this.showInfo(`成功采摘了${data.plantName}！已放入背包。`);
            this.renderFields();
            this.animationManager.addHarvestAnimation(data.fieldId);
        });

        this.eventBus.on('farming:watered', () => {
            this.showInfo('浇水成功！');
            this.renderFields();
        });

        this.eventBus.on('farming:fertilized', (data) => {
            this.showInfo(`成功施用了${data.fertilizerName}！`);
            this.renderFields();
        });

        this.eventBus.on('farming:seedSelected', (seedType) => {
            this.updateBackpackTabSelection(seedType);
        });

        this.eventBus.on('time:seasonChanged', (data) => {
            this.showInfo(`季节变化：现在是${data.seasonName}季！`, 'info');
            this.renderFields();
        });

        this.eventBus.on('sanity:changed', (data) => {
            this.updateSanityDisplay();
        });

        this.eventBus.on('sanity:levelDown', (data) => {
            this.showInfo(`理智下降：${data.oldLevel.name} → ${data.newLevel.name}`, 'warning');
        });

        this.eventBus.on('sanity:levelUp', (data) => {
            this.showInfo(`理智恢复：${data.oldLevel.name} → ${data.newLevel.name}`, 'success');
        });

        this.eventBus.on('pollution:changed', (data) => {
            this.updatePollutionDisplay();
        });

        this.eventBus.on('pollution:levelUp', (data) => {
            this.showInfo(`污染加剧：${data.oldLevel.name} → ${data.newLevel.name}`, 'warning');
        });

        this.eventBus.on('pollution:levelDown', (data) => {
            this.showInfo(`污染减轻：${data.oldLevel.name} → ${data.newLevel.name}`, 'success');
        });

        this.eventBus.on('pollution:negativeEventTriggered', (data) => {
            this.showInfo(`发生了负面事件：${data.event.name}`, 'danger');
        });

        this.eventBus.on('livestock:wildAnimalSpawned', (data) => {
            this.showInfo(`一只${data.name}出现在田地附近！`, 'info');
            this.renderWildAnimals();
        });

        this.eventBus.on('livestock:wildAnimalDeparted', (data) => {
            this.showInfo(`${data.name}离开了。`, 'info');
            this.renderWildAnimals();
        });

        this.eventBus.on('livestock:baitPlaced', (data) => {
            this.showInfo(`放置了${data.cropName}作为诱饵！`, 'info');
            this.renderBaits();
        });

        this.eventBus.on('livestock:baitExpired', (data) => {
            this.showInfo(`诱饵${data.cropName}已失效。`, 'info');
            this.renderBaits();
        });

        this.eventBus.on('livestock:captureSuccess', (data) => {
            this.showInfo(`成功捕获了${data.wildAnimal.name}！`, 'success');
            this.renderBarn();
            this.renderWildAnimals();
        });

        this.eventBus.on('livestock:captureFailed', (data) => {
            this.showInfo(`捕获失败：${data.reason}`, 'warning');
            if (data.reason === '该动物已不存在' || data.reason === '捕捉失败，动物逃跑了') {
                this.renderWildAnimals();
            }
        });

        this.eventBus.on('livestock:animalProduced', (data) => {
            this.showInfo(`${data.productName}×${data.amount}`, 'success');
        });

        this.eventBus.on('livestock:barnUpgraded', (data) => {
            this.showInfo(`畜栏升级成功！容量提升到${data.capacity}`, 'success');
            this.renderBarnInfo();
        });

        this.eventBus.on('livestock:upgradeFailed', (data) => {
            this.showInfo(`升级失败：${data.reason}`, 'warning');
        });

        this.eventBus.on('ui:switchToFields', () => {
            this.switchToFields();
        });

        this.eventBus.on('ui:switchToBarn', () => {
            this.switchToBarn();
        });

        this.eventBus.on('input:showSleep', () => {
            this.showModal('sleep');
            this.renderSleepContent();
        });

        this.eventBus.on('input:hideSleep', () => {
            this.hideModal('sleep');
        });

        this.eventBus.on('sleep:completed', (data) => {
            this.hideModal('sleep');
            const hoursText = data.hoursSlept.toFixed(1);
            if (data.isPoorSleep) {
                this.showInfo(`只睡了${hoursText}小时，感觉不太好...`, 'warning');
            } else {
                this.showInfo(`睡了${hoursText}小时，精神焕发！`, 'success');
            }
        });

        this.eventBus.on('sleep:debuffAdded', (data) => {
            this.showInfo(`出现睡眠不足Debuff：${data.reason}`, 'danger');
        });

        this.eventBus.on('sleep:debuffRemoved', (data) => {
            this.showInfo('睡眠不足Debuff已消失', 'success');
        });

        this.eventBus.on('input:showExploration', () => {
            this.showModal('exploration');
            this.renderExplorationContent('exploration-map');
            this.bindExplorationTabs();
        });

        this.eventBus.on('input:hideExploration', () => {
            this.hideModal('exploration');
        });

        this.eventBus.on('input:hideArtifactRead', () => {
            this.hideModal('artifactRead');
        });

        this.eventBus.on('exploration:regionUnlocked', (data) => {
            this.showInfo(`新区域解锁：${data.regionName}！`, 'info');
            if (this.modals.exploration && this.modals.exploration.classList.contains('active')) {
                this.renderExplorationContent(this.currentExplorationTab);
            }
        });

        this.eventBus.on('exploration:regionsUpdated', () => {
            if (this.modals.exploration && this.modals.exploration.classList.contains('active')) {
                this.renderExplorationContent(this.currentExplorationTab);
            }
        });

        this.eventBus.on('exploration:started', (data) => {
            this.showInfo(`开始探索${data.regionName}...`);
            this.showExplorationProgress();
        });

        this.eventBus.on('exploration:progressUpdated', (data) => {
            this.updateExplorationProgress(data.progress);
        });

        this.eventBus.on('exploration:completed', (data) => {
            this.hideExplorationProgress();
            const rewardTexts = [];
            if (data.rewards.money > 0) rewardTexts.push(`${data.rewards.money}金币`);
            if (data.rewards.seeds.length > 0) rewardTexts.push('种子');
            if (data.rewards.items.length > 0) rewardTexts.push('物品');
            if (data.rewards.artifacts.length > 0) rewardTexts.push('文物');
            this.showInfo(`探索${data.regionName}完成！获得：${rewardTexts.join('、')}`, 'success');
            this.renderExplorationContent(this.currentExplorationTab);
        });

        this.eventBus.on('exploration:mysteryEvent', (data) => {
            this.showMysteryEvent(data);
        });

        this.eventBus.on('exploration:artifactFound', (data) => {
            this.showInfo(`发现了${data.artifact.name}！`, 'success');
        });

        this.eventBus.on('exploration:artifactRead', (data) => {
            this.hideModal('artifactRead');
            let message = `阅读了${data.artifact.name}。`;
            if (data.results.passiveTalent) {
                message += ` 解锁天赋：${data.results.passiveTalent.name}！`;
            }
            this.showInfo(message, data.results.sanityLoss > 0 ? 'warning' : 'info');
            this.renderExplorationContent(this.currentExplorationTab);
        });

        this.eventBus.on('exploration:error', (data) => {
            this.showInfo(data.message, 'warning');
        });

        this.eventBus.on('exploration:eventResolved', (data) => {
            this.hideModal('mysteryEvent');
            if (data.result.message) {
                this.showInfo(data.result.message, 
                    data.result.sanityChange < 0 ? 'warning' : 
                    data.result.sanityChange > 0 ? 'success' : 'info');
            }
        });

        this.eventBus.on('ui:switchToPond', () => {
            this.switchToPond();
        });

        this.eventBus.on('farming:pondUpdated', () => {
            if (this.currentView === 'pond') {
                this.renderPond();
            }
        });

        this.eventBus.on('farming:pondUnlocked', (data) => {
            this.showInfo(`池塘区域已解锁！花费 ${data.cost} 金币`, 'success');
        });

        this.eventBus.on('farming:pondFieldUnlocked', (data) => {
            this.showInfo(`池塘地块已解锁！花费 ${data.price} 金币`, 'success');
            if (this.currentView === 'pond') {
                this.renderPond();
            }
        });
    }

    switchToGameScreen() {
        this.mainMenu.classList.remove('active');
        this.mainMenu.classList.add('hidden');
        
        this.gameScreen.classList.remove('hidden');
        this.gameScreen.classList.add('active');
        
        this.updateAllDisplays();
    }

    switchToMainMenu() {
        this.gameScreen.classList.remove('active');
        this.gameScreen.classList.add('hidden');
        
        this.mainMenu.classList.remove('hidden');
        this.mainMenu.classList.add('active');
    }

    updateAllDisplays() {
        this.updateTimeDisplay();
        this.updateMoneyDisplay();
        this.updateSanityDisplay();
        this.updatePollutionDisplay();
        this.effectManager.updateDayNightTheme(this.timeModule.isNight());
    }

    switchToFields() {
        this.currentView = 'fields';
        this.fieldsView.classList.remove('hidden');
        this.fieldsView.classList.add('active');
        this.barnView.classList.remove('active');
        this.barnView.classList.add('hidden');
        if (this.pondView) {
            this.pondView.classList.remove('active');
            this.pondView.classList.add('hidden');
        }
        
        if (this.navLeft) this.navLeft.style.visibility = 'hidden';
        if (this.navRight) this.navRight.style.visibility = 'visible';
        
        this.renderFields();
        this.renderWildAnimals();
        this.renderBaits();
    }

    switchToBarn() {
        this.currentView = 'barn';
        this.barnView.classList.remove('hidden');
        this.barnView.classList.add('active');
        this.fieldsView.classList.remove('active');
        this.fieldsView.classList.add('hidden');
        if (this.pondView) {
            this.pondView.classList.remove('active');
            this.pondView.classList.add('hidden');
        }
        
        if (this.navLeft) this.navLeft.style.visibility = 'visible';
        if (this.navRight) this.navRight.style.visibility = 'visible';
        
        this.renderBarn();
    }

    switchToPond() {
        const isPondUnlocked = this.farmingModule ? this.farmingModule.isPondUnlocked() : false;
        
        if (!isPondUnlocked) {
            const check = this.farmingModule ? this.farmingModule.canUnlockPond() : null;
            if (check && check.canUnlock) {
                this.showInfo(`池塘区域需要解锁：花费 ${check.cost} 金币`, 'info');
                this.eventBus.emit('farming:showPondUnlockOption', check);
            } else {
                this.showInfo(check ? check.reason : '池塘区域尚未解锁', 'warning');
            }
            return;
        }

        this.currentView = 'pond';
        if (this.pondView) {
            this.pondView.classList.remove('hidden');
            this.pondView.classList.add('active');
        }
        this.fieldsView.classList.remove('active');
        this.fieldsView.classList.add('hidden');
        this.barnView.classList.remove('active');
        this.barnView.classList.add('hidden');
        
        if (this.navLeft) this.navLeft.style.visibility = 'visible';
        if (this.navRight) this.navRight.style.visibility = 'visible';
        
        this.renderPond();
    }

    updateSanityDisplay() {
        const sanity = this.sanityModule ? this.sanityModule.getSanity() : this.gameState.getSanity();
        const level = this.sanityModule ? this.sanityModule.getSanityLevel() : null;
        const progress = (sanity / 100) * 100;
        
        if (this.sanityProgress) {
            this.sanityProgress.style.width = `${progress}%`;
        }
        if (this.sanityDisplay) {
            this.sanityDisplay.textContent = sanity;
        }
        if (this.sanityLevel && level) {
            this.sanityLevel.textContent = level.name;
        }
    }

    updatePollutionDisplay() {
        const pollution = this.pollutionModule ? this.pollutionModule.getPollution() : this.gameState.getPollution();
        const level = this.pollutionModule ? this.pollutionModule.getPollutionLevel() : null;
        const progress = (pollution / 100) * 100;
        
        if (this.pollutionProgress) {
            this.pollutionProgress.style.width = `${progress}%`;
        }
        if (this.pollutionDisplay) {
            this.pollutionDisplay.textContent = pollution;
        }
        if (this.pollutionLevel && level) {
            this.pollutionLevel.textContent = level.name;
        }
    }

    renderBarn() {
        this.renderBarnInfo();
        this.renderBarnAnimals();
    }

    renderBarnInfo() {
        if (!this.barnInfo || !this.livestockModule) return;
        
        const barnLevel = this.livestockModule.getBarnLevel();
        const capacity = this.livestockModule.getBarnCapacity();
        const animalCount = this.livestockModule.getAnimalCount();
        const upgradeCost = this.livestockModule.getUpgradeCost();
        
        this.barnInfo.innerHTML = `
            <div class="barn-stats">
                <span>等级: ${barnLevel}</span>
                <span>容量: ${animalCount}/${capacity}</span>
            </div>
            <div class="barn-upgrade">
                <button class="upgrade-barn-btn" id="upgrade-barn">
                    升级畜栏 (${upgradeCost}金币)
                </button>
            </div>
        `;

        const upgradeBtn = document.getElementById('upgrade-barn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.eventBus.emit('input:upgradeBarn');
            });
        }
    }

    renderBarnAnimals() {
        if (!this.barnContainer || !this.livestockModule) return;
        
        const animals = this.livestockModule.getAnimals();
        const AnimalConfig = window.AnimalConfig || {};
        const PlantConfig = window.PlantConfig || {};
        
        this.barnContainer.innerHTML = '';
        
        if (animals.length === 0) {
            this.barnContainer.innerHTML = `
                <div class="empty-barn">
                    <p>畜栏是空的</p>
                    <p class="hint">在田地附近捕捉野生动物</p>
                </div>
            `;
            return;
        }
        
        animals.forEach((animal, index) => {
            const animalElement = document.createElement('div');
            animalElement.className = 'animal-card';
            animalElement.dataset.animalId = animal.id;
            
            const timeUntilProduct = this.livestockModule.getTimeUntilProduct ? 
                this.livestockModule.getTimeUntilProduct(index) : 'N/A';
            
            const isReady = timeUntilProduct === '已就绪';
            const isHungry = animal.hungry;
            
            animalElement.innerHTML = `
                <div class="animal-icon">${this.getAnimalEmoji(animal.type)}</div>
                <div class="animal-name">${animal.name || animal.type}</div>
                <div class="animal-status">
                    ${isReady ? '<span class="product-ready">产品就绪</span>' : 
                      `<span class="product-timer">下次产出: ${timeUntilProduct}</span>`}
                    ${isHungry ? '<span class="hungry-indicator">饥饿</span>' : ''}
                </div>
                <div class="animal-actions">
                    ${isReady ? 
                        `<button class="collect-btn" data-collect-id="${animal.id}">收集</button>` : 
                        ''}
                    ${isHungry ? 
                        `<button class="feed-btn" data-feed-id="${animal.id}">喂食</button>` : 
                        ''}
                    <button class="sell-btn" data-sell-id="${animal.id}">出售</button>
                </div>
            `;
            
            if (isReady) {
                const collectBtn = animalElement.querySelector('.collect-btn');
                if (collectBtn) {
                    collectBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.eventBus.emit('livestock:collectProduct', animal.id);
                    });
                }
            }
            
            if (isHungry) {
                const feedBtn = animalElement.querySelector('.feed-btn');
                if (feedBtn) {
                    feedBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.showFeedSelection(animal.id, animal.type, animal.name || animal.type);
                    });
                }
            }

            const sellBtn = animalElement.querySelector('.sell-btn');
            if (sellBtn) {
                sellBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.eventBus.emit('ui:sellAnimal', { animalId: animal.id });
                });
            }
            
            this.barnContainer.appendChild(animalElement);
        });
    }

    showFeedSelection(animalId, animalType, animalName) {
        const PlantConfig = window.PlantConfig || {};
        const feedableCrops = PlantConfig.getFeedCropsByAnimal ? PlantConfig.getFeedCropsByAnimal(animalType) : [];

        const availableFeedCrops = [];
        feedableCrops.forEach(crop => {
            const count = this.gameState.getCropCount(crop.id);
            if (count > 0) {
                availableFeedCrops.push({ ...crop, count });
            }
        });

        const existingModal = document.getElementById('feed-selection-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'feed-selection-modal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>喂食 ${animalName}</h2>
                    <button class="close-btn" id="close-feed-modal">×</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 1rem; color: var(--ash-gray);">选择喂食的作物（喜欢的食物会让动物更快乐）：</p>
                    <div class="inventory-content" id="feed-selection-content"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const content = document.getElementById('feed-selection-content');
        
        const defaultOption = this.createItemCard(
            'default',
            '普通饲料',
            '使用默认饲料喂食（无快乐加成）',
            '∞',
            'crop'
        );
        defaultOption.addEventListener('click', () => {
            this.eventBus.emit('ui:feedAnimal', { animalId: animalId, cropType: null });
            modal.remove();
        });
        content.appendChild(defaultOption);

        if (availableFeedCrops.length > 0) {
            availableFeedCrops.forEach(crop => {
                const card = this.createItemCard(
                    crop.id,
                    crop.name,
                    crop.description + ' (快乐+15)',
                    crop.count,
                    'crop'
                );
                card.addEventListener('click', () => {
                    this.eventBus.emit('ui:feedAnimal', { animalId: animalId, cropType: crop.id });
                    modal.remove();
                });
                content.appendChild(card);
            });
        }

        document.getElementById('close-feed-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    updateTimeDisplay() {
        const timeString = this.timeModule.getFormattedTime();
        const day = this.timeModule.getDay();
        const seasonName = this.timeModule.getSeasonName();
        
        this.currentTime.textContent = `时间: ${timeString}`;
        this.currentDay.textContent = `第 ${day} 天`;
        this.currentSeason.textContent = `季节: ${seasonName}`;
        
        const progress = this.timeModule.getDayProgress() * 100;
        this.timeProgress.style.width = `${progress}%`;
        this.timeIndicator.style.left = `${progress}%`;
    }

    updateMoneyDisplay() {
        this.moneyDisplay.textContent = this.gameState.getMoney();
    }

    showInfo(message, logType = 'info') {
        this.infoContent.textContent = message;
        this.animationManager.animateInfoPanel();
        this.effectManager.showToast(message);
        this.gameState.addDialogLog(message, logType);
    }

    renderLogContent() {
        const logs = this.gameState.getDialogLog(50);
        
        if (logs.length === 0) {
            this.logContent.innerHTML = '<div style="text-align: center; opacity: 0.7;">暂无日志记录</div>';
            return;
        }

        this.logContent.innerHTML = '';
        
        logs.forEach((log, index) => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.dataset.logType = log.type;
            
            const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';
            
            logEntry.innerHTML = `
                <div class="log-time">${timestamp}</div>
                <div class="log-message">${log.message}</div>
            `;
            
            this.logContent.appendChild(logEntry);
        });

        if (this.logContent.firstChild) {
            this.logContent.firstChild.scrollIntoView({ behavior: 'auto' });
        }
    }

    showModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('active');
        }
    }

    hideModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.remove('active');
            modal.classList.add('hidden');
        }
    }

    renderFields() {
        const PlantConfig = window.PlantConfig || {};
        const fields = this.farmingModule.getAllFields();
        const unlockedCount = fields.filter(f => f.unlocked).length;
        
        this.fieldsContainer.innerHTML = '';
        
        fields.forEach((field, index) => {
            const fieldElement = document.createElement('div');
            fieldElement.className = 'field';
            fieldElement.dataset.fieldId = index;
            
            if (field.fieldType) {
                fieldElement.classList.add(`field-type-${field.fieldType}`);
            }
            
            if (!field.unlocked) {
                fieldElement.classList.add('locked');
                const unlockPrice = this.farmingModule.getUnlockPrice ? 
                    this.farmingModule.getUnlockPrice(index) : 0;
                fieldElement.innerHTML = `
                    <div class="field-content">
                        <div class="locked-indicator">未解锁</div>
                        <div class="unlock-price">解锁: ${unlockPrice}金币</div>
                    </div>
                `;
                fieldElement.addEventListener('click', () => {
                    this.eventBus.emit('farming:fieldClicked', index);
                });
            } else if (!field.plant) {
                fieldElement.innerHTML = `
                    <div class="field-content">空地</div>
                    <div class="field-status">
                        <span class="water-indicator">${field.watered ? '已浇水' : '未浇水'}</span>
                        <span class="fertilizer-indicator">${field.fertilized ? '已施肥' : '未施肥'}</span>
                    </div>
                `;
                fieldElement.addEventListener('click', () => {
                    this.eventBus.emit('farming:fieldClicked', index);
                });
            } else {
                const plantData = PlantConfig.getPlant ? 
                    PlantConfig.getPlant(field.plant) : PlantConfig[field.plant];
                
                if (!plantData) return;
                
                const stageText = plantData.stages[field.stage];
                const isReady = field.stage >= plantData.stages.length - 1;
                
                const stageClass = `plant-stage-${Math.min(field.stage, 3)}`;
                fieldElement.innerHTML = `
                    <div class="field-content">
                        <div class="plant-breathing ${stageClass}">${stageText}</div>
                    </div>
                    <div class="field-status">
                        <span class="water-indicator">${field.watered ? '已浇水' : '未浇水'}</span>
                        <span class="fertilizer-indicator">${field.fertilized ? '已施肥' : '未施肥'}</span>
                    </div>
                `;
                
                if (isReady) {
                    fieldElement.classList.add('ready-to-harvest');
                }
                
                fieldElement.addEventListener('click', () => {
                    this.eventBus.emit('farming:fieldClicked', index);
                });
            }
            
            this.fieldsContainer.appendChild(fieldElement);
        });
    }

    renderBackpackContent(tabType) {
        const PlantConfig = window.PlantConfig || {};
        const summary = this.economyModule.getInventorySummary();
        
        this.backpackContent.innerHTML = '';

        if (tabType === 'seeds') {
            if (summary.seeds.length === 0) {
                this.backpackContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">背包中没有种子</div>';
                return;
            }

            summary.seeds.forEach(seed => {
                const seasonNames = seed.seasons.map(s => this.timeModule.state.seasonNames[s]).join('、');
                const card = this.createItemCard(
                    seed.type,
                    seed.name,
                    `可在${seasonNames}季种植`,
                    seed.count,
                    'seed'
                );
                
                const selectedSeed = this.farmingModule.getSelectedSeed();
                if (selectedSeed === seed.type) {
                    card.classList.add('selected');
                }

                card.addEventListener('click', () => {
                    document.querySelectorAll('.item-card.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    card.classList.add('selected');
                    this.eventBus.emit('ui:seedSelected', seed.type);
                });
                
                this.backpackContent.appendChild(card);
            });
        } else if (tabType === 'crops') {
            if (summary.crops.length === 0) {
                this.backpackContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">背包中没有作物</div>';
                return;
            }

            summary.crops.forEach(crop => {
                const card = this.createItemCard(
                    crop.type,
                    crop.name,
                    `售价: ${crop.sellPrice}金币`,
                    crop.count,
                    'crop'
                );
                this.backpackContent.appendChild(card);
            });
        } else if (tabType === 'items') {
            const hasFertilizers = summary.fertilizers.length > 0;
            const hasTools = summary.captureTools && summary.captureTools.length > 0;
            
            if (!hasFertilizers && !hasTools) {
                this.backpackContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">背包中没有物品</div>';
                return;
            }

            if (hasFertilizers) {
                const fertilizerHeader = document.createElement('div');
                fertilizerHeader.style.cssText = 'grid-column: 1/-1; font-size: 1rem; color: var(--old-cyan); margin-bottom: 0.5rem; border-bottom: 1px solid var(--shadow-gray); padding-bottom: 0.25rem;';
                fertilizerHeader.textContent = '肥料';
                this.backpackContent.appendChild(fertilizerHeader);
                
                summary.fertilizers.forEach(fertilizer => {
                    const card = this.createItemCard(
                        fertilizer.type,
                        fertilizer.name,
                        fertilizer.description,
                        fertilizer.count,
                        'fertilizer'
                    );
                    this.backpackContent.appendChild(card);
                });
            }

            if (hasTools) {
                const toolHeader = document.createElement('div');
                toolHeader.style.cssText = 'grid-column: 1/-1; font-size: 1rem; color: var(--old-cyan); margin-bottom: 0.5rem; border-bottom: 1px solid var(--shadow-gray); padding-bottom: 0.25rem;';
                toolHeader.textContent = '捕捉工具';
                this.backpackContent.appendChild(toolHeader);
                
                summary.captureTools.forEach(tool => {
                    const card = this.createItemCard(
                        tool.type,
                        tool.name,
                        tool.description,
                        tool.count,
                        'tool'
                    );
                    this.backpackContent.appendChild(card);
                });
            }
        }
    }

    renderMerchantContent(tabType) {
        const PlantConfig = window.PlantConfig || {};
        
        this.merchantContent.innerHTML = '';

        if (tabType === 'merchant-seeds') {
            const currentSeason = this.timeModule.getSeason();
            const seeds = this.economyModule.getAvailableSeedsForCurrentSeason();
            
            if (seeds.length === 0) {
                this.merchantContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">当前季节没有可用的种子</div>';
                return;
            }

            seeds.forEach(seed => {
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-name">${seed.name}种子</div>
                    <div class="item-info">${seed.description}</div>
                    <div class="item-info">生长时间: ${seed.growthTime.hours}小时</div>
                    <div class="item-price">${seed.buyPrice}金币</div>
                `;
                
                card.addEventListener('click', () => {
                    this.eventBus.emit('ui:buySeed', seed.id);
                });
                
                this.merchantContent.appendChild(card);
            });
        } else if (tabType === 'merchant-crops') {
            const crops = this.economyModule.getAllAvailableCropsForSale ? 
                this.economyModule.getAllAvailableCropsForSale() : [];
            
            if (crops.length === 0) {
                this.merchantContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">暂无作物售卖</div>';
                return;
            }

            crops.forEach(crop => {
                const animalUseInfo = this._getAnimalUseInfo(crop);
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-name">${crop.name}</div>
                    <div class="item-info">${crop.description}</div>
                    ${animalUseInfo ? `<div class="item-info" style="font-size: 0.85rem; color: var(--primary-green);">${animalUseInfo}</div>` : ''}
                    <div class="item-price">${crop.buyPrice}金币</div>
                `;
                
                card.addEventListener('click', () => {
                    this.eventBus.emit('ui:buyCrop', crop.id);
                });
                
                this.merchantContent.appendChild(card);
            });
        } else if (tabType === 'merchant-fertilizer') {
            const fertilizers = this.economyModule.getAllFertilizers();
            
            fertilizers.forEach(fertilizer => {
                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-name">${fertilizer.name}</div>
                    <div class="item-info">${fertilizer.description}</div>
                    <div class="item-price">${fertilizer.buyPrice}金币</div>
                `;
                
                card.addEventListener('click', () => {
                    this.eventBus.emit('ui:buyFertilizer', fertilizer.id);
                });
                
                this.merchantContent.appendChild(card);
            });
        } else if (tabType === 'merchant-traps') {
            const AnimalConfig = window.AnimalConfig || {};
            const traps = this.economyModule.getAllAvailableTrapsForSale ? 
                this.economyModule.getAllAvailableTrapsForSale() : [];
            
            if (traps.length === 0) {
                this.merchantContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">暂无陷阱售卖</div>';
                return;
            }

            const currentTraps = this.gameState.getAvailableCaptureTools ? 
                this.gameState.getAvailableCaptureTools() : [];
            const trapCounts = {};
            currentTraps.forEach(t => {
                trapCounts[t.type] = t.count;
            });

            traps.forEach(trap => {
                const extraInfo = [];
                if (trap.captureBonus > 0) {
                    extraInfo.push(`捕捉加成+${Math.round(trap.captureBonus * 100)}%`);
                }
                if (trap.canCaptureRare) {
                    extraInfo.push('可捕捉稀有动物');
                }
                if (trap.canCaptureTaboo) {
                    extraInfo.push('可捕捉禁忌生物');
                }
                const currentCount = trapCounts[trap.id] || 0;

                const card = document.createElement('div');
                card.className = 'item-card';
                card.innerHTML = `
                    <div class="item-name">${trap.name}</div>
                    <div class="item-info">${trap.description}</div>
                    ${extraInfo.length > 0 ? `<div class="item-info" style="font-size: 0.85rem; color: var(--primary-green);">${extraInfo.join('、')}</div>` : ''}
                    <div class="item-price">${trap.buyPrice}金币</div>
                    <div class="item-info" style="font-size: 0.8rem; opacity: 0.7;">当前持有: ${currentCount}个</div>
                `;
                
                card.addEventListener('click', () => {
                    this.eventBus.emit('ui:buyTrap', trap.id);
                });
                
                this.merchantContent.appendChild(card);
            });
        }
    }

    _getAnimalUseInfo(crop) {
        const infoParts = [];
        
        if (crop.animalFeed && crop.animalFeed.length > 0) {
            infoParts.push(`可喂食`);
        }
        if (crop.animalBait && crop.animalBait.length > 0) {
            infoParts.push(`可引诱`);
        }
        if (crop.captureBonus && crop.captureBonus > 0) {
            infoParts.push(`捕捉+${(crop.captureBonus * 100).toFixed(0)}%`);
        }
        
        if (infoParts.length > 0) {
            return `动物用途: ${infoParts.join('、')}`;
        }
        return null;
    }

    renderMarketContent() {
        const PlantConfig = window.PlantConfig || {};
        const prices = this.economyModule.getAllMarketPrices();
        
        this.marketContent.innerHTML = '';

        prices.forEach(priceData => {
            const priceDiff = priceData.currentPrice - priceData.basePrice;
            const priceDiffPercent = Math.round((priceDiff / priceData.basePrice) * 100);
            
            const priceClass = priceDiff > 0 ? 'price-up' : priceDiff < 0 ? 'price-down' : 'price-flat';
            const priceDiffText = priceDiff > 0 ? `+${priceDiffPercent}%` : priceDiff < 0 ? `${priceDiffPercent}%` : '平价';

            const card = document.createElement('div');
            card.className = 'item-card';
            
            card.innerHTML = `
                <div class="item-name">${priceData.plantName}</div>
                <div class="item-info">基础价格: ${priceData.basePrice}金币</div>
                <div class="item-price ${priceClass}">
                    ${priceData.currentPrice}金币 (${priceDiffText})
                </div>
                ${priceData.hasCrop ? `<div class="item-info" style="margin-top: 0.5rem;">背包中: ${priceData.cropCount}个</div>` : ''}
            `;

            if (priceData.hasCrop) {
                card.addEventListener('click', () => {
                    this.eventBus.emit('ui:sellCrop', priceData.plantType);
                });
                card.style.cursor = 'pointer';
            } else {
                card.style.opacity = '0.6';
                card.style.cursor = 'not-allowed';
            }

            this.marketContent.appendChild(card);
        });
    }

    renderWarehouseContent() {
        const PlantConfig = window.PlantConfig || {};
        const items = this.economyModule.getWarehouseItems();
        
        this.warehouseContent.innerHTML = '';

        if (items.length === 0) {
            this.warehouseContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">仓库中没有物品</div>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            
            const seasonNames = item.seasons ? 
                item.seasons.map(s => this.timeModule.state.seasonNames[s]).join('、') : '';
            
            card.innerHTML = `
                <div class="item-name">${item.name}${item.category === 'seeds' ? '种子' : ''}</div>
                <div class="item-info">${item.description || (seasonNames ? `可在${seasonNames}季种植` : '')}</div>
                <div class="item-count">${item.count}</div>
                <div class="action-buttons" style="margin-top: 0.5rem;">
                    <button class="action-btn" style="font-size: 0.8rem;">取出</button>
                </div>
            `;

            const takeOutBtn = card.querySelector('.action-btn');
            takeOutBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.eventBus.emit('ui:moveFromWarehouse', {
                    itemType: item.itemType,
                    category: item.category
                });
            });

            this.warehouseContent.appendChild(card);
        });
    }

    createItemCard(itemType, name, info, count, itemCategory) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.itemType = itemType;
        card.dataset.itemCategory = itemCategory;

        card.innerHTML = `
            <div class="item-name">${name}</div>
            <div class="item-info">${info}</div>
            <div class="item-count">${count}</div>
        `;

        return card;
    }

    updateBackpackTabSelection(seedType) {
        document.querySelectorAll('.item-card.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`.item-card[data-item-type="${seedType}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }

    renderBaits() {
        const PlantConfig = window.PlantConfig || {};
        if (!this.baitArea || !this.livestockModule) return;

        const activeBaits = this.livestockModule.getActiveBaits();
        const canPlaceBait = this.livestockModule.canPlaceBait();

        this.baitArea.innerHTML = '';

        const baitHeader = document.createElement('div');
        baitHeader.className = 'bait-header';
        baitHeader.innerHTML = `
            <span class="bait-title">诱饵区域 (${activeBaits.length}/3)</span>
            ${canPlaceBait ? `<button class="place-bait-btn" id="place-bait-btn">放置诱饵</button>` : ''}
        `;
        this.baitArea.appendChild(baitHeader);

        if (activeBaits.length > 0) {
            const baitContainer = document.createElement('div');
            baitContainer.className = 'bait-container';

            activeBaits.forEach(bait => {
                const baitCard = document.createElement('div');
                baitCard.className = 'bait-card';

                const currentTime = this.timeModule.getDay() * 24 + this.timeModule.getHour();
                const remainingHours = Math.max(0, bait.duration - (currentTime - bait.placedTime));

                baitCard.innerHTML = `
                    <div class="bait-emoji">🥕</div>
                    <div class="bait-info">
                        <div class="bait-name">${bait.cropName}</div>
                        <div class="bait-target">引诱: ${bait.targetAnimals.map(a => this.getAnimalEmoji(a)).join(' ')}</div>
                        <div class="bait-duration">剩余: ${remainingHours}小时</div>
                    </div>
                `;

                baitContainer.appendChild(baitCard);
            });

            this.baitArea.appendChild(baitContainer);
        }

        const placeBaitBtn = document.getElementById('place-bait-btn');
        if (placeBaitBtn) {
            placeBaitBtn.addEventListener('click', () => {
                this.showBaitSelection();
            });
        }
    }

    showBaitSelection() {
        const PlantConfig = window.PlantConfig || {};
        const baitableCrops = PlantConfig.getBaitableCrops ? PlantConfig.getBaitableCrops() : [];

        if (baitableCrops.length === 0) {
            this.showInfo('没有可用作诱饵的作物。', 'warning');
            return;
        }

        const availableBaitCrops = [];
        baitableCrops.forEach(crop => {
            const count = this.gameState.getCropCount(crop.id);
            if (count > 0) {
                availableBaitCrops.push({ ...crop, count });
            }
        });

        if (availableBaitCrops.length === 0) {
            this.showInfo('背包中没有可用作诱饵的作物。', 'warning');
            return;
        }

        const existingModal = document.getElementById('bait-selection-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'bait-selection-modal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>选择诱饵作物</h2>
                    <button class="close-btn" id="close-bait-modal">×</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 1rem; color: var(--ash-gray);">选择用作诱饵的作物：</p>
                    <div class="inventory-content" id="bait-selection-content"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const content = document.getElementById('bait-selection-content');
        availableBaitCrops.forEach(crop => {
            const card = this.createItemCard(
                crop.id,
                crop.name,
                crop.description + ' (引诱: ' + (crop.animalBait ? crop.animalBait.map(a => this.getAnimalEmoji(a)).join(' ') : '') + ')',
                crop.count,
                'crop'
            );
            card.addEventListener('click', () => {
                this.eventBus.emit('ui:placeBait', { cropType: crop.id });
                modal.remove();
            });
            content.appendChild(card);
        });

        document.getElementById('close-bait-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderWildAnimals() {
        const wildAnimalsArea = document.getElementById('wild-animals-area');
        if (!wildAnimalsArea || !this.livestockModule) return;

        const wildAnimals = this.livestockModule.getWildAnimals();
        
        if (wildAnimals.length === 0) {
            wildAnimalsArea.innerHTML = '';
            wildAnimalsArea.style.display = 'none';
            return;
        }

        wildAnimalsArea.style.display = 'flex';
        wildAnimalsArea.innerHTML = '';

        const availableTools = this.gameState.getAvailableCaptureTools();

        wildAnimals.forEach(animal => {
            const animalCard = document.createElement('div');
            animalCard.className = 'wild-animal-card';
            animalCard.dataset.wildAnimalId = animal.id;

            const rarityClass = `rarity-${animal.rarity}`;
            animalCard.classList.add(rarityClass);

            animalCard.innerHTML = `
                <div class="wild-animal-icon">${this.getAnimalEmoji(animal.type)}</div>
                <div class="wild-animal-name">${animal.name}</div>
                <div class="wild-animal-desc">${animal.description}</div>
                <div class="wild-animal-capture">
                    ${availableTools.length > 0 ? 
                        `<button class="capture-btn" data-wild-id="${animal.id}">捕捉</button>` : 
                        `<span class="no-tools">需要捕捉工具</span>`}
                </div>
            `;

            if (availableTools.length > 0) {
                const captureBtn = animalCard.querySelector('.capture-btn');
                captureBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showCaptureToolSelection(animal.id, animal.name);
                });
            }

            wildAnimalsArea.appendChild(animalCard);
        });
    }

    getAnimalEmoji(animalType) {
        const emojiMap = {
            'gray_rabbit': '🐰',
            'dark_fox': '🦊',
            'pale_chicken': '🐔',
            'shadow_goat': '🐐',
            'pale_deer': '🦌',
            'twisted_owl': '🦉',
            'slimy_toad': '🐸',
            'domestic_rabbit': '🐰',
            'domestic_fox': '🦊',
            'domestic_chicken': '🐔',
            'domestic_goat': '🐐',
            'domestic_deer': '🦌',
            'domestic_owl': '🦉',
            'domestic_toad': '🐸'
        };
        return emojiMap[animalType] || '🦇';
    }

    showCaptureToolSelection(wildAnimalId, animalName) {
        const PlantConfig = window.PlantConfig || {};
        const availableTools = this.gameState.getAvailableCaptureTools();
        
        if (availableTools.length === 0) {
            this.showInfo('没有可用的捕捉工具，请先在商店购买。', 'warning');
            return;
        }

        const wildAnimal = this.livestockModule.getWildAnimals().find(a => a.id === wildAnimalId);

        const captureBonusCrops = [];
        const baitableCrops = PlantConfig.getBaitableCrops ? PlantConfig.getBaitableCrops() : [];
        baitableCrops.forEach(crop => {
            if (crop.captureBonus && crop.captureBonus > 0) {
                const count = this.gameState.getCropCount(crop.id);
                if (count > 0) {
                    captureBonusCrops.push({ ...crop, count });
                }
            }
        });

        const existingModal = document.getElementById('capture-tool-selection-modal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'capture-tool-selection-modal';
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>捕捉 ${animalName}</h2>
                    <button class="close-btn" id="close-capture-modal">×</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 0.5rem; color: var(--ash-gray);">选择捕捉工具：</p>
                    <div class="inventory-content" id="capture-tool-selection-content"></div>
                    ${captureBonusCrops.length > 0 ? `
                        <p style="margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--ash-gray);">可选：使用作物增加捕捉成功率</p>
                        <div class="inventory-content" id="capture-bait-selection-content"></div>
                    ` : ''}
                </div>
                <div class="modal-footer" style="padding: 1rem; border-top: 1px solid var(--border-color);">
                    <span id="capture-selection-hint" style="color: var(--ash-gray); font-size: 0.9rem;">
                        已选择工具: <span id="selected-tool-display">无</span>
                        ${captureBonusCrops.length > 0 ? ` | 诱饵: <span id="selected-bait-display">无</span>` : ''}
                    </span>
                    <button class="confirm-btn" id="confirm-capture-btn" style="display: none;">确认捕捉</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        let selectedToolType = null;
        let selectedBaitType = null;

        const updateSelection = () => {
            const toolDisplay = document.getElementById('selected-tool-display');
            const confirmBtn = document.getElementById('confirm-capture-btn');
            
            if (toolDisplay && selectedToolType) {
                toolDisplay.textContent = selectedToolType;
            }
            
            if (confirmBtn) {
                confirmBtn.style.display = selectedToolType ? 'inline-block' : 'none';
            }
        };

        const content = document.getElementById('capture-tool-selection-content');
        availableTools.forEach(tool => {
            const card = this.createItemCard(
                tool.type,
                tool.name,
                tool.description,
                tool.count,
                'tool'
            );
            card.addEventListener('click', () => {
                document.querySelectorAll('#capture-tool-selection-content .item-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedToolType = tool.type;
                updateSelection();
            });
            content.appendChild(card);
        });

        const baitContent = document.getElementById('capture-bait-selection-content');
        if (baitContent && captureBonusCrops.length > 0) {
            const noneOption = this.createItemCard(
                'none',
                '不使用诱饵',
                '不使用任何作物作为诱饵',
                '',
                'crop'
            );
            noneOption.addEventListener('click', () => {
                document.querySelectorAll('#capture-bait-selection-content .item-card').forEach(c => c.classList.remove('selected'));
                noneOption.classList.add('selected');
                selectedBaitType = null;
                const baitDisplay = document.getElementById('selected-bait-display');
                if (baitDisplay) baitDisplay.textContent = '无';
            });
            baitContent.appendChild(noneOption);

            captureBonusCrops.forEach(crop => {
                const card = this.createItemCard(
                    crop.id,
                    crop.name,
                    `捕捉成功率+${(crop.captureBonus * 100).toFixed(0)}%`,
                    crop.count,
                    'crop'
                );
                card.addEventListener('click', () => {
                    document.querySelectorAll('#capture-bait-selection-content .item-card').forEach(c => c.classList.remove('selected'));
                    card.classList.add('selected');
                    selectedBaitType = crop.id;
                    const baitDisplay = document.getElementById('selected-bait-display');
                    if (baitDisplay) baitDisplay.textContent = crop.name;
                });
                baitContent.appendChild(card);
            });
        }

        const confirmBtn = document.getElementById('confirm-capture-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (selectedToolType) {
                    this.eventBus.emit('ui:captureWildAnimal', {
                        wildAnimalId: wildAnimalId,
                        toolType: selectedToolType,
                        baitCropType: selectedBaitType
                    });
                    modal.remove();
                }
            });
        }

        document.getElementById('close-capture-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderSleepContent() {
        if (!this.sleepContent) return;

        const availableHours = this.sleepModule ? 
            this.sleepModule.getAvailableSleepHours() : 
            (this.timeModule.getHour() >= 20 ? 10 : 0);
        
        const hasSleepDeprivation = this.sleepModule ? 
            this.sleepModule.hasSleepDeprivation() : false;
        
        const consecutivePoorSleep = this.sleepModule ? 
            this.sleepModule.getConsecutivePoorSleepDays() : 0;

        this.sleepContent.innerHTML = '';

        if (availableHours <= 0) {
            this.sleepContent.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">☀️</div>
                    <div style="color: var(--ash-gray);">现在是白天，无法睡觉</div>
                    <div style="font-size: 0.85rem; opacity: 0.7; margin-top: 0.5rem;">
                        睡觉时间：晚上 20:00 - 早上 06:00
                    </div>
                </div>
            `;
            return;
        }

        const statusHtml = `
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px;">
                <div style="margin-bottom: 0.5rem; font-weight: bold;">睡眠状态</div>
                <div style="font-size: 0.9rem; color: var(--ash-gray);">
                    当前可睡眠时长：<span style="color: var(--old-cyan);">${availableHours}小时</span>
                </div>
                ${consecutivePoorSleep > 0 ? `
                    <div style="font-size: 0.9rem; color: ${hasSleepDeprivation ? '#ff6b6b' : 'var(--ash-gray)'};">
                        连续睡眠不足天数：<span style="color: var(--algae-red);">${consecutivePoorSleep}天</span>
                    </div>
                ` : ''}
                ${hasSleepDeprivation ? `
                    <div style="font-size: 0.9rem; color: #ff6b6b; margin-top: 0.5rem;">
                        ⚠️ 状态：睡眠不足Debuff（理智值降低）
                    </div>
                ` : ''}
            </div>
            <div style="margin-bottom: 1rem; color: var(--ash-gray); font-size: 0.9rem;">
                <div>• 睡眠 7.5 小时及以上：回复 100 理智值</div>
                <div>• 睡眠不足 7.5 小时：按比例回复理智值</div>
                <div>• 连续 3 天睡眠不足 3 小时：触发睡眠不足Debuff</div>
            </div>
            <div style="margin-bottom: 1rem; font-weight: bold;">选择睡眠时间：</div>
        `;
        this.sleepContent.innerHTML = statusHtml;

        const sleepOptions = [];
        if (availableHours >= 3) sleepOptions.push({ hours: 3, label: '3小时 (小睡)' });
        if (availableHours >= 4.5) sleepOptions.push({ hours: 4.5, label: '4.5小时' });
        if (availableHours >= 6) sleepOptions.push({ hours: 6, label: '6小时' });
        if (availableHours >= 7.5) sleepOptions.push({ hours: 7.5, label: '7.5小时 (推荐)' });
        if (availableHours >= 9) sleepOptions.push({ hours: 9, label: '9小时 (充足)' });
        if (availableHours >= 10) sleepOptions.push({ hours: availableHours, label: `${availableHours}小时 (睡到天亮)` });

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'inventory-content';

        sleepOptions.forEach(option => {
            const isOptimal = option.hours >= 7.5;
            const isPoor = option.hours < 3;
            
            const card = document.createElement('div');
            card.className = 'item-card';
            if (isOptimal) card.style.borderColor = 'var(--primary-green)';
            if (isPoor) card.style.borderColor = 'var(--algae-red)';
            
            const sanityRestore = option.hours >= 7.5 ? 100 : Math.floor((option.hours / 7.5) * 100);
            
            card.innerHTML = `
                <div class="item-name">${option.label}</div>
                <div class="item-info" style="${isOptimal ? 'color: var(--primary-green);' : isPoor ? 'color: var(--algae-red);' : ''}">
                    预计回复理智：${sanityRestore}点
                </div>
                ${isPoor ? '<div class="item-info" style="color: var(--algae-red); font-size: 0.8rem;">⚠️ 睡眠不足，可能影响健康</div>' : ''}
            `;
            
            card.addEventListener('click', () => {
                this.eventBus.emit('ui:sleep', option.hours);
            });
            
            optionsContainer.appendChild(card);
        });

        this.sleepContent.appendChild(optionsContainer);
    }

    updateLoadButtonState(hasSave) {
        const loadBtn = document.getElementById('load-game');
        if (loadBtn) {
            if (!hasSave) {
                loadBtn.style.opacity = '0.5';
                loadBtn.style.cursor = 'not-allowed';
            } else {
                loadBtn.style.opacity = '1';
                loadBtn.style.cursor = 'pointer';
            }
        }
    }

    bindExplorationTabs() {
        if (this._explorationTabHandler) {
            const tabs = document.querySelectorAll('.exploration-tabs .tab-button');
            tabs.forEach(tab => {
                tab.removeEventListener('click', this._explorationTabHandler);
            });
        }

        this._explorationTabHandler = (e) => {
            const tab = e.currentTarget;
            e.stopPropagation();
            document.querySelectorAll('.exploration-tabs .tab-button').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            this.currentExplorationTab = tab.dataset.tab;
            this.renderExplorationContent(tab.dataset.tab);
        };

        const tabs = document.querySelectorAll('.exploration-tabs .tab-button');
        tabs.forEach(tab => {
            tab.addEventListener('click', this._explorationTabHandler);
        });
    }

    renderExplorationContent(tabType) {
        if (!this.explorationModule) return;

        this.explorationMap = document.getElementById('exploration-map');
        this.explorationArtifacts = document.getElementById('exploration-artifacts');
        this.explorationTalents = document.getElementById('exploration-talents');

        if (this.explorationMap) this.explorationMap.classList.add('hidden');
        if (this.explorationArtifacts) this.explorationArtifacts.classList.add('hidden');
        if (this.explorationTalents) this.explorationTalents.classList.add('hidden');

        if (tabType === 'exploration-map') {
            if (this.explorationMap) this.explorationMap.classList.remove('hidden');
            this.renderExplorationMap();
        } else if (tabType === 'exploration-artifacts') {
            if (this.explorationArtifacts) this.explorationArtifacts.classList.remove('hidden');
            this.renderArtifacts();
        } else if (tabType === 'exploration-talents') {
            if (this.explorationTalents) this.explorationTalents.classList.remove('hidden');
            this.renderTalents();
        }
    }

    renderExplorationMap() {
        if (!this.regionsContainer || !this.explorationModule) return;

        const allRegions = this.explorationModule.getAllRegions();
        const ExplorationConfig = window.ExplorationConfig || {};

        this.regionsContainer.innerHTML = '';

        const tiers = ['shallow', 'medium', 'deep'];
        const tierNames = {
            'shallow': '浅层区域',
            'medium': '中层区域',
            'deep': '深层区域'
        };

        tiers.forEach(tier => {
            const tierRegions = allRegions.filter(r => r.tier === tier);
            if (tierRegions.length === 0) return;

            const tierSection = document.createElement('div');
            tierSection.className = 'region-tier-section';
            tierSection.innerHTML = `<div class="region-tier-title">${tierNames[tier]}</div>`;

            const regionsGrid = document.createElement('div');
            regionsGrid.className = 'regions-grid';

            tierRegions.forEach(region => {
                const regionCard = this.createRegionCard(region);
                regionsGrid.appendChild(regionCard);
            });

            tierSection.appendChild(regionsGrid);
            this.regionsContainer.appendChild(tierSection);
        });
    }

    createRegionCard(region) {
        const isExploring = this.explorationModule.getCurrentExploration() !== null;
        const canExplore = this.explorationModule.canExplore(region.id);
        const visitCount = region.visitCount || 0;

        const card = document.createElement('div');
        card.className = `region-card ${region.isUnlocked ? 'unlocked' : 'locked'} ${region.tier}`;
        card.dataset.regionId = region.id;

        let statusText = '';
        if (!region.isUnlocked) {
            statusText = '🔒 未解锁';
        } else if (isExploring) {
            statusText = '⏳ 探索中...';
        } else if (!canExplore.canExplore) {
            statusText = `⚠️ ${canExplore.reason}`;
        } else {
            statusText = `✨ 可探索 (${region.baseSanityCost}理智)`;
        }

        card.innerHTML = `
            <div class="region-icon">${region.icon}</div>
            <div class="region-name">${region.name}</div>
            <div class="region-desc">${region.description}</div>
            <div class="region-stats">
                <span class="region-stat">时间: ${region.explorationTime}分钟</span>
                <span class="region-stat">理智: ${region.baseSanityCost}</span>
                <span class="region-stat">探索: ${visitCount}次</span>
            </div>
            <div class="region-status">${statusText}</div>
            ${region.isUnlocked && canExplore.canExplore && !isExploring ? 
                `<button class="action-btn explore-btn" data-explore-id="${region.id}">开始探索</button>` : ''}
        `;

        const exploreBtn = card.querySelector('.explore-btn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.eventBus.emit('ui:startExploration', region.id);
            });
        }

        return card;
    }

    renderArtifacts() {
        if (!this.explorationArtifacts || !this.explorationModule) return;

        const collectedArtifacts = this.explorationModule.getCollectedArtifacts();
        const readArtifacts = this.explorationModule.getReadArtifacts();

        if (collectedArtifacts.length === 0) {
            this.explorationArtifacts.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--ash-gray);">尚未收集任何文物，去探索吧！</div>';
            return;
        }

        this.explorationArtifacts.innerHTML = '';
        const contentGrid = document.createElement('div');
        contentGrid.className = 'inventory-content';

        collectedArtifacts.forEach(artifact => {
            const isRead = readArtifacts.includes(artifact.id);
            const canRead = this.explorationModule.canReadArtifact(artifact.id);

            const card = document.createElement('div');
            card.className = `item-card artifact-card ${artifact.rarity} ${isRead ? 'read' : ''}`;
            card.dataset.artifactId = artifact.id;

            const rarityColors = {
                'common': '#9e9e9e',
                'uncommon': '#4caf50',
                'rare': '#2196f3',
                'epic': '#9c27b0',
                'legendary': '#ff9800'
            };
            const rarityNames = {
                'common': '普通',
                'uncommon': '优秀',
                'rare': '稀有',
                'epic': '史诗',
                'legendary': '传说'
            };

            card.style.borderColor = rarityColors[artifact.rarity] || '#9e9e9e';

            let effectsText = '';
            if (artifact.effects) {
                if (artifact.effects.unlocks && artifact.effects.unlocks.length > 0) {
                    effectsText += `解锁: ${artifact.effects.unlocks.length}项`;
                }
                if (artifact.effects.passive) {
                    effectsText += `${effectsText ? ' | ' : ''}天赋: ${artifact.effects.passive.name}`;
                }
            }

            card.innerHTML = `
                <div class="item-name">
                    <span class="artifact-icon">${artifact.icon}</span>
                    ${artifact.name}
                </div>
                <div class="item-info" style="color: ${rarityColors[artifact.rarity]}; font-size: 0.8rem;">
                    ${rarityNames[artifact.rarity] || '未知'}
                </div>
                <div class="item-info">${artifact.description}</div>
                ${effectsText ? `<div class="item-info" style="font-size: 0.85rem; color: var(--primary-green);">${effectsText}</div>` : ''}
                <div class="item-info" style="font-size: 0.8rem; opacity: 0.7;">
                    ${isRead ? '✓ 已阅读' : `阅读消耗: ${artifact.readSanityLoss}理智`}
                </div>
                ${!isRead && canRead.canExplore ? 
                    `<button class="action-btn read-artifact-btn" data-read-id="${artifact.id}" style="margin-top: 0.5rem;">阅读</button>` : ''}
                ${!isRead && !canRead.canExplore ? 
                    `<div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--algae-red);">${canRead.reason}</div>` : ''}
            `;

            const readBtn = card.querySelector('.read-artifact-btn');
            if (readBtn) {
                readBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showArtifactRead(artifact);
                });
            }

            contentGrid.appendChild(card);
        });

        this.explorationArtifacts.appendChild(contentGrid);
    }

    renderTalents() {
        if (!this.explorationTalents || !this.explorationModule) return;

        const talents = this.explorationModule.getPassiveTalents();

        if (talents.length === 0) {
            this.explorationTalents.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--ash-gray);">尚未解锁任何天赋，阅读文物以解锁！</div>';
            return;
        }

        this.explorationTalents.innerHTML = '';
        const contentGrid = document.createElement('div');
        contentGrid.className = 'inventory-content';

        talents.forEach(talent => {
            const card = document.createElement('div');
            card.className = 'item-card talent-card';
            card.style.borderColor = 'var(--cthulhu-gold)';

            let valueText = '';
            if (talent.value > 0) {
                valueText = `+${talent.value}%`;
            }

            card.innerHTML = `
                <div class="item-name">✨ ${talent.name}</div>
                <div class="item-info" style="color: var(--primary-green);">${valueText}</div>
                <div class="item-info" style="font-size: 0.8rem; opacity: 0.7;">
                    来源: ${talent.source || '未知'}
                </div>
            `;

            contentGrid.appendChild(card);
        });

        this.explorationTalents.appendChild(contentGrid);
    }

    showArtifactRead(artifact) {
        if (!this.artifactReadIcon || !this.artifactReadTitle || 
            !this.artifactReadDescription || !this.artifactReadEffects) return;

        this.artifactReadIcon.textContent = artifact.icon;
        this.artifactReadTitle.textContent = artifact.name;
        this.artifactReadDescription.innerHTML = `
            <p style="margin-bottom: 1rem;">${artifact.description}</p>
            <p style="color: var(--ash-gray); font-size: 0.9rem;">
                ${artifact.readMessage}
            </p>
        `;

        let effectsHtml = '';
        if (artifact.effects) {
            if (artifact.effects.unlocks && artifact.effects.unlocks.length > 0) {
                effectsHtml += `<div style="margin-bottom: 0.5rem;">
                    <strong>解锁内容:</strong>
                    <ul style="margin-top: 0.25rem; padding-left: 1.5rem;">
                        ${artifact.effects.unlocks.map(u => `<li>${u}</li>`).join('')}
                    </ul>
                </div>`;
            }
            if (artifact.effects.passive) {
                effectsHtml += `<div style="color: var(--primary-green);">
                    <strong>解锁天赋:</strong> ${artifact.effects.passive.name}
                    ${artifact.effects.passive.value > 0 ? ` (+${artifact.effects.passive.value}%)` : ''}
                </div>`;
            }
        }
        effectsHtml += `<div style="margin-top: 1rem; color: var(--algae-red);">
            <strong>理智消耗:</strong> ${artifact.readSanityLoss} 点
        </div>`;

        this.artifactReadEffects.innerHTML = effectsHtml;

        const readBtn = document.getElementById('read-artifact-btn');
        const cancelBtn = document.getElementById('cancel-artifact-read-btn');

        if (readBtn) {
            const oldReadHandler = readBtn._handler;
            if (oldReadHandler) readBtn.removeEventListener('click', oldReadHandler);
            
            const newHandler = (e) => {
                e.stopPropagation();
                this.eventBus.emit('ui:readArtifact', artifact.id);
            };
            readBtn._handler = newHandler;
            readBtn.addEventListener('click', newHandler);
        }

        if (cancelBtn) {
            const oldCancelHandler = cancelBtn._handler;
            if (oldCancelHandler) cancelBtn.removeEventListener('click', oldCancelHandler);
            
            const newHandler = (e) => {
                e.stopPropagation();
                this.hideModal('artifactRead');
            };
            cancelBtn._handler = newHandler;
            cancelBtn.addEventListener('click', newHandler);
        }

        this.showModal('artifactRead');
    }

    showMysteryEvent(eventData) {
        if (!this.eventIcon || !this.eventTitle || !this.eventDescription || !this.eventChoices) return;

        this.eventIcon.textContent = eventData.icon || '❓';
        this.eventTitle.textContent = eventData.name || '神秘事件';
        this.eventDescription.textContent = eventData.description || '你遇到了一些奇怪的事情...';

        this.eventChoices.innerHTML = '';

        if (eventData.choices && eventData.choices.length > 0) {
            eventData.choices.forEach(choice => {
                const choiceBtn = document.createElement('button');
                choiceBtn.className = 'action-btn event-choice-btn';
                choiceBtn.textContent = choice.text;
                choiceBtn.dataset.choiceId = choice.id;
                choiceBtn.dataset.eventId = eventData.id;

                choiceBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.eventBus.emit('ui:handleEventChoice', {
                        eventId: eventData.id,
                        choiceId: choice.id
                    });
                });

                this.eventChoices.appendChild(choiceBtn);
            });
        } else {
            const defaultChoice = document.createElement('button');
            defaultChoice.className = 'action-btn event-choice-btn';
            defaultChoice.textContent = '继续';
            defaultChoice.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hideModal('mysteryEvent');
            });
            this.eventChoices.appendChild(defaultChoice);
        }

        this.showModal('mysteryEvent');
    }

    showExplorationProgress() {
        if (!this.explorationProgressBar) return;
        this.explorationProgressBar.classList.remove('hidden');
        if (this.explorationProgressFill) {
            this.explorationProgressFill.style.width = '0%';
        }
        if (this.explorationProgressText) {
            this.explorationProgressText.textContent = '探索中...';
        }
    }

    updateExplorationProgress(progress) {
        if (!this.explorationProgressFill) return;
        const percent = Math.min(100, Math.max(0, progress * 100));
        this.explorationProgressFill.style.width = `${percent}%`;
        if (this.explorationProgressText) {
            this.explorationProgressText.textContent = `探索中... ${Math.floor(percent)}%`;
        }
    }

    hideExplorationProgress() {
        if (!this.explorationProgressBar) return;
        this.explorationProgressBar.classList.add('hidden');
    }

    renderPond() {
        this.renderPondInfo();
        this.renderPondFields();
    }

    renderPondInfo() {
        if (!this.pondInfo || !this.farmingModule) return;
        
        const pondState = this.farmingModule.getPondsState();
        const unlockedPonds = pondState.ponds ? pondState.ponds.filter(p => p.unlocked).length : 0;
        const totalPonds = pondState.totalPonds || 8;

        let unlockInfo = '';
        const currentDay = this.timeModule.getDay();
        const unlockDay = pondState.unlockDay || 7;
        const unlockCost = pondState.unlockCost || 1000;

        if (!pondState.unlocked) {
            if (currentDay >= unlockDay) {
                unlockInfo = `<div class="pond-unlock-available">
                    <span>已满足解锁条件</span>
                    <button class="action-btn unlock-pond-btn" id="unlock-pond-btn">
                        解锁池塘区域 (${unlockCost}金币)
                    </button>
                </div>`;
            } else {
                unlockInfo = `<div class="pond-unlock-locked">
                    解锁条件：第 ${unlockDay} 天解锁 (当前：第 ${currentDay} 天)
                </div>`;
            }
        }

        this.pondInfo.innerHTML = `
            <div class="pond-stats">
                <span>已解锁地块: ${unlockedPonds}/${totalPonds}</span>
            </div>
            ${unlockInfo}
        `;

        const unlockPondBtn = document.getElementById('unlock-pond-btn');
        if (unlockPondBtn) {
            unlockPondBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.eventBus.emit('farming:unlockPond');
            });
        }
    }

    renderPondFields() {
        if (!this.pondContainer || !this.farmingModule) return;

        const PlantConfig = window.PlantConfig || {};
        const ponds = this.farmingModule.getAllPonds();
        
        this.pondContainer.innerHTML = '';
        
        ponds.forEach((pond, index) => {
            const pondElement = document.createElement('div');
            pondElement.className = 'pond-field field-type-water';
            pondElement.dataset.pondId = index;
            
            if (!pond.unlocked) {
                pondElement.classList.add('locked');
                const unlockPrice = this.farmingModule.getPondUnlockPrice ? 
                    this.farmingModule.getPondUnlockPrice(index) : 500;
                pondElement.innerHTML = `
                    <div class="field-content">
                        <div class="locked-indicator">未解锁</div>
                        <div class="unlock-price">解锁: ${unlockPrice}金币</div>
                    </div>
                `;
                pondElement.addEventListener('click', () => {
                    this.eventBus.emit('farming:pondFieldClicked', index);
                });
            } else if (!pond.plant) {
                pondElement.innerHTML = `
                    <div class="field-content">
                        <div style="font-size: 1.5rem;">💧</div>
                        <div style="font-size: 0.8rem; opacity: 0.7;">水域</div>
                    </div>
                    <div class="field-status">
                        <span class="water-indicator">池塘</span>
                        <span class="fertilizer-indicator">${pond.fertilized ? '已施肥' : '未施肥'}</span>
                    </div>
                `;
                pondElement.addEventListener('click', () => {
                    this.eventBus.emit('farming:pondFieldClicked', index);
                });
            } else {
                const plantData = PlantConfig.getPlant ? 
                    PlantConfig.getPlant(pond.plant) : PlantConfig[pond.plant];
                
                if (!plantData) return;
                
                const stageText = plantData.stages[pond.stage];
                const isReady = pond.stage >= plantData.stages.length - 1;
                
                const stageClass = `plant-stage-${Math.min(pond.stage, 3)}`;
                pondElement.innerHTML = `
                    <div class="field-content">
                        <div class="plant-breathing ${stageClass}">${stageText}</div>
                    </div>
                    <div class="field-status">
                        <span class="water-indicator">池塘</span>
                        <span class="fertilizer-indicator">${pond.fertilized ? '已施肥' : '未施肥'}</span>
                    </div>
                `;
                
                if (isReady) {
                    pondElement.classList.add('ready-to-harvest');
                }
                
                pondElement.addEventListener('click', () => {
                    this.eventBus.emit('farming:pondFieldClicked', index);
                });
            }
            
            this.pondContainer.appendChild(pondElement);
        });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIRenderer;
}
