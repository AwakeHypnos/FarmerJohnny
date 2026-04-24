class Logger {
    constructor(prefix = 'FarmerJohnny') {
        this.prefix = prefix;
        this.enabled = true;
        this.logHistory = [];
        this.maxHistory = 100;
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }

    _log(level, ...args) {
        if (!this.enabled) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            prefix: this.prefix,
            message: args.join(' ')
        };

        this.logHistory.push(logEntry);
        if (this.logHistory.length > this.maxHistory) {
            this.logHistory.shift();
        }

        const consoleArgs = [`[${timestamp}] [${this.prefix}] [${level.toUpperCase()}]`, ...args];

        switch (level) {
            case 'debug':
                console.debug(...consoleArgs);
                break;
            case 'info':
                console.info(...consoleArgs);
                break;
            case 'warn':
                console.warn(...consoleArgs);
                break;
            case 'error':
                console.error(...consoleArgs);
                break;
            default:
                console.log(...consoleArgs);
        }
    }

    debug(...args) {
        this._log('debug', ...args);
    }

    info(...args) {
        this._log('info', ...args);
    }

    log(...args) {
        this._log('log', ...args);
    }

    warn(...args) {
        this._log('warn', ...args);
    }

    error(...args) {
        this._log('error', ...args);
    }

    getHistory() {
        return [...this.logHistory];
    }

    clearHistory() {
        this.logHistory = [];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}
