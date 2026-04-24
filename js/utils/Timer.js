class Timer {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.intervals = {};
        this.timeouts = {};
        this.nextId = 1;
    }

    setInterval(callback, interval, id = null) {
        const timerId = id || `interval_${this.nextId++}`;
        
        if (this.intervals[timerId]) {
            clearInterval(this.intervals[timerId]);
        }

        this.intervals[timerId] = setInterval(() => {
            try {
                callback();
            } catch (error) {
                console.error('Timer interval error:', error);
            }
        }, interval);

        return timerId;
    }

    clearInterval(timerId) {
        if (this.intervals[timerId]) {
            clearInterval(this.intervals[timerId]);
            delete this.intervals[timerId];
            return true;
        }
        return false;
    }

    setTimeout(callback, delay, id = null) {
        const timerId = id || `timeout_${this.nextId++}`;

        if (this.timeouts[timerId]) {
            clearTimeout(this.timeouts[timerId]);
        }

        this.timeouts[timerId] = setTimeout(() => {
            delete this.timeouts[timerId];
            try {
                callback();
            } catch (error) {
                console.error('Timer timeout error:', error);
            }
        }, delay);

        return timerId;
    }

    clearTimeout(timerId) {
        if (this.timeouts[timerId]) {
            clearTimeout(this.timeouts[timerId]);
            delete this.timeouts[timerId];
            return true;
        }
        return false;
    }

    clearAll() {
        for (const id in this.intervals) {
            clearInterval(this.intervals[id]);
        }
        this.intervals = {};

        for (const id in this.timeouts) {
            clearTimeout(this.timeouts[id]);
        }
        this.timeouts = {};
    }

    hasInterval(timerId) {
        return !!this.intervals[timerId];
    }

    hasTimeout(timerId) {
        return !!this.timeouts[timerId];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timer;
}
