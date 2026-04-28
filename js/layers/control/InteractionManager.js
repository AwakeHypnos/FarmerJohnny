class InteractionManager {
    constructor(eventBus, farmingModule, economyModule, sanityModule, pollutionModule, livestockModule, sleepModule, explorationModule, uiRenderer) {
        this.eventBus = eventBus;
        this.farmingModule = farmingModule;
        this.economyModule = economyModule;
        this.sanityModule = sanityModule;
        this.pollutionModule = pollutionModule;
        this.livestockModule = livestockModule;
        this.sleepModule = sleepModule;
        this.explorationModule = explorationModule;
        this.uiRenderer = uiRenderer;

        this.currentFieldActions = null;
        this.setupListeners();
    }

    setupListeners() {
        this.eventBus.on('input:startGame', () => {
            this.eventBus.emit('game:startNew');
        });

        this.eventBus.on('input:loadGame', () => {
            this.eventBus.emit('game:load');
        });

        this.eventBus.on('input:showDeveloper', () => {
            this.uiRenderer.showModal('developer');
        });

        this.eventBus.on('input:hideDeveloper', () => {
            this.uiRenderer.hideModal('developer');
        });

        this.eventBus.on('input:showBackpack', () => {
            this.uiRenderer.showModal('backpack');
            this.uiRenderer.renderBackpackContent('seeds');
        });

        this.eventBus.on('input:hideBackpack', () => {
            this.uiRenderer.hideModal('backpack');
        });

        this.eventBus.on('input:showMerchant', () => {
            this.uiRenderer.showModal('merchant');
            this.uiRenderer.renderMerchantContent('merchant-seeds');
        });

        this.eventBus.on('input:hideMerchant', () => {
            this.uiRenderer.hideModal('merchant');
        });

        this.eventBus.on('input:showMarket', () => {
            this.uiRenderer.showModal('market');
            this.uiRenderer.renderMarketContent();
        });

        this.eventBus.on('input:hideMarket', () => {
            this.uiRenderer.hideModal('market');
        });

        this.eventBus.on('input:showWarehouse', () => {
            this.uiRenderer.showModal('warehouse');
            this.uiRenderer.renderWarehouseContent();
        });

        this.eventBus.on('input:hideWarehouse', () => {
            this.uiRenderer.hideModal('warehouse');
        });

        this.eventBus.on('input:showLog', () => {
            this.uiRenderer.showModal('log');
            this.uiRenderer.renderLogContent();
        });

        this.eventBus.on('input:hideLog', () => {
            this.uiRenderer.hideModal('log');
        });

        this.eventBus.on('ui:sleep', (hours) => {
            this.handleSleep(hours);
        });

        this.eventBus.on('input:backpackTabChanged', (tabType) => {
            this.uiRenderer.renderBackpackContent(tabType);
        });

        this.eventBus.on('input:merchantTabChanged', (tabType) => {
            this.uiRenderer.renderMerchantContent(tabType);
        });

        this.eventBus.on('farming:fieldClicked', (fieldId) => {
            this.handleFieldClick(fieldId);
        });

        this.eventBus.on('farming:showFieldActions', (data) => {
            this.showFieldActions(data.fieldId);
        });

        this.eventBus.on('farming:needSeed', () => {
            this.uiRenderer.showInfo('请先在背包中选择一种种子。');
        });

        this.eventBus.on('farming:error', (data) => {
            this.uiRenderer.showInfo(data.message);
        });

        this.eventBus.on('farming:showUnlockOption', (data) => {
            this.showUnlockOption(data);
        });

        this.eventBus.on('farming:fieldUnlocked', (data) => {
            this.uiRenderer.showInfo(`田地解锁成功！花费了 ${data.price} 金币。`);
            this.uiRenderer.renderFields();
        });

        this.eventBus.on('input:switchToFields', () => {
            this.eventBus.emit('ui:switchToFields');
        });

        this.eventBus.on('input:switchToBarn', () => {
            this.eventBus.emit('ui:switchToBarn');
        });

        this.eventBus.on('input:upgradeBarn', () => {
            this.handleUpgradeBarn();
        });

        this.eventBus.on('livestock:collectProduct', (animalId) => {
            this.handleCollectProduct(animalId);
        });

        this.eventBus.on('ui:seedSelected', (seedType) => {
            this.handleSeedSelect(seedType);
        });

        this.eventBus.on('ui:buySeed', (seedType) => {
            this.handleBuySeed(seedType);
        });

        this.eventBus.on('ui:buyFertilizer', (fertilizerType) => {
            this.handleBuyFertilizer(fertilizerType);
        });

        this.eventBus.on('ui:buyCrop', (cropType) => {
            this.handleBuyCrop(cropType);
        });

        this.eventBus.on('ui:buyTrap', (trapType) => {
            this.handleBuyTrap(trapType);
        });

        this.eventBus.on('ui:sellCrop', (cropType) => {
            this.handleSellCrop(cropType);
        });

        this.eventBus.on('ui:moveFromWarehouse', (data) => {
            this.handleMoveFromWarehouse(data.itemType, data.category);
        });

        this.eventBus.on('input:showExploration', () => {
            this.uiRenderer.showModal('exploration');
            this.uiRenderer.renderExplorationContent('exploration-map');
            this.uiRenderer.bindExplorationTabs();
        });

        this.eventBus.on('input:hideExploration', () => {
            this.uiRenderer.hideModal('exploration');
        });

        this.eventBus.on('input:hideArtifactRead', () => {
            this.uiRenderer.hideModal('artifactRead');
        });

        this.eventBus.on('ui:startExploration', (regionId) => {
            this.handleStartExploration(regionId);
        });

        this.eventBus.on('ui:readArtifact', (artifactId) => {
            this.handleReadArtifact(artifactId);
        });

        this.eventBus.on('ui:handleEventChoice', (data) => {
            this.handleEventChoice(data.eventId, data.choiceId);
        });
    }

    handleSleep(hours) {
        if (!this.sleepModule) return;
        
        const result = this.sleepModule.startSleep(hours);
        if (!result.success) {
            this.uiRenderer.showInfo(result.reason, 'warning');
        }
    }

    handleUpgradeBarn() {
        if (!this.livestockModule) return;
        const result = this.livestockModule.upgradeBarn();
        if (!result.success) {
            this.uiRenderer.showInfo(result.reason, 'warning');
        }
    }

    handleCollectProduct(animalId) {
        if (!this.livestockModule) return;
        const result = this.livestockModule.collectProduct(animalId);
        if (result.success) {
            this.uiRenderer.showInfo(`收集了${result.productName}×${result.amount}！`, 'success');
            this.uiRenderer.renderBarn();
        } else {
            this.uiRenderer.showInfo(result.reason, 'warning');
        }
    }

    showUnlockOption(data) {
        this.removeFieldActions();
        
        const fieldElement = document.querySelector(`[data-field-id="${data.fieldId}"]`);
        if (!fieldElement) return;

        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-buttons field-action-buttons unlock-options';
        actionContainer.style.marginTop = '0.5rem';

        const price = data.price;
        const priceText = data.canUnlock 
            ? `解锁此田地需要 ${price} 金币` 
            : data.reason;

        const unlockBtn = this.createActionButton(
            `解锁田地 (${price}金币)`, 
            data.canUnlock, 
            () => {
                this.handleUnlockField(data.fieldId);
                actionContainer.remove();
            }
        );

        actionContainer.appendChild(unlockBtn);
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'unlock-info';
        infoDiv.style.fontSize = '0.8rem';
        infoDiv.style.opacity = '0.7';
        infoDiv.style.marginTop = '0.5rem';
        infoDiv.style.textAlign = 'center';
        infoDiv.textContent = priceText;
        actionContainer.appendChild(infoDiv);

        fieldElement.appendChild(actionContainer);
        this.currentFieldActions = actionContainer;

        setTimeout(() => {
            const removeHandler = (e) => {
                if (!fieldElement.contains(e.target)) {
                    actionContainer.remove();
                    document.removeEventListener('click', removeHandler);
                }
            };
            document.addEventListener('click', removeHandler);
        }, 100);
    }

    handleUnlockField(fieldId) {
        const result = this.farmingModule.unlockField(fieldId);
        if (!result.success) {
            this.uiRenderer.showInfo(result.reason);
        }
    }

    handleFieldClick(fieldId) {
        this.farmingModule.handleFieldClick(fieldId);
    }

    showFieldActions(fieldId) {
        this.removeFieldActions();
        
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!fieldElement) return;

        const field = this.farmingModule.getField(fieldId);
        const isReady = this.farmingModule.isPlantReady(fieldId);

        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-buttons field-action-buttons';
        actionContainer.style.marginTop = '0.5rem';

        const waterBtn = this.createActionButton('浇水', !field.watered, () => {
            this.handleWaterField(fieldId);
            actionContainer.remove();
        });

        const availableFertilizers = this.economyModule.gameState.getAvailableFertilizers();
        const fertilizerBtn = this.createActionButton(
            '施肥', 
            !field.fertilized && availableFertilizers.length > 0, 
            () => {
                this.showFertilizerSelection(fieldId);
                actionContainer.remove();
            }
        );

        actionContainer.appendChild(waterBtn);
        actionContainer.appendChild(fertilizerBtn);

        if (isReady) {
            const harvestBtn = this.createActionButton('采摘', true, () => {
                this.handleHarvestField(fieldId);
                actionContainer.remove();
            });
            actionContainer.insertBefore(harvestBtn, actionContainer.firstChild);
        }

        fieldElement.appendChild(actionContainer);
        this.currentFieldActions = actionContainer;

        setTimeout(() => {
            const removeHandler = (e) => {
                if (!fieldElement.contains(e.target)) {
                    actionContainer.remove();
                    document.removeEventListener('click', removeHandler);
                }
            };
            document.addEventListener('click', removeHandler);
        }, 100);
    }

    createActionButton(text, enabled, onClick) {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = text;
        btn.disabled = !enabled;
        
        if (enabled) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                onClick();
            });
        }
        
        return btn;
    }

    removeFieldActions() {
        const oldActions = document.querySelectorAll('.field-action-buttons');
        oldActions.forEach(el => el.remove());
        this.currentFieldActions = null;
    }

    handleWaterField(fieldId) {
        const result = this.farmingModule.waterField(fieldId);
        if (result.success) {
            if (this.sanityModule) {
                this.sanityModule.applyNightActionSanityLoss('浇水');
            }
            this.uiRenderer.showInfo('浇水成功！');
            this.uiRenderer.renderFields();
        } else {
            this.uiRenderer.showInfo(result.reason);
        }
    }

    showFertilizerSelection(fieldId) {
        const availableFertilizers = this.economyModule.gameState.getAvailableFertilizers();
        
        if (availableFertilizers.length === 0) {
            this.uiRenderer.showInfo('没有可用的肥料。');
            return;
        }

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
            const card = this.uiRenderer.createItemCard(
                fertilizer.type,
                fertilizer.name,
                fertilizer.description,
                fertilizer.count,
                'fertilizer'
            );
            card.addEventListener('click', () => {
                this.handleApplyFertilizer(fieldId, fertilizer.type);
                modal.remove();
            });
            content.appendChild(card);
        });

        document.getElementById('close-fertilizer-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    handleApplyFertilizer(fieldId, fertilizerType) {
        const result = this.farmingModule.applyFertilizer(fieldId, fertilizerType);
        if (result.success) {
            if (this.sanityModule) {
                this.sanityModule.applyNightActionSanityLoss('施肥');
            }
            const FertilizerConfig = window.FertilizerConfig || {};
            const fertilizer = FertilizerConfig.getFertilizer ? 
                FertilizerConfig.getFertilizer(fertilizerType) : FertilizerConfig[fertilizerType];
            this.uiRenderer.showInfo(`成功施用了${fertilizer ? fertilizer.name : fertilizerType}！`);
            this.uiRenderer.renderFields();
        } else {
            this.uiRenderer.showInfo(result.reason);
        }
    }

    handleHarvestField(fieldId) {
        const result = this.farmingModule.harvestField(fieldId);
        if (result.success) {
            if (this.sanityModule) {
                this.sanityModule.applyNightActionSanityLoss('收获');
            }
            const PlantConfig = window.PlantConfig || {};
            const field = this.farmingModule.getField(fieldId);
            const plantData = PlantConfig.getPlant ? 
                PlantConfig.getPlant(field.plant) : PlantConfig[field.plant];
            this.uiRenderer.showInfo(`成功采摘了${plantData ? plantData.name : '作物'}！已放入背包。`);
            this.uiRenderer.renderFields();
        } else {
            this.uiRenderer.showInfo(result.reason);
        }
    }

    handleSeedSelect(seedType) {
        this.farmingModule.selectSeed(seedType);
        const PlantConfig = window.PlantConfig || {};
        const plantData = PlantConfig.getPlant ? 
            PlantConfig.getPlant(seedType) : PlantConfig[seedType];
        this.uiRenderer.showInfo(`已选择${plantData ? plantData.name : seedType}，点击空地进行种植。`);
    }

    handleBuySeed(seedType) {
        const result = this.economyModule.buySeed(seedType);
        if (result.success) {
            const PlantConfig = window.PlantConfig || {};
            const plantData = PlantConfig.getPlant ? 
                PlantConfig.getPlant(seedType) : PlantConfig[seedType];
            this.uiRenderer.showInfo(`成功购买了${plantData ? plantData.name : seedType}种子！`);
            this.uiRenderer.updateMoneyDisplay();
            this.uiRenderer.renderMerchantContent('merchant-seeds');
        } else {
            this.uiRenderer.showInfo(result.reason);
        }
    }

    handleBuyFertilizer(fertilizerType) {
        const result = this.economyModule.buyFertilizer(fertilizerType);
        if (result.success) {
            const FertilizerConfig = window.FertilizerConfig || {};
            const fertilizer = FertilizerConfig.getFertilizer ? 
                FertilizerConfig.getFertilizer(fertilizerType) : FertilizerConfig[fertilizerType];
            this.uiRenderer.showInfo(`成功购买了${fertilizer ? fertilizer.name : fertilizerType}！`);
            this.uiRenderer.updateMoneyDisplay();
            this.uiRenderer.renderMerchantContent('merchant-fertilizer');
        } else {
            this.uiRenderer.showInfo(result.reason);
        }
    }

    handleBuyCrop(cropType) {
        const result = this.economyModule.buyCrop(cropType);
        if (result.success) {
            const PlantConfig = window.PlantConfig || {};
            const plantData = PlantConfig.getPlant ? 
                PlantConfig.getPlant(cropType) : PlantConfig[cropType];
            this.uiRenderer.showInfo(`成功购买了${plantData ? plantData.name : cropType}！`);
            this.uiRenderer.updateMoneyDisplay();
            this.uiRenderer.renderMerchantContent('merchant-crops');
        } else {
            this.uiRenderer.showInfo(result.reason);
        }
    }

    handleBuyTrap(trapType) {
        const result = this.economyModule.buyTrap(trapType);
        if (result.success) {
            const AnimalConfig = window.AnimalConfig || {};
            const trap = AnimalConfig.getCaptureTool ? 
                AnimalConfig.getCaptureTool(trapType) : 
                (AnimalConfig._captureTools ? AnimalConfig._captureTools[trapType] : null);
            this.uiRenderer.showInfo(`成功购买了${trap ? trap.name : trapType}！`);
            this.uiRenderer.updateMoneyDisplay();
            this.uiRenderer.renderMerchantContent('merchant-traps');
        } else {
            this.uiRenderer.showInfo(result.reason);
        }
    }

    handleSellCrop(cropType) {
        const result = this.economyModule.sellCrop(cropType);
        if (result.success) {
            const PlantConfig = window.PlantConfig || {};
            const plantData = PlantConfig.getPlant ? 
                PlantConfig.getPlant(cropType) : PlantConfig[cropType];
            this.uiRenderer.showInfo(`成功出售了${plantData ? plantData.name : cropType}，获得${result.price}金币！`);
            this.uiRenderer.updateMoneyDisplay();
            this.uiRenderer.renderMarketContent();
        } else {
            this.uiRenderer.showInfo(result.reason);
        }
    }

    handleMoveFromWarehouse(itemType, category) {
        const result = this.economyModule.moveFromWarehouse(itemType, category);
        if (result.success) {
            this.uiRenderer.showInfo('物品已取出到背包。');
            this.uiRenderer.renderWarehouseContent();
        } else {
            this.uiRenderer.showInfo(result.reason);
        }
    }

    handleStartExploration(regionId) {
        if (!this.explorationModule) {
            this.uiRenderer.showInfo('探索模块不可用。', 'warning');
            return;
        }

        const result = this.explorationModule.startExploration(regionId);
        if (!result.success) {
            this.uiRenderer.showInfo(result.reason, 'warning');
        }
    }

    handleReadArtifact(artifactId) {
        if (!this.explorationModule) {
            this.uiRenderer.showInfo('探索模块不可用。', 'warning');
            return;
        }

        const result = this.explorationModule.readArtifact(artifactId);
        if (!result.success) {
            this.uiRenderer.showInfo(result.reason, 'warning');
        }
    }

    handleEventChoice(eventId, choiceId) {
        if (!this.explorationModule) {
            this.uiRenderer.showInfo('探索模块不可用。', 'warning');
            return;
        }

        const result = this.explorationModule.handleEventChoice(eventId, choiceId);
        if (!result.success) {
            this.uiRenderer.showInfo(result.reason, 'warning');
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractionManager;
}
