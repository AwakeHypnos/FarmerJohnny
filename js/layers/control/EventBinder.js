class EventBinder {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.bindings = [];
    }

    bind(element, eventName, handler, options = {}) {
        const wrappedHandler = (e) => {
            try {
                handler(e);
            } catch (error) {
                console.error('Event binding error:', error);
            }
        };

        element.addEventListener(eventName, wrappedHandler, options);
        
        this.bindings.push({
            element,
            eventName,
            handler: wrappedHandler,
            options
        });

        return () => this.unbind(element, eventName, wrappedHandler);
    }

    unbind(element, eventName, handler) {
        const index = this.bindings.findIndex(b => 
            b.element === element && 
            b.eventName === eventName && 
            b.handler === handler
        );

        if (index !== -1) {
            const binding = this.bindings[index];
            binding.element.removeEventListener(
                binding.eventName, 
                binding.handler, 
                binding.options
            );
            this.bindings.splice(index, 1);
            return true;
        }
        return false;
    }

    unbindAll() {
        this.bindings.forEach(binding => {
            binding.element.removeEventListener(
                binding.eventName, 
                binding.handler, 
                binding.options
            );
        });
        this.bindings = [];
    }

    bindClick(elementId, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            return this.bind(element, 'click', handler);
        }
        return null;
    }

    bindClickOutside(container, handler) {
        const outsideHandler = (e) => {
            if (!container.contains(e.target)) {
                handler(e);
            }
        };
        return this.bind(document, 'click', outsideHandler);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBinder;
}
