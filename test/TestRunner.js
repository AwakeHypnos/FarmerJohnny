class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    describe(suiteName, fn) {
        this.currentSuite = suiteName;
        fn();
    }

    it(testName, fn) {
        this.tests.push({
            suite: this.currentSuite,
            name: testName,
            testFn: fn
        });
    }

    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected} but got ${actual}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value but got ${actual}`);
                }
            },
            toBeFalsy: () => {
                if (actual) {
                    throw new Error(`Expected falsy value but got ${actual}`);
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected array to contain ${expected}`);
                }
            },
            toHaveLength: (expected) => {
                if (actual.length !== expected) {
                    throw new Error(`Expected length ${expected} but got ${actual.length}`);
                }
            },
            toBeGreaterThan: (expected) => {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            toBeLessThan: (expected) => {
                if (actual >= expected) {
                    throw new Error(`Expected ${actual} to be less than ${expected}`);
                }
            }
        };
    }

    async run() {
        this.passed = 0;
        this.failed = 0;
        const resultsContainer = document.getElementById('test-results');
        const summaryContainer = document.getElementById('test-summary');
        resultsContainer.innerHTML = '';
        
        let currentSuite = null;
        let suiteElement = null;

        for (const test of this.tests) {
            if (test.suite !== currentSuite) {
                currentSuite = test.suite;
                suiteElement = document.createElement('div');
                suiteElement.className = 'test-suite';
                suiteElement.innerHTML = `<h2>${currentSuite}</h2>`;
                resultsContainer.appendChild(suiteElement);
            }

            const testElement = document.createElement('div');
            testElement.className = 'test-case';
            testElement.innerHTML = `
                <span class="test-icon">⏳</span>
                <span class="test-name">${test.name}</span>
            `;
            suiteElement.appendChild(testElement);

            try {
                await test.testFn();
                testElement.className = 'test-case pass';
                testElement.querySelector('.test-icon').textContent = '✅';
                this.passed++;
            } catch (error) {
                testElement.className = 'test-case fail';
                testElement.querySelector('.test-icon').textContent = '❌';
                const errorDetails = document.createElement('div');
                errorDetails.className = 'error-details';
                errorDetails.textContent = error.message;
                testElement.appendChild(errorDetails);
                this.failed++;
            }
        }

        summaryContainer.style.display = 'block';
        summaryContainer.querySelector('.pass-count').textContent = this.passed;
        summaryContainer.querySelector('.fail-count').textContent = this.failed;

        return { passed: this.passed, failed: this.failed };
    }
}

const runner = new TestRunner();

runner.describe('PlantConfig 测试', () => {
    runner.it('应该能获取植物配置', () => {
        const plant = window.PlantConfig.getPlant('cthulhu_seedling');
        runner.expect(plant).toBeTruthy();
        runner.expect(plant.name).toBe('克苏鲁幼苗');
    });

    runner.it('应该能按季节获取植物', () => {
        const springPlants = window.PlantConfig.getPlantsBySeason('spring');
        runner.expect(springPlants.length).toBeGreaterThan(0);
    });

    runner.it('春季植物应该包含克苏鲁幼苗', () => {
        const springPlants = window.PlantConfig.getPlantsBySeason('spring');
        const hasCthulhu = springPlants.some(p => p.id === 'cthulhu_seedling');
        runner.expect(hasCthulhu).toBe(true);
    });

    runner.it('应该正确判断植物是否适应当前季节', () => {
        const isValid = window.PlantConfig.isPlantValidForSeason('cthulhu_seedling', 'spring');
        runner.expect(isValid).toBe(true);
    });

    runner.it('冬季不应该能种克苏鲁幼苗', () => {
        const isValid = window.PlantConfig.isPlantValidForSeason('cthulhu_seedling', 'winter');
        runner.expect(isValid).toBe(false);
    });
});

runner.describe('FertilizerConfig 测试', () => {
    runner.it('应该能获取肥料配置', () => {
        const fertilizer = window.FertilizerConfig.getFertilizer('basic_fertilizer');
        runner.expect(fertilizer).toBeTruthy();
        runner.expect(fertilizer.name).toBe('基础肥料');
    });

    runner.it('应该能获取所有肥料', () => {
        const fertilizers = window.FertilizerConfig.getAllFertilizers();
        runner.expect(fertilizers.length).toBe(3);
    });

    runner.it('基础肥料应该有 10% 生长加成', () => {
        const fertilizer = window.FertilizerConfig.getFertilizer('basic_fertilizer');
        runner.expect(fertilizer.growthBoost).toBe(0.1);
    });
});

runner.describe('EventBus 测试', () => {
    runner.it('应该能发布和订阅事件', () => {
        const eventBus = new EventBus();
        let received = null;
        
        eventBus.on('test:event', (data) => {
            received = data;
        });
        
        eventBus.emit('test:event', { value: 42 });
        runner.expect(received.value).toBe(42);
    });

    runner.it('应该能取消订阅事件', () => {
        const eventBus = new EventBus();
        let count = 0;
        
        const unsubscribe = eventBus.on('test:count', () => {
            count++;
        });
        
        eventBus.emit('test:count');
        unsubscribe();
        eventBus.emit('test:count');
        
        runner.expect(count).toBe(1);
    });

    runner.it('once 订阅应该只触发一次', () => {
        const eventBus = new EventBus();
        let count = 0;
        
        eventBus.once('test:once', () => {
            count++;
        });
        
        eventBus.emit('test:once');
        eventBus.emit('test:once');
        
        runner.expect(count).toBe(1);
    });
});

runner.describe('Timer 测试', () => {
    runner.it('应该能创建定时器', async () => {
        const eventBus = new EventBus();
        const timer = new Timer(eventBus);
        let triggered = false;
        
        timer.setTimeout(() => {
            triggered = true;
        }, 100);
        
        await new Promise(resolve => setTimeout(resolve, 150));
        runner.expect(triggered).toBe(true);
        timer.clearAll();
    });

    runner.it('应该能清除定时器', async () => {
        const eventBus = new EventBus();
        const timer = new Timer(eventBus);
        let triggered = false;
        
        const id = timer.setTimeout(() => {
            triggered = true;
        }, 100);
        
        timer.clearTimeout(id);
        await new Promise(resolve => setTimeout(resolve, 150));
        runner.expect(triggered).toBe(false);
        timer.clearAll();
    });
});

runner.describe('TimeModule 测试', () => {
    runner.it('应该能初始化时间', () => {
        const eventBus = new EventBus();
        const timeModule = new TimeModule(eventBus);
        
        timeModule.init(5, 12, 30, 'summer');
        
        runner.expect(timeModule.getDay()).toBe(5);
        runner.expect(timeModule.getHour()).toBe(12);
        runner.expect(timeModule.getMinute()).toBe(30);
        runner.expect(timeModule.getSeason()).toBe('summer');
    });

    runner.it('应该能推进时间', () => {
        const eventBus = new EventBus();
        const timeModule = new TimeModule(eventBus);
        
        timeModule.init(1, 6, 0, 'spring');
        const startHour = timeModule.getHour();
        
        timeModule.advanceTime(60);
        
        runner.expect(timeModule.getHour()).toBe(startHour + 1);
    });

    runner.it('应该能判断是否是夜晚', () => {
        const eventBus = new EventBus();
        const timeModule = new TimeModule(eventBus);
        
        timeModule.init(1, 20, 0, 'spring');
        runner.expect(timeModule.isNight()).toBe(true);
        
        timeModule.init(1, 10, 0, 'spring');
        runner.expect(timeModule.isNight()).toBe(false);
    });

    runner.it('应该能获取格式化时间', () => {
        const eventBus = new EventBus();
        const timeModule = new TimeModule(eventBus);
        
        timeModule.init(1, 8, 5, 'spring');
        runner.expect(timeModule.getFormattedTime()).toBe('08:05');
    });
});

runner.describe('GameState 测试', () => {
    runner.it('应该能初始化游戏状态', () => {
        const gameState = new GameState();
        gameState.init();
        
        runner.expect(gameState.getMoney()).toBe(1000);
    });

    runner.it('应该能添加和扣除金币', () => {
        const gameState = new GameState();
        gameState.init();
        
        gameState.addMoney(500);
        runner.expect(gameState.getMoney()).toBe(1500);
        
        gameState.subtractMoney(300);
        runner.expect(gameState.getMoney()).toBe(1200);
    });

    runner.it('应该能判断是否有足够金币', () => {
        const gameState = new GameState();
        gameState.init();
        
        runner.expect(gameState.hasEnoughMoney(500)).toBe(true);
        runner.expect(gameState.hasEnoughMoney(2000)).toBe(false);
    });

    runner.it('应该能管理种子', () => {
        const gameState = new GameState();
        gameState.init();
        
        gameState.addSeed('cthulhu_seedling', 5);
        runner.expect(gameState.getSeedCount('cthulhu_seedling')).toBe(5);
        runner.expect(gameState.hasSeed('cthulhu_seedling')).toBe(true);
        
        gameState.removeSeed('cthulhu_seedling', 2);
        runner.expect(gameState.getSeedCount('cthulhu_seedling')).toBe(3);
    });

    runner.it('应该能管理作物', () => {
        const gameState = new GameState();
        gameState.init();
        
        gameState.addCrop('cthulhu_seedling', 3);
        runner.expect(gameState.getCropCount('cthulhu_seedling')).toBe(3);
        runner.expect(gameState.hasCrop('cthulhu_seedling')).toBe(true);
    });

    runner.it('应该能管理肥料', () => {
        const gameState = new GameState();
        gameState.init();
        
        gameState.addFertilizer('basic_fertilizer', 10);
        runner.expect(gameState.getFertilizerCount('basic_fertilizer')).toBe(10);
        runner.expect(gameState.hasFertilizer('basic_fertilizer')).toBe(true);
    });

    runner.it('应该能获取可用肥料列表', () => {
        const gameState = new GameState();
        gameState.init();
        
        gameState.addFertilizer('basic_fertilizer', 5);
        gameState.addFertilizer('premium_fertilizer', 3);
        
        const available = gameState.getAvailableFertilizers();
        runner.expect(available.length).toBe(2);
    });
});

runner.describe('EconomyModule 测试', () => {
    runner.it('应该能按季节获取种子', () => {
        const eventBus = new EventBus();
        const gameState = new GameState();
        const timeModule = new TimeModule(eventBus);
        
        timeModule.init(1, 6, 0, 'spring');
        gameState.init();
        
        const economyModule = new EconomyModule(eventBus, gameState, timeModule);
        
        const seeds = economyModule.getAvailableSeedsForCurrentSeason();
        runner.expect(seeds.length).toBeGreaterThan(0);
    });

    runner.it('应该能获取所有肥料', () => {
        const eventBus = new EventBus();
        const gameState = new GameState();
        const timeModule = new TimeModule(eventBus);
        
        gameState.init();
        
        const economyModule = new EconomyModule(eventBus, gameState, timeModule);
        
        const fertilizers = economyModule.getAllFertilizers();
        runner.expect(fertilizers.length).toBe(3);
    });

    runner.it('应该能购买种子', () => {
        const eventBus = new EventBus();
        const gameState = new GameState();
        const timeModule = new TimeModule(eventBus);
        
        gameState.init();
        const initialMoney = gameState.getMoney();
        
        const economyModule = new EconomyModule(eventBus, gameState, timeModule);
        
        const result = economyModule.buySeed('cthulhu_seedling');
        runner.expect(result.success).toBe(true);
        runner.expect(gameState.hasSeed('cthulhu_seedling')).toBe(true);
        runner.expect(gameState.getMoney()).toBeLessThan(initialMoney);
    });

    runner.it('金币不足时不能购买', () => {
        const eventBus = new EventBus();
        const gameState = new GameState();
        const timeModule = new TimeModule(eventBus);
        
        gameState.init();
        gameState.subtractMoney(990);
        
        const economyModule = new EconomyModule(eventBus, gameState, timeModule);
        
        const result = economyModule.buySeed('cthulhu_seedling');
        runner.expect(result.success).toBe(false);
    });

    runner.it('应该能更新市场价格', () => {
        const eventBus = new EventBus();
        const gameState = new GameState();
        const timeModule = new TimeModule(eventBus);
        
        gameState.init();
        
        const economyModule = new EconomyModule(eventBus, gameState, timeModule);
        economyModule.init();
        
        const prices = economyModule.getAllMarketPrices();
        runner.expect(prices.length).toBeGreaterThan(0);
    });
});

runner.describe('FarmingModule 测试', () => {
    runner.it('应该能初始化田地', () => {
        const eventBus = new EventBus();
        const gameState = new GameState();
        const timeModule = new TimeModule(eventBus);
        const environmentModule = new EnvironmentModule(eventBus, timeModule);
        
        gameState.init();
        timeModule.init(1, 6, 0, 'spring');
        
        const farmingModule = new FarmingModule(
            eventBus, gameState, timeModule, environmentModule
        );
        
        farmingModule.init();
        
        const fields = farmingModule.getAllFields();
        runner.expect(fields.length).toBe(9);
    });

    runner.it('应该能选择种子', () => {
        const eventBus = new EventBus();
        const gameState = new GameState();
        const timeModule = new TimeModule(eventBus);
        const environmentModule = new EnvironmentModule(eventBus, timeModule);
        
        gameState.init();
        timeModule.init(1, 6, 0, 'spring');
        
        const farmingModule = new FarmingModule(
            eventBus, gameState, timeModule, environmentModule
        );
        
        farmingModule.selectSeed('cthulhu_seedling');
        runner.expect(farmingModule.getSelectedSeed()).toBe('cthulhu_seedling');
    });

    runner.it('应该能给田地浇水', () => {
        const eventBus = new EventBus();
        const gameState = new GameState();
        const timeModule = new TimeModule(eventBus);
        const environmentModule = new EnvironmentModule(eventBus, timeModule);
        
        gameState.init();
        timeModule.init(1, 6, 0, 'spring');
        
        const farmingModule = new FarmingModule(
            eventBus, gameState, timeModule, environmentModule
        );
        
        farmingModule.init();
        
        const result = farmingModule.waterField(0);
        runner.expect(result.success).toBe(true);
        
        const field = farmingModule.getField(0);
        runner.expect(field.watered).toBe(true);
    });

    runner.it('种植前应该检查条件', () => {
        const eventBus = new EventBus();
        const gameState = new GameState();
        const timeModule = new TimeModule(eventBus);
        const environmentModule = new EnvironmentModule(eventBus, timeModule);
        
        gameState.init();
        timeModule.init(1, 6, 0, 'spring');
        
        const farmingModule = new FarmingModule(
            eventBus, gameState, timeModule, environmentModule
        );
        
        farmingModule.init();
        
        const result = farmingModule.canPlant(0, 'cthulhu_seedling');
        runner.expect(result.canPlant).toBe(false);
        runner.expect(result.reason).toBe('背包中没有种子');
    });

    runner.it('有种子时应该能种植', () => {
        const eventBus = new EventBus();
        const gameState = new GameState();
        const timeModule = new TimeModule(eventBus);
        const environmentModule = new EnvironmentModule(eventBus, timeModule);
        
        gameState.init();
        timeModule.init(1, 6, 0, 'spring');
        gameState.addSeed('cthulhu_seedling', 5);
        
        const farmingModule = new FarmingModule(
            eventBus, gameState, timeModule, environmentModule
        );
        
        farmingModule.init();
        
        const result = farmingModule.plantSeed(0, 'cthulhu_seedling');
        runner.expect(result.success).toBe(true);
        
        const field = farmingModule.getField(0);
        runner.expect(field.plant).toBe('cthulhu_seedling');
    });
});

runner.describe('Utils 测试', () => {
    runner.it('应该能限制数值范围', () => {
        runner.expect(Utils.clamp(5, 0, 10)).toBe(5);
        runner.expect(Utils.clamp(-1, 0, 10)).toBe(0);
        runner.expect(Utils.clamp(15, 0, 10)).toBe(10);
    });

    runner.it('应该能生成随机范围数值', () => {
        for (let i = 0; i < 10; i++) {
            const num = Utils.randomRange(1, 5);
            runner.expect(num).toBeGreaterThan(1);
            runner.expect(num).toBeLessThan(5);
        }
    });

    runner.it('应该能深拷贝对象', () => {
        const original = { a: 1, b: { c: 2 } };
        const cloned = Utils.deepClone(original);
        
        cloned.b.c = 999;
        runner.expect(original.b.c).toBe(2);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const runBtn = document.getElementById('run-tests');
    runBtn.addEventListener('click', () => {
        runner.run();
    });
});
