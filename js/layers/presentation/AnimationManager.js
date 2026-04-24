class AnimationManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
    }

    addPlantGrowingAnimation(fieldId) {
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

    addHarvestAnimation(fieldId) {
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (fieldElement) {
            fieldElement.style.transform = 'scale(0.9)';
            fieldElement.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                fieldElement.style.transform = '';
            }, 200);
        }
    }

    animateInfoPanel() {
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            infoPanel.style.transition = 'background-color 0.3s ease';
            infoPanel.style.backgroundColor = 'var(--cthulhu-gold)';
            
            setTimeout(() => {
                infoPanel.style.backgroundColor = '';
            }, 500);
        }
    }

    triggerPulse(element) {
        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = 'pulse 1s infinite';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}
