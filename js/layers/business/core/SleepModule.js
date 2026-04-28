class SleepModule {
    constructor(eventBus, gameState, timeModule, sanityModule) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        this.timeModule = timeModule;
        this.sanityModule = sanityModule;

        this.sleepState = {
            isSleeping: false,
            sleepStartTime: null,
            lastSleepDay: 0,
            consecutivePoorSleepDays: 0,
            hasSleepDeprivationDebuff: false
        };

        this.setupListeners();
    }

    setupListeners() {
        this.eventBus.on('ui:sleep', (hours) => {
            this.startSleep(hours);
        });

        this.eventBus.on('time:newDay', (data) => {
            this.checkDailySleep(data.day);
        });
    }

    getSleepState() {
        return { ...this.sleepState };
    }

    canSleep() {
        const hour = this.timeModule.getHour();
        return hour >= 20 || hour < 6;
    }

    getAvailableSleepHours() {
        const timeState = this.timeModule.getTimeState();
        const exactHour = timeState.hour;
        const minute = timeState.minute;
        const currentTime = exactHour + minute / 60;
        
        if (currentTime >= 20) {
            return 10 - (currentTime - 20);
        } else if (currentTime >= 18) {
            return 12 - (currentTime - 18);
        } else if (currentTime >= 6 && currentTime < 18) {
            return 0;
        } else {
            return 6 - currentTime;
        }
    }

    startSleep(hoursToSleep) {
        if (this.sleepState.isSleeping) {
            return { success: false, reason: '已经在睡觉中' };
        }

        const availableHours = this.getAvailableSleepHours();
        if (availableHours <= 0) {
            return { success: false, reason: '现在不是睡觉时间（晚上8点到早上6点）' };
        }

        const actualSleepHours = Math.min(hoursToSleep, availableHours);
        
        this.sleepState.isSleeping = true;
        this.sleepState.sleepStartTime = {
            day: this.timeModule.getDay(),
            hour: this.timeModule.getHour(),
            minute: this.timeModule.getMinute()
        };

        const minutesToAdvance = Math.floor(actualSleepHours * 60);
        this.timeModule.advanceTime(minutesToAdvance);

        this.applySleepEffects(actualSleepHours);

        this.sleepState.isSleeping = false;
        this.sleepState.lastSleepDay = this.timeModule.getDay();

        this.eventBus.emit('sleep:completed', {
            hoursSlept: actualSleepHours,
            isPoorSleep: actualSleepHours < 3
        });

        return { 
            success: true, 
            hoursSlept: actualSleepHours,
            wasPoorSleep: actualSleepHours < 3
        };
    }

    applySleepEffects(hoursSlept) {
        const maxSanityRestore = 100;
        const optimalHours = 7.5;
        
        let sanityRestore;
        if (hoursSlept >= optimalHours) {
            sanityRestore = maxSanityRestore;
        } else {
            const ratio = hoursSlept / optimalHours;
            sanityRestore = Math.floor(maxSanityRestore * ratio);
        }

        if (sanityRestore > 0) {
            const currentSanity = this.sanityModule.getSanity();
            const maxToRestore = 100 - currentSanity;
            const actualRestore = Math.min(sanityRestore, maxToRestore);
            
            if (actualRestore > 0) {
                this.sanityModule.modifySanity(actualRestore, `睡眠${hoursSlept}小时`);
            }
        }

        if (hoursSlept < 3) {
            this.sleepState.consecutivePoorSleepDays++;
        } else {
            this.sleepState.consecutivePoorSleepDays = 0;
        }

        if (this.sleepState.consecutivePoorSleepDays >= 3) {
            this.applySleepDeprivationDebuff();
        } else if (this.sleepState.hasSleepDeprivationDebuff && this.sleepState.consecutivePoorSleepDays === 0) {
            this.removeSleepDeprivationDebuff();
        }
    }

    checkDailySleep(day) {
        const hoursSinceLastSleep = (day - this.sleepState.lastSleepDay) * 24;
        
        if (hoursSinceLastSleep > 24 && this.sleepState.lastSleepDay > 0) {
            this.sleepState.consecutivePoorSleepDays++;
            
            if (this.sleepState.consecutivePoorSleepDays >= 3) {
                this.applySleepDeprivationDebuff();
            }
        }
    }

    applySleepDeprivationDebuff() {
        if (!this.sleepState.hasSleepDeprivationDebuff) {
            this.sleepState.hasSleepDeprivationDebuff = true;
            this.sanityModule.modifySanity(-15, '睡眠不足Debuff');
            this.eventBus.emit('sleep:debuffAdded', {
                type: 'sleepDeprivation',
                reason: '连续3天睡眠不足3小时'
            });
        }
    }

    removeSleepDeprivationDebuff() {
        if (this.sleepState.hasSleepDeprivationDebuff) {
            this.sleepState.hasSleepDeprivationDebuff = false;
            this.eventBus.emit('sleep:debuffRemoved', {
                type: 'sleepDeprivation'
            });
        }
    }

    hasSleepDeprivation() {
        return this.sleepState.hasSleepDeprivationDebuff;
    }

    getConsecutivePoorSleepDays() {
        return this.sleepState.consecutivePoorSleepDays;
    }

    getFullState() {
        return {
            sleepState: { ...this.sleepState }
        };
    }

    loadState(savedData) {
        if (savedData.sleepState) {
            this.sleepState = { ...this.sleepState, ...savedData.sleepState };
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SleepModule;
}
