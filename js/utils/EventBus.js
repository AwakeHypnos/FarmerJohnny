class EventBus {
    constructor() {
        this.events = {};
        this.onceEvents = {};
    }

    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);

        return () => this.off(eventName, callback);
    }

    off(eventName, callback) {
        if (!this.events[eventName]) return;

        if (callback) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        } else {
            delete this.events[eventName];
        }
    }

    once(eventName, callback) {
        if (!this.onceEvents[eventName]) {
            this.onceEvents[eventName] = [];
        }
        this.onceEvents[eventName].push(callback);
    }

    emit(eventName, ...args) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`EventBus error in "${eventName}":`, error);
                }
            });
        }

        if (this.onceEvents[eventName]) {
            const callbacks = [...this.onceEvents[eventName]];
            delete this.onceEvents[eventName];
            
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`EventBus once error in "${eventName}":`, error);
                }
            });
        }
    }

    clear() {
        this.events = {};
        this.onceEvents = {};
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBus;
}
