class ExplorationModule {
    constructor(eventBus, gameState, timeModule, environmentModule, sanityModule, pollutionModule) {
        this.eventBus = eventBus;
        this.gameState = gameState;
        this.timeModule = timeModule;
        this.environmentModule = environmentModule;
        this.sanityModule = sanityModule;
        this.pollutionModule = pollutionModule;

        this.state = {
            unlockedRegions: [],
            collectedArtifacts: [],
            readArtifacts: [],
            passiveTalents: [],
            currentExploration: null,
            explorationProgress: 0,
            isExploring: false,
            discoveredLore: [],
            regionVisits: {}
        };

        this.setupListeners();
    }

    setupListeners() {
        this.eventBus.on('time:dayChanged', () => {
            this.checkRegionUnlocks();
        });

        this.eventBus.on('pollution:changed', () => {
            this.checkRegionUnlocks();
        });

        this.eventBus.on('environment:dayNightChanged', () => {
            this.checkRegionUnlocks();
        });
    }

    init() {
        this.state = {
            unlockedRegions: [],
            collectedArtifacts: [],
            readArtifacts: [],
            passiveTalents: [],
            currentExploration: null,
            explorationProgress: 0,
            isExploring: false,
            discoveredLore: [],
            regionVisits: {}
        };

        this.checkRegionUnlocks();
        this.eventBus.emit('exploration:initialized');
    }

    checkRegionUnlocks() {
        const ExplorationConfig = window.ExplorationConfig || {};
        const allRegions = ExplorationConfig.getAllRegions ? ExplorationConfig.getAllRegions() : [];
        
        const currentDay = this.timeModule.getDay();
        const currentPollution = this.gameState.getPollution();
        const isNight = this.environmentModule.isNightTime ? this.environmentModule.isNightTime() : false;
        const collectedArtifactIds = this.state.collectedArtifacts.map(a => a.id);

        const newlyUnlocked = [];

        for (const region of allRegions) {
            if (this.state.unlockedRegions.includes(region.id)) continue;

            const isUnlocked = ExplorationConfig.isRegionUnlocked ? 
                ExplorationConfig.isRegionUnlocked(region, currentDay, currentPollution, isNight, collectedArtifactIds) :
                this._checkRegionConditions(region, currentDay, currentPollution, isNight, collectedArtifactIds);

            if (isUnlocked) {
                this.state.unlockedRegions.push(region.id);
                newlyUnlocked.push(region);
            }
        }

        if (newlyUnlocked.length > 0) {
            for (const region of newlyUnlocked) {
                this.eventBus.emit('exploration:regionUnlocked', {
                    regionId: region.id,
                    regionName: region.name,
                    regionTier: region.tier
                });
            }
            this.eventBus.emit('exploration:regionsUpdated', this.getUnlockedRegions());
        }
    }

    _checkRegionConditions(region, currentDay, currentPollution, isNight, collectedItems) {
        for (const condition of region.unlockConditions) {
            switch (condition.type) {
                case 'time':
                    if (currentDay < condition.value) return false;
                    break;
                case 'pollution':
                    if (currentPollution < condition.value) return false;
                    break;
                case 'night':
                    if (condition.value && !isNight) return false;
                    break;
                case 'item':
                    if (!collectedItems.includes(condition.value)) return false;
                    break;
            }
        }
        return true;
    }

    getUnlockedRegions() {
        const ExplorationConfig = window.ExplorationConfig || {};
        return this.state.unlockedRegions.map(id => {
            const region = ExplorationConfig.getRegion ? ExplorationConfig.getRegion(id) : null;
            if (region) {
                return {
                    ...region,
                    visitCount: this.state.regionVisits[id] || 0
                };
            }
            return null;
        }).filter(Boolean);
    }

    getAllRegions() {
        const ExplorationConfig = window.ExplorationConfig || {};
        const allRegions = ExplorationConfig.getAllRegions ? ExplorationConfig.getAllRegions() : [];
        
        return allRegions.map(region => ({
            ...region,
            isUnlocked: this.state.unlockedRegions.includes(region.id),
            visitCount: this.state.regionVisits[region.id] || 0
        }));
    }

    canExplore(regionId) {
        const ExplorationConfig = window.ExplorationConfig || {};
        const region = ExplorationConfig.getRegion ? ExplorationConfig.getRegion(regionId) : null;

        if (!region) {
            return { canExplore: false, reason: '区域不存在' };
        }

        if (!this.state.unlockedRegions.includes(regionId)) {
            return { canExplore: false, reason: '区域尚未解锁' };
        }

        if (this.state.isExploring) {
            return { canExplore: false, reason: '正在探索中，请等待完成' };
        }

        const currentSanity = this.gameState.getSanity();
        const sanityCost = this._calculateSanityCost(region);
        if (currentSanity < sanityCost) {
            return { canExplore: false, reason: `理智不足，需要 ${sanityCost} 点理智` };
        }

        return { canExplore: true };
    }

    _calculateSanityCost(region) {
        let baseCost = region.baseSanityCost;
        
        for (const talent of this.state.passiveTalents) {
            if (talent.type === 'sanity_shield' || talent.type === 'sanity_loss_reduction') {
                baseCost = Math.floor(baseCost * (1 - talent.value / 100));
            }
        }
        
        return Math.max(1, baseCost);
    }

    startExploration(regionId) {
        const check = this.canExplore(regionId);
        if (!check.canExplore) {
            this.eventBus.emit('exploration:error', { message: check.reason });
            return { success: false, reason: check.reason };
        }

        const ExplorationConfig = window.ExplorationConfig || {};
        const region = ExplorationConfig.getRegion ? ExplorationConfig.getRegion(regionId) : null;

        if (!region) {
            return { success: false, reason: '区域不存在' };
        }

        const sanityCost = this._calculateSanityCost(region);
        this.sanityModule.modifySanity(-sanityCost, '开始探索');

        const nightBonus = this.state.passiveTalents.some(t => t.type === 'night_exploration_bonus');

        this.state.currentExploration = {
            regionId,
            region,
            startTime: this.timeModule.getTotalMinutes(),
            explorationTime: region.explorationTime,
            nightBonus,
            encounteredEvent: false
        };
        this.state.explorationProgress = 0;
        this.state.isExploring = true;

        if (!this.state.regionVisits[regionId]) {
            this.state.regionVisits[regionId] = 0;
        }
        this.state.regionVisits[regionId]++;

        this.eventBus.emit('exploration:started', {
            regionId,
            regionName: region.name,
            explorationTime: region.explorationTime
        });

        return { success: true };
    }

    updateExploration(gameMinutes) {
        if (!this.state.isExploring || !this.state.currentExploration) {
            return;
        }

        const exploration = this.state.currentExploration;
        const progressPerMinute = 1 / exploration.explorationTime;
        const progressIncrease = progressPerMinute * gameMinutes;

        this.state.explorationProgress += progressIncrease;

        if (!exploration.encounteredEvent && Math.random() < exploration.region.encounterChance * progressIncrease) {
            exploration.encounteredEvent = true;
            this._triggerRandomEvent();
        }

        if (this.state.explorationProgress >= 1) {
            this._completeExploration();
        }

        this.eventBus.emit('exploration:progressUpdated', {
            progress: this.state.explorationProgress,
            regionId: exploration.regionId
        });
    }

    _triggerRandomEvent() {
        const ExplorationConfig = window.ExplorationConfig || {};
        const regionEvents = this.state.currentExploration.region.regionEvents || [];
        
        let event;
        if (regionEvents.length > 0 && Math.random() < 0.6) {
            const eventId = regionEvents[Math.floor(Math.random() * regionEvents.length)];
            event = this._getRegionSpecificEvent(eventId);
        } else {
            event = ExplorationConfig.getRandomMysteryEvent ? ExplorationConfig.getRandomMysteryEvent() : null;
        }

        if (event) {
            this.eventBus.emit('exploration:mysteryEvent', {
                ...event,
                regionId: this.state.currentExploration.regionId
            });
        }
    }

    _getRegionSpecificEvent(eventId) {
        const regionEvents = {
            flickering_light: {
                id: 'flickering_light',
                name: '闪烁的灯光',
                description: '废弃建筑中似乎有灯光在闪烁...',
                icon: '💡',
                type: 'neutral',
                choices: [
                    { id: 'investigate', text: '调查光源', outcome: { type: 'investigate_light' } },
                    { id: 'ignore', text: '忽略它', outcome: { type: 'safe_ignore' } }
                ]
            },
            whispering_wind: {
                id: 'whispering_wind',
                name: '低语的风',
                description: '风中似乎夹杂着低沉的低语声...',
                icon: '🌬️',
                type: 'neutral',
                choices: [
                    { id: 'listen', text: '侧耳倾听', outcome: { type: 'listen_whisper' } },
                    { id: 'leave', text: '快速离开', outcome: { type: 'safe_leave' } }
                ]
            },
            moving_shadow: {
                id: 'moving_shadow',
                name: '移动的阴影',
                description: '树干投下的阴影似乎在自行移动...',
                icon: '👤',
                type: 'dangerous',
                choices: [
                    { id: 'watch', text: '仔细观察', outcome: { type: 'observe_shadow' } },
                    { id: 'flee', text: '立即逃离', outcome: { type: 'flee', exploreInterrupt: true } }
                ]
            },
            fungal_cloud: {
                id: 'fungal_cloud',
                name: '孢子云',
                description: '一团奇异的孢子云正从地面升起...',
                icon: '☁️',
                type: 'neutral',
                choices: [
                    { id: 'breathe', text: '深呼吸', outcome: { type: 'hallucination' } },
                    { id: 'hold', text: '屏住呼吸穿过', outcome: { type: 'safe_pass' } }
                ]
            },
            water_ripple: {
                id: 'water_ripple',
                name: '水面涟漪',
                description: '平静的水面突然泛起了涟漪，似乎有什么东西在水下...',
                icon: '🌊',
                type: 'neutral',
                choices: [
                    { id: 'wait', text: '等待观察', outcome: { type: 'wait_and_see' } },
                    { id: 'disturb', text: '扰动水面', outcome: { type: 'disturb_water' } },
                    { id: 'leave', text: '离开这里', outcome: { type: 'safe_leave' } }
                ]
            },
            floating_lantern: {
                id: 'floating_lantern',
                name: '漂浮灯笼',
                description: '一盏古老的灯笼正漂浮在沼泽上方，没有任何支撑...',
                icon: '🏮',
                type: 'positive',
                choices: [
                    { id: 'approach', text: '接近灯笼', outcome: { type: 'approach_lantern' } },
                    { id: 'observe', text: '从远处观察', outcome: { type: 'observe_lantern' } }
                ]
            },
            stone_hum: {
                id: 'stone_hum',
                name: '石碑嗡鸣',
                description: '古老的石碑开始发出低沉的嗡鸣声...',
                icon: '🗿',
                type: 'neutral',
                choices: [
                    { id: 'touch', text: '触摸石碑', outcome: { type: 'touch_stone' } },
                    { id: 'chant', text: '尝试与石碑共鸣', outcome: { type: 'resonate_stone' } },
                    { id: 'back', text: '保持距离', outcome: { type: 'safe_distance' } }
                ]
            },
            shadow_dance: {
                id: 'shadow_dance',
                name: '阴影之舞',
                description: '石碑间的阴影似乎在进行某种仪式性的舞蹈...',
                icon: '💃',
                type: 'dangerous',
                choices: [
                    { id: 'join', text: '尝试模仿舞蹈', outcome: { type: 'join_dance' } },
                    { id: 'watch', text: '静静观看', outcome: { type: 'watch_dance' } },
                    { id: 'flee', text: '恐惧地逃离', outcome: { type: 'flee', exploreInterrupt: true } }
                ]
            },
            lingering_chant: {
                id: 'lingering_chant',
                name: '萦绕的圣歌',
                description: '空气中似乎还残留着古老圣歌的回音...',
                icon: '🎵',
                type: 'neutral',
                choices: [
                    { id: 'listen', text: '仔细聆听', outcome: { type: 'listen_chant' } },
                    { id: 'chant_back', text: '尝试回应', outcome: { type: 'chant_back' } },
                    { id: 'leave', text: '离开这个地方', outcome: { type: 'safe_leave' } }
                ]
            },
            blood_stain: {
                id: 'blood_stain',
                name: '血迹',
                description: '地上有新鲜的血迹，似乎是不久前留下的...',
                icon: '🩸',
                type: 'dangerous',
                choices: [
                    { id: 'investigate', text: '调查血迹来源', outcome: { type: 'investigate_blood' } },
                    { id: 'track', text: '追踪血迹', outcome: { type: 'track_blood' } },
                    { id: 'leave', text: '这太危险了，离开', outcome: { type: 'safe_leave' } }
                ]
            },
            distant_call: {
                id: 'distant_call',
                name: '远方的呼唤',
                description: '从深海方向传来阵阵奇异的呼唤声...',
                icon: '🐋',
                type: 'neutral',
                choices: [
                    { id: 'respond', text: '尝试回应', outcome: { type: 'respond_call' } },
                    { id: 'wade', text: '涉水前进', outcome: { type: 'wade_forward' } },
                    { id: 'back', text: '退回陆地', outcome: { type: 'safe_retreat' } }
                ]
            },
            bioluminescent_path: {
                id: 'bioluminescent_path',
                name: '发光小径',
                description: '一条由发光微生物组成的小径从海滩延伸入海...',
                icon: '✨',
                type: 'positive',
                choices: [
                    { id: 'follow', text: '跟随小径', outcome: { type: 'follow_path' } },
                    { id: 'collect', text: '收集发光样本', outcome: { type: 'collect_sample' } }
                ]
            },
            drip_sound: {
                id: 'drip_sound',
                name: '滴水声',
                description: '洞穴深处传来规律的滴水声，像某种密码...',
                icon: '💧',
                type: 'neutral',
                choices: [
                    { id: 'decipher', text: '尝试解读', outcome: { type: 'decipher_code' } },
                    { id: 'follow', text: '追踪声音来源', outcome: { type: 'follow_sound' } },
                    { id: 'ignore', text: '继续深入', outcome: { type: 'continue_deeper' } }
                ]
            },
            echo_voice: {
                id: 'echo_voice',
                name: '回音',
                description: '你的声音在洞穴中回荡，但似乎有什么东西在模仿你...',
                icon: '🗣️',
                type: 'dangerous',
                choices: [
                    { id: 'converse', text: '尝试与它对话', outcome: { type: 'converse_echo' } },
                    { id: 'silence', text: '保持沉默', outcome: { type: 'stay_silent' } },
                    { id: 'shout', text: '大声呼喊', outcome: { type: 'shout_loud' } }
                ]
            },
            star_voice: {
                id: 'star_voice',
                name: '星辰之声',
                description: '从裂隙中传来群星的低语，它们似乎在告诉你什么...',
                icon: '🌟',
                type: 'dangerous',
                choices: [
                    { id: 'listen', text: '全神贯注地倾听', outcome: { type: 'listen_stars' } },
                    { id: 'glimpse', text: '窥探裂隙', outcome: { type: 'glimpse_rift' } },
                    { id: 'close', text: '用尽全力闭上眼睛', outcome: { type: 'close_eyes' } }
                ]
            },
            reality_warp: {
                id: 'reality_warp',
                name: '现实扭曲',
                description: '周围的空间开始扭曲，你感到方向感完全丧失...',
                icon: '🌀',
                type: 'dangerous',
                choices: [
                    { id: 'embrace', text: '接受扭曲', outcome: { type: 'embrace_warp' } },
                    { id: 'resist', text: '努力维持自我', outcome: { type: 'resist_warp' } },
                    { id: 'panic', text: '惊慌失措', outcome: { type: 'panic' } }
                ]
            },
            unearthly_hymn: {
                id: 'unearthly_hymn',
                name: '非人间的圣歌',
                description: '神殿中回荡着不属于这个世界的圣歌，你的灵魂在颤抖...',
                icon: '🎶',
                type: 'dangerous',
                choices: [
                    { id: 'worship', text: '虔诚地聆听', outcome: { type: 'worship_hymn' } },
                    { id: 'pray', text: '用自己的方式祈祷', outcome: { type: 'pray_self' } },
                    { id: 'block', text: '堵住耳朵', outcome: { type: 'block_ears' } }
                ]
            },
            statue_gaze: {
                id: 'statue_gaze',
                name: '雕像的注视',
                description: '神殿中央的巨大雕像似乎在用它那不存在的眼睛注视着你...',
                icon: '🗿',
                type: 'dangerous',
                choices: [
                    { id: 'gaze_back', text: '回视雕像', outcome: { type: 'gaze_back' } },
                    { id: 'bow', text: '恭敬地鞠躬', outcome: { type: 'bow_down' } },
                    { id: 'kneel', text: '双膝跪地', outcome: { type: 'kneel' } },
                    { id: 'flee', text: '转身逃跑', outcome: { type: 'flee', exploreInterrupt: true } }
                ]
            },
            deep_snore: {
                id: 'deep_snore',
                name: '深沉的鼾声',
                description: '从残骸深处传来类似打鼾的声音，整个地面都在震动...',
                icon: '💤',
                type: 'dangerous',
                choices: [
                    { id: 'quiet', text: '保持绝对安静', outcome: { type: 'stay_quiet' } },
                    { id: 'approach', text: '小心接近', outcome: { type: 'approach_sleeper' } },
                    { id: 'touch', text: '触碰残骸', outcome: { type: 'touch_remains' } }
                ]
            },
            bone_vibration: {
                id: 'bone_vibration',
                name: '骨骼震动',
                description: '巨兽的骸骨开始发出共鸣，你的骨头也在随之震动...',
                icon: '🦴',
                type: 'neutral',
                choices: [
                    { id: 'harmonize', text: '尝试与震动和谐', outcome: { type: 'harmonize_vibration' } },
                    { id: 'collect', text: '收集震动的能量', outcome: { type: 'collect_energy' } },
                    { id: 'flee', text: '这太诡异了，离开', outcome: { type: 'flee', exploreInterrupt: true } }
                ]
            },
            geometry_shift: {
                id: 'geometry_shift',
                name: '几何变换',
                description: '城市的建筑在你眼前变换形态，违反了你所知的一切几何规则...',
                icon: '📐',
                type: 'dangerous',
                choices: [
                    { id: 'study', text: '研究这种变换', outcome: { type: 'study_geometry' } },
                    { id: 'navigate', text: '尝试在变换中导航', outcome: { type: 'navigate_shift' } },
                    { id: 'close', text: '闭上眼睛等待', outcome: { type: 'wait_out' } }
                ]
            },
            non_euclidean_corridor: {
                id: 'non_euclidean_corridor',
                name: '非欧几里得走廊',
                description: '一条看似笔直的走廊，你感觉走了很久却还在原地...',
                icon: '🚪',
                type: 'neutral',
                choices: [
                    { id: 'count', text: '数步数前进', outcome: { type: 'count_steps' } },
                    { id: 'backtrack', text: '尝试原路返回', outcome: { type: 'backtrack' } },
                    { id: 'turn', text: '在第3步右转', outcome: { type: 'turn_3rd' } }
                ]
            }
        };

        return regionEvents[eventId] || null;
    }

    _completeExploration() {
        const exploration = this.state.currentExploration;
        const region = exploration.region;

        this.gameState.addPollution(region.basePollutionGain);

        const rewards = this._generateRewards(region);

        this.state.isExploring = false;
        this.state.currentExploration = null;
        this.state.explorationProgress = 0;

        this.eventBus.emit('exploration:completed', {
            regionId: region.id,
            regionName: region.name,
            rewards: rewards
        });
    }

    _generateRewards(region) {
        const rewards = {
            seeds: [],
            items: [],
            artifacts: [],
            money: 0
        };

        const bonusMultiplier = this._calculateRewardMultiplier(region);

        if (region.rewards.seeds && region.rewards.seeds.length > 0) {
            const seedCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < seedCount; i++) {
                const seedId = region.rewards.seeds[Math.floor(Math.random() * region.rewards.seeds.length)];
                const count = Math.floor(Math.random() * 2 * bonusMultiplier) + 1;
                this.gameState.addSeed(seedId, count);
                rewards.seeds.push({ id: seedId, count });
            }
        }

        if (region.rewards.items && region.rewards.items.length > 0) {
            const itemCount = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < itemCount; i++) {
                const itemId = region.rewards.items[Math.floor(Math.random() * region.rewards.items.length)];
                const count = Math.floor(Math.random() * 3 * bonusMultiplier) + 1;
                const result = this.gameState.addExplorationItem(itemId, count);
                if (result.success) {
                    rewards.items.push({ id: itemId, count });
                }
            }
        }

        const artifactChance = region.tier === 'shallow' ? 0.1 : 
                              region.tier === 'medium' ? 0.2 : 0.35;
        
        if (region.rewards.artifacts && region.rewards.artifacts.length > 0 && Math.random() < artifactChance) {
            const ExplorationConfig = window.ExplorationConfig || {};
            const artifactId = region.rewards.artifacts[Math.floor(Math.random() * region.rewards.artifacts.length)];
            const artifact = ExplorationConfig.getArtifact ? ExplorationConfig.getArtifact(artifactId) : null;
            
            if (artifact && !this.state.collectedArtifacts.some(a => a.id === artifactId)) {
                this.state.collectedArtifacts.push({
                    ...artifact,
                    collectedAt: this.timeModule.getDay()
                });
                rewards.artifacts.push({ ...artifact });
                
                this.eventBus.emit('exploration:artifactFound', {
                    artifact,
                    regionId: region.id
                });
            }
        }

        const baseMoney = region.tier === 'shallow' ? 20 : 
                          region.tier === 'medium' ? 50 : 100;
        const moneyReward = Math.floor(baseMoney * (0.5 + Math.random()) * bonusMultiplier);
        this.gameState.addMoney(moneyReward);
        rewards.money = moneyReward;

        return rewards;
    }

    _calculateRewardMultiplier(region) {
        let multiplier = 1;

        for (const talent of this.state.passiveTalents) {
            if (talent.type === 'all_crop_boost') {
                continue;
            }
            if (talent.type.includes('bonus') || talent.type.includes('boost')) {
                if (talent.type === 'cave_exploration_bonus' && region.id.includes('cave')) {
                    multiplier += talent.value / 100;
                }
                if (talent.type === 'night_exploration_bonus' && this.environmentModule.isNightTime()) {
                    multiplier += talent.value / 100;
                }
            }
        }

        return multiplier;
    }

    getCollectedArtifacts() {
        return [...this.state.collectedArtifacts];
    }

    getReadArtifacts() {
        return [...this.state.readArtifacts];
    }

    canReadArtifact(artifactId) {
        const ExplorationConfig = window.ExplorationConfig || {};
        const artifact = ExplorationConfig.getArtifact ? ExplorationConfig.getArtifact(artifactId) : null;

        if (!artifact) {
            return { canRead: false, reason: '文物不存在' };
        }

        const collected = this.state.collectedArtifacts.find(a => a.id === artifactId);
        if (!collected) {
            return { canRead: false, reason: '尚未收集该文物' };
        }

        if (this.state.readArtifacts.includes(artifactId)) {
            return { canRead: false, reason: '已经读过了' };
        }

        const currentSanity = this.gameState.getSanity();
        if (artifact.readSanityLoss > currentSanity) {
            return { canRead: false, reason: `理智不足，需要 ${artifact.readSanityLoss} 点理智` };
        }

        return { canRead: true };
    }

    readArtifact(artifactId) {
        const check = this.canReadArtifact(artifactId);
        if (!check.canRead) {
            this.eventBus.emit('exploration:error', { message: check.reason });
            return { success: false, reason: check.reason };
        }

        const ExplorationConfig = window.ExplorationConfig || {};
        const artifact = ExplorationConfig.getArtifact ? ExplorationConfig.getArtifact(artifactId) : null;

        this.sanityModule.modifySanity(-artifact.readSanityLoss, '阅读文物');
        this.state.readArtifacts.push(artifactId);

        const results = {
            message: artifact.readMessage,
            sanityLoss: artifact.readSanityLoss,
            unlocks: [],
            passiveTalent: null
        };

        if (artifact.effects && artifact.effects.unlocks) {
            results.unlocks = [...artifact.effects.unlocks];
        }

        if (artifact.effects && artifact.effects.passive) {
            const existingTalent = this.state.passiveTalents.find(t => t.type === artifact.effects.passive.type);
            if (!existingTalent) {
                this.state.passiveTalents.push({
                    ...artifact.effects.passive,
                    source: artifactId
                });
                results.passiveTalent = artifact.effects.passive;
            }
        }

        this.eventBus.emit('exploration:artifactRead', {
            artifact,
            results
        });

        return { success: true, results };
    }

    getPassiveTalents() {
        return [...this.state.passiveTalents];
    }

    getCurrentExploration() {
        if (!this.state.isExploring) return null;
        return {
            ...this.state.currentExploration,
            progress: this.state.explorationProgress
        };
    }

    handleEventChoice(eventId, choiceId) {
        const ExplorationConfig = window.ExplorationConfig || {};
        let event = ExplorationConfig.getMysteryEvent ? ExplorationConfig.getMysteryEvent(eventId) : null;
        
        if (!event) {
            event = this._getRegionSpecificEvent(eventId);
        }

        if (!event) {
            return { success: false, reason: '事件不存在' };
        }

        const choice = event.choices.find(c => c.id === choiceId);
        if (!choice) {
            return { success: false, reason: '选择不存在' };
        }

        const result = this._processOutcome(choice.outcome);

        this.eventBus.emit('exploration:eventResolved', {
            eventId,
            choiceId,
            result
        });

        return { success: true, result };
    }

    _processOutcome(outcome) {
        const result = {
            type: outcome.type,
            message: '',
            rewards: null,
            sanityChange: 0,
            interruptExploration: outcome.exploreInterrupt || false
        };

        switch (outcome.type) {
            case 'safe_exit':
            case 'safe_leave':
            case 'safe_avoid':
            case 'safe_ignore':
            case 'safe_distance':
            case 'safe_retreat':
                result.message = '你安全地离开了这个区域。';
                break;

            case 'safe_pass':
            case 'stay_silent':
            case 'close_eyes':
            case 'block_ears':
            case 'wait_out':
                result.message = '你小心翼翼地度过了这个时刻。';
                break;

            case 'bonus_rewards':
                if (outcome.sanityCost) {
                    this.sanityModule.modifySanity(-outcome.sanityCost, '探索事件');
                    result.sanityChange = -outcome.sanityCost;
                }
                result.rewards = this._generateQuickRewards(outcome.rewardMultiplier || 2);
                result.message = '你发现了额外的宝藏！';
                break;

            case 'knowledge_gain':
            case 'observation':
            case 'listen_whisper':
            case 'listen_chant':
            case 'study_geometry':
            case 'decipher_code':
                if (outcome.sanityCost) {
                    this.sanityModule.modifySanity(-outcome.sanityCost, '探索事件');
                    result.sanityChange = -outcome.sanityCost;
                }
                result.message = '你获得了一些有用的知识。';
                if (Math.random() < 0.3) {
                    result.rewards = this._generateQuickRewards(1);
                }
                break;

            case 'high_risk_high_reward':
                if (Math.random() < outcome.rewardChance) {
                    result.rewards = this._generateQuickRewards(outcome.rewardMultiplier || 3);
                    result.message = '你的勇气得到了丰厚的回报！';
                } else if (Math.random() < outcome.curseChance) {
                    result.message = '你被诅咒了！';
                    this.sanityModule.modifySanity(-15, '探索事件');
                    result.sanityChange = -15;
                } else {
                    result.message = '什么也没发生。';
                }
                break;

            case 'flee':
                result.message = '你匆忙逃离，中断了探索。';
                result.interruptExploration = true;
                if (this.state.isExploring) {
                    this.state.isExploring = false;
                    this.state.currentExploration = null;
                    this.state.explorationProgress = 0;
                }
                break;

            case 'resist':
                this.sanityModule.modifySanity(outcome.sanityGain || 5, '探索事件');
                result.sanityChange = outcome.sanityGain || 5;
                result.message = '你成功抵抗了诱惑，感到更加清醒。';
                break;

            case 'energy_collect':
                result.rewards = {
                    items: outcome.rewards ? outcome.rewards.map(id => ({ id, count: 1 })) : []
                };
                result.message = '你收集了一些奇异的能量。';
                break;

            case 'treasure':
            case 'careful_treasure':
                result.rewards = this._generateQuickRewards(outcome.rewardMultiplier || 1.5);
                result.message = '你发现了一个宝藏！';
                break;

            case 'trade':
            case 'combat':
                if (Math.random() < 0.5) {
                    result.rewards = this._generateQuickRewards(1.5);
                    result.message = '交易成功！';
                } else {
                    result.message = '交易失败了。';
                }
                break;

            case 'divine_interaction':
                const roll = Math.random();
                if (roll < outcome.blessingChance) {
                    this.sanityModule.modifySanity(10, '探索事件');
                    result.sanityChange = 10;
                    result.message = '你获得了祝福！';
                    result.rewards = this._generateQuickRewards(2);
                } else if (roll < outcome.blessingChance + outcome.curseChance) {
                    this.sanityModule.modifySanity(-20, '探索事件');
                    result.sanityChange = -20;
                    result.message = '你被诅咒了！';
                } else {
                    result.message = '什么也没发生。';
                }
                break;

            case 'hallucination':
            case 'glimpse_rift':
            case 'worship_hymn':
                this.sanityModule.modifySanity(-10, '探索事件');
                result.sanityChange = -10;
                if (Math.random() < 0.4) {
                    result.rewards = this._generateQuickRewards(1);
                    result.message = '幻觉中你看到了一些有用的东西...';
                } else {
                    result.message = '你的理智受到了冲击。';
                }
                break;

            case 'approach_lantern':
            case 'follow_path':
            case 'collect_sample':
            case 'collect_energy':
            case 'touch_stone':
            case 'wait_and_see':
                if (Math.random() < 0.6) {
                    result.rewards = this._generateQuickRewards(1.5);
                    result.message = '你的好奇心得到了回报！';
                } else {
                    this.sanityModule.modifySanity(-5, '探索事件');
                    result.sanityChange = -5;
                    result.message = '有些不对劲...';
                }
                break;

            case 'resonate_stone':
            case 'harmonize_vibration':
            case 'join_dance':
                if (Math.random() < 0.5) {
                    result.rewards = this._generateQuickRewards(2.5);
                    result.message = '你成功与神秘力量共鸣！';
                } else {
                    this.sanityModule.modifySanity(-15, '探索事件');
                    result.sanityChange = -15;
                    result.message = '你的意识无法承受这种共鸣...';
                }
                break;

            case 'investigate_light':
            case 'observe_shadow':
            case 'listen_stars':
            case 'gaze_back':
            case 'converse_echo':
                if (Math.random() < 0.4) {
                    result.rewards = this._generateQuickRewards(2);
                    result.message = '你发现了隐藏的秘密！';
                } else {
                    this.sanityModule.modifySanity(-8, '探索事件');
                    result.sanityChange = -8;
                    result.message = '你看到了不该看的东西...';
                }
                break;

            case 'investigate_blood':
            case 'track_blood':
            case 'approach_sleeper':
            case 'touch_remains':
            case 'disturb_water':
            case 'shout_loud':
                if (Math.random() < 0.3) {
                    result.rewards = this._generateQuickRewards(3);
                    result.message = '你的冒险精神得到了巨大回报！';
                } else {
                    this.sanityModule.modifySanity(-12, '探索事件');
                    result.sanityChange = -12;
                    result.message = '这太危险了！';
                }
                break;

            case 'respond_call':
            case 'wade_forward':
            case 'count_steps':
            case 'turn_3rd':
            case 'navigate_shift':
                if (Math.random() < 0.45) {
                    result.rewards = this._generateQuickRewards(2);
                    result.message = '你找到了正确的道路！';
                } else {
                    this.sanityModule.modifySanity(-10, '探索事件');
                    result.sanityChange = -10;
                    result.message = '你迷失了方向...';
                }
                break;

            case 'watch_dance':
            case 'watch_dance':
            case 'observe_lantern':
            case 'follow_sound':
            case 'continue_deeper':
            case 'backtrack':
                result.message = '你谨慎地观察着周围。';
                if (Math.random() < 0.2) {
                    result.rewards = this._generateQuickRewards(1);
                }
                break;

            case 'embrace_warp':
                if (Math.random() < 0.35) {
                    result.rewards = this._generateQuickRewards(4);
                    result.message = '你理解了现实的本质！';
                } else {
                    this.sanityModule.modifySanity(-25, '探索事件');
                    result.sanityChange = -25;
                    result.message = '你的心智几乎崩溃...';
                }
                break;

            case 'resist_warp':
                if (Math.random() < 0.6) {
                    this.sanityModule.modifySanity(5, '探索事件');
                    result.sanityChange = 5;
                    result.message = '你的意志力得到了锻炼！';
                } else {
                    this.sanityModule.modifySanity(-10, '探索事件');
                    result.sanityChange = -10;
                    result.message = '抵抗消耗了你的精力...';
                }
                break;

            case 'panic':
                this.sanityModule.modifySanity(-15, '探索事件');
                result.sanityChange = -15;
                result.message = '你的恐慌使情况变得更糟。';
                result.interruptExploration = true;
                if (this.state.isExploring) {
                    this.state.isExploring = false;
                    this.state.currentExploration = null;
                    this.state.explorationProgress = 0;
                }
                break;

            case 'bow_down':
            case 'kneel':
                if (Math.random() < 0.5) {
                    result.rewards = this._generateQuickRewards(2);
                    result.message = '你的恭敬得到了认可。';
                } else {
                    result.message = '什么也没发生。';
                }
                break;

            default:
                result.message = '事件已处理。';
        }

        return result;
    }

    _generateQuickRewards(multiplier = 1) {
        const rewards = {
            seeds: [],
            items: [],
            artifacts: [],
            money: 0
        };

        const ExplorationConfig = window.ExplorationConfig || {};
        const PlantConfig = window.PlantConfig || {};

        if (Math.random() < 0.5 * multiplier) {
            const seeds = ['wheat', 'carrot', 'potato', 'flesh_wheat', 'star_weed'];
            const seedId = seeds[Math.floor(Math.random() * seeds.length)];
            const count = Math.floor(Math.random() * 2 * multiplier) + 1;
            this.gameState.addSeed(seedId, count);
            rewards.seeds.push({ id: seedId, count });
        }

        const moneyReward = Math.floor(30 * (0.5 + Math.random()) * multiplier);
        this.gameState.addMoney(moneyReward);
        rewards.money = moneyReward;

        return rewards;
    }

    getFullState() {
        return {
            ...JSON.parse(JSON.stringify(this.state))
        };
    }

    loadState(savedData) {
        if (savedData) {
            this.state = {
                ...this.state,
                ...JSON.parse(JSON.stringify(savedData))
            };
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExplorationModule;
}
