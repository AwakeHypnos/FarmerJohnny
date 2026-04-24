class InputHandler {
    constructor(eventBus, eventBinder) {
        this.eventBus = eventBus;
        this.eventBinder = eventBinder;
    }

    init() {
        this.bindMenuButtons();
        this.bindModalButtons();
        this.bindTabEvents();
    }

    bindMenuButtons() {
        this.eventBinder.bindClick('start-game', () => {
            this.eventBus.emit('input:startGame');
        });

        this.eventBinder.bindClick('load-game', () => {
            this.eventBus.emit('input:loadGame');
        });

        this.eventBinder.bindClick('developer', () => {
            this.eventBus.emit('input:showDeveloper');
        });
    }

    bindModalButtons() {
        this.eventBinder.bindClick('backpack-btn', () => {
            this.eventBus.emit('input:showBackpack');
        });

        this.eventBinder.bindClick('merchant-btn', () => {
            this.eventBus.emit('input:showMerchant');
        });

        this.eventBinder.bindClick('market-btn', () => {
            this.eventBus.emit('input:showMarket');
        });

        this.eventBinder.bindClick('warehouse-btn', () => {
            this.eventBus.emit('input:showWarehouse');
        });

        this.eventBinder.bindClick('close-backpack', () => {
            this.eventBus.emit('input:hideBackpack');
        });

        this.eventBinder.bindClick('close-merchant', () => {
            this.eventBus.emit('input:hideMerchant');
        });

        this.eventBinder.bindClick('close-market', () => {
            this.eventBus.emit('input:hideMarket');
        });

        this.eventBinder.bindClick('close-warehouse', () => {
            this.eventBus.emit('input:hideWarehouse');
        });

        this.eventBinder.bindClick('close-developer', () => {
            this.eventBus.emit('input:hideDeveloper');
        });
    }

    bindTabEvents() {
        document.querySelectorAll('.inventory-tabs .tab-button').forEach(tab => {
            this.eventBinder.bind(tab, 'click', () => {
                this.eventBus.emit('input:backpackTabChanged', tab.dataset.tab);
            });
        });

        document.querySelectorAll('.merchant-tabs .tab-button').forEach(tab => {
            this.eventBinder.bind(tab, 'click', () => {
                this.eventBus.emit('input:merchantTabChanged', tab.dataset.tab);
            });
        });
    }

    bindFieldClick(fieldId, handler) {
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (fieldElement) {
            return this.eventBinder.bind(fieldElement, 'click', handler);
        }
        return null;
    }

    bindDynamicClick(element, handler) {
        return this.eventBinder.bind(element, 'click', handler);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputHandler;
}
