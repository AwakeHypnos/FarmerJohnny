class UIRenderer {
    constructor(eventBus, timeModule, gameState, farmingModule, economyModule, sanityModule, pollutionModule, livestockModule, animationManager, effectManager) {
        this.eventBus = eventBus;
        this.timeModule = timeModule;
        this.gameState = gameState;
        this.farmingModule = farmingModule;
        this.economyModule = economyModule;
        this.sanityModule = sanityModule;
        this.pollutionModule = pollutionModule;
        this.livestockModule = livestockModule;
        this.animationManager = animationManager;
        this.effectManager = effectManager;

        this.currentView = 'fields';

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
        this.fieldsContainer = document.getElementById('fields-container');
        this.barnContainer = document.getElementById('barn-container');
        this.barnInfo = document.getElementById('barn-info');
        
        this.navLeft = document.getElementById('nav-left');
        this.navRight = document.getElementById('nav-right');
        
        this.infoPanel = document.getElementById('info-panel');
        this.infoContent = document.getElementById('info-content');
        
        this.backpackContent = document.getElementById('backpack-content');
        this.merchantContent = document.getElementById('merchant-content');
        this.marketContent = document.getElementById('market-content');
        this.warehouseContent = document.getElementById('warehouse-content');
        this.logContent = document.getElementById('log-content');

        this.modals = {
            backpack: document.getElementById('backpack-modal'),
            merchant: document.getElementById('merchant-modal'),
            market: document.getElementById('market-modal'),
            warehouse: document.getElementById('warehouse-modal'),
            developer: document.getElementById('developer-modal'),
            log: document.getElementById('log-modal')
        };
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
        });

        this.eventBus.on('livestock:captureSuccess', (data) => {
            this.showInfo(`成功捕获了${data.wildAnimal.name}！`, 'success');
            this.renderBarn();
        });

        this.eventBus.on('livestock:captureFailed', (data) => {
            this.showInfo(`捕获失败：${data.reason}`, 'warning');
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
        
        if (this.navLeft) this.navLeft.style.visibility = 'hidden';
        if (this.navRight) this.navRight.style.visibility = 'visible';
        
        this.renderFields();
    }

    switchToBarn() {
        this.currentView = 'barn';
        this.barnView.classList.remove('hidden');
        this.barnView.classList.add('active');
        this.fieldsView.classList.remove('active');
        this.fieldsView.classList.add('hidden');
        
        if (this.navLeft) this.navLeft.style.visibility = 'visible';
        if (this.navRight) this.navRight.style.visibility = 'hidden';
        
        this.renderBarn();
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
    }

    renderBarnAnimals() {
        if (!this.barnContainer || !this.livestockModule) return;
        
        const animals = this.livestockModule.getAnimals();
        const AnimalConfig = window.AnimlConfig || {};
        
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
            animalElement.dataset.animalId = index;
            
            const getTimeUntilProduct = this.livestockModule.getTimeUntilProduct ? 
                this.livestockModule.getTimeUntilProduct(index) : 'N/A';
            
            animalElement.innerHTML = `
                <div class="animal-icon">${animal.type === 'chicken' ? '🐔' : animal.type === 'cow' ? '🐮' : animal.type === 'pig' ? '🐷' : animal.type === 'goat' ? '🐐' : '🦇'}</div>
                <div class="animal-name">${animal.name || animal.type}</div>
                <div class="animal-status">
                    ${animal.canProduce ? '<span class="product-ready">产品就绪</span>' : 
                      `<span class="product-timer">下次产出: ${getTimeUntilProduct}</span>`}
                </div>
                <div class="animal-actions">
                    ${animal.canProduce ? 
                        `<button class="collect-btn" data-collect-id="${index}">收集</button>` : 
                        ''}
                </div>
            `;
            
            if (animal.canProduce) {
                const collectBtn = animalElement.querySelector('.collect-btn');
                if (collectBtn) {
                    collectBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.eventBus.emit('livestock:collectProduct', index);
                    });
                }
            }
            
            this.barnContainer.appendChild(animalElement);
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
            
            if (!field.unlocked) {
                fieldElement.classList.add('locked');
                const nextUnlockPrice = this.farmingModule.getUnlockPrice ? 
                    this.farmingModule.getUnlockPrice(unlockedCount) : 0;
                fieldElement.innerHTML = `
                    <div class="field-content">
                        <div class="locked-indicator">未解锁</div>
                        <div class="unlock-price">解锁: ${nextUnlockPrice}金币</div>
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
            if (summary.fertilizers.length === 0) {
                this.backpackContent.innerHTML = '<div style="grid-column: 1/-1; text-align: center; opacity: 0.7;">背包中没有物品</div>';
                return;
            }

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
        }
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
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIRenderer;
}
