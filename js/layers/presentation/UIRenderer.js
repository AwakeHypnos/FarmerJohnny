class UIRenderer {
    constructor(eventBus, timeModule, gameState, farmingModule, economyModule, animationManager, effectManager) {
        this.eventBus = eventBus;
        this.timeModule = timeModule;
        this.gameState = gameState;
        this.farmingModule = farmingModule;
        this.economyModule = economyModule;
        this.animationManager = animationManager;
        this.effectManager = effectManager;

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
        
        this.fieldsContainer = document.getElementById('fields-container');
        
        this.infoPanel = document.getElementById('info-panel');
        this.infoContent = document.getElementById('info-content');
        
        this.backpackContent = document.getElementById('backpack-content');
        this.merchantContent = document.getElementById('merchant-content');
        this.marketContent = document.getElementById('market-content');
        this.warehouseContent = document.getElementById('warehouse-content');

        this.modals = {
            backpack: document.getElementById('backpack-modal'),
            merchant: document.getElementById('merchant-modal'),
            market: document.getElementById('market-modal'),
            warehouse: document.getElementById('warehouse-modal'),
            developer: document.getElementById('developer-modal')
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
            this.showInfo(`季节变化：现在是${data.seasonName}季！`);
            this.renderFields();
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
        this.effectManager.updateDayNightTheme(this.timeModule.isNight());
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

    showInfo(message) {
        this.infoContent.textContent = message;
        this.animationManager.animateInfoPanel();
        this.effectManager.showToast(message);
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
        
        this.fieldsContainer.innerHTML = '';
        
        fields.forEach((field, index) => {
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
                fieldElement.addEventListener('click', () => {
                    this.eventBus.emit('farming:fieldClicked', index);
                });
            } else {
                const plantData = PlantConfig.getPlant ? 
                    PlantConfig.getPlant(field.plant) : PlantConfig[field.plant];
                
                if (!plantData) return;
                
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
                    <div class="item-price">💰 ${seed.buyPrice}金币</div>
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
                    <div class="item-price">💰 ${fertilizer.buyPrice}金币</div>
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
            
            const priceColor = priceDiff > 0 ? 'color: #4caf50;' : priceDiff < 0 ? 'color: #f44336;' : '';
            const priceDiffText = priceDiff > 0 ? `+${priceDiffPercent}%` : priceDiff < 0 ? `${priceDiffPercent}%` : '平价';

            const card = document.createElement('div');
            card.className = 'item-card';
            
            card.innerHTML = `
                <div class="item-name">${priceData.plantName}</div>
                <div class="item-info">基础价格: ${priceData.basePrice}金币</div>
                <div class="item-price" style="${priceColor}">
                    💰 ${priceData.currentPrice}金币 (${priceDiffText})
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
