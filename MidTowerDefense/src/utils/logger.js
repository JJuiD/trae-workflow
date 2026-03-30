const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

const CURRENT_LEVEL = LOG_LEVELS.DEBUG;

class Logger {
    constructor(tag) {
        this.tag = tag;
    }

    debug(...args) {
        if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
            console.log(`[${this.tag}]`, ...args);
        }
    }

    info(...args) {
        if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
            console.log(`[${this.tag}]`, ...args);
        }
    }

    warn(...args) {
        if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
            console.warn(`[${this.tag}]`, ...args);
        }
    }

    error(...args) {
        if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
            console.error(`[${this.tag}]`, ...args);
        }
    }
}

const createLogger = (tag) => new Logger(tag);

export { Logger, createLogger, LOG_LEVELS };
