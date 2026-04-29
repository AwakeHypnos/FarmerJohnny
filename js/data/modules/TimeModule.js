class TimeModule {
    constructor(eventBus) {
        this.eventBus = eventBus;
        
        this.state = {
            day: 1,
            hour: 0,
            minute: 0,
            season: 'spring',
            seasons: ['spring', 'summer', 'autumn', 'winter'],
            seasonNames: {
                'spring': '春',
                'summer': '夏',
                'autumn': '秋',
                'winter': '冬'
            }
        };

        this.config = {
            realMinutesPerGameDay: 5,
            gameHoursPerDay: 24,
            gameMinutesPerHour: 60,
            daysPerSeason: 7
        };
    }

    init(startDay = 1, startHour = 6, startMinute = 0, startSeason = 'spring') {
        this.state.day = startDay;
        this.state.hour = startHour;
        this.state.minute = startMinute;
        this.state.season = startSeason;
    }

    getTimeState() {
        return { ...this.state };
    }

    getDay() {
        return this.state.day;
    }

    getHour() {
        return Math.floor(this.state.hour);
    }

    getMinute() {
        return Math.floor(this.state.minute);
    }

    getSeason() {
        return this.state.season;
    }

    getSeasonName() {
        return this.state.seasonNames[this.state.season];
    }

    isNight() {
        const hour = this.getHour();
        return hour >= 18 || hour < 6;
    }

    advanceTime(gameMinutesToAdvance) {
        const oldHour = this.getHour();
        const oldDay = this.state.day;
        const oldSeason = this.state.season;

        this.state.minute += gameMinutesToAdvance;

        while (this.state.minute >= 60) {
            this.state.minute -= 60;
            this.state.hour++;

            while (this.state.hour >= 24) {
                this.state.hour -= 24;
                this.state.day++;

                this.eventBus.emit('time:newDay', {
                    day: this.state.day,
                    previousDay: oldDay
                });

                if ((this.state.day - 1) % this.config.daysPerSeason === 0 && this.state.day > 1) {
                    this.advanceSeason();
                }
            }
        }

        const newHour = this.getHour();
        if (oldHour !== newHour) {
            this.eventBus.emit('time:hourChanged', {
                hour: newHour,
                previousHour: oldHour
            });

            if (newHour === 6 && oldHour === 5) {
                this.eventBus.emit('time:dawn');
            } else if (newHour === 18 && oldHour === 17) {
                this.eventBus.emit('time:dusk');
            }
        }

        this.eventBus.emit('time:updated', this.getTimeState());
    }

    advanceSeason() {
        const currentIndex = this.state.seasons.indexOf(this.state.season);
        const nextIndex = (currentIndex + 1) % this.state.seasons.length;
        const oldSeason = this.state.season;
        this.state.season = this.state.seasons[nextIndex];

        this.eventBus.emit('time:seasonChanged', {
            newSeason: this.state.season,
            oldSeason: oldSeason,
            seasonName: this.getSeasonName()
        });
    }

    getFormattedTime() {
        const hour = this.getHour();
        const minute = this.getMinute();
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    getDayProgress() {
        const totalMinutes = this.state.hour * 60 + this.state.minute;
        return totalMinutes / (24 * 60);
    }

    setState(state) {
        this.state = { ...this.state, ...state };
    }

    getRealMsPerGameMinute() {
        return (this.config.realMinutesPerGameDay * 60 * 1000) /
               (this.config.gameHoursPerDay * this.config.gameMinutesPerHour);
    }

    getTotalMinutes() {
        return (this.state.day - 1) * 24 * 60 + this.state.hour * 60 + this.state.minute;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeModule;
}
