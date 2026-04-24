class EffectManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }

    showToast(message, duration = 3000) {
        const oldToast = document.querySelector('.toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    updateDayNightTheme(isNight) {
        if (isNight) {
            if (!document.body.classList.contains('night-theme')) {
                document.body.classList.add('night-theme');
            }
        } else {
            document.body.classList.remove('night-theme');
        }
    }

    showFertilizerModal(fieldId, fertilizers, onSelect) {
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
        fertilizers.forEach(fertilizer => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-name">${fertilizer.name}</div>
                <div class="item-info">${fertilizer.description}</div>
                <div class="item-count">${fertilizer.count}</div>
            `;
            card.addEventListener('click', () => {
                onSelect(fertilizer.type);
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
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EffectManager;
}
