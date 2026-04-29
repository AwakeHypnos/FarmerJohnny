const ExplorationConfig = {
    REGION_TIER_SHALLOW: 'shallow',
    REGION_TIER_MEDIUM: 'medium',
    REGION_TIER_DEEP: 'deep',

    FOG_UNLOCK_CONDITION: {
        TIME: 'time',
        POLLUTION: 'pollution',
        NIGHT: 'night',
        ITEM: 'item'
    },

    ITEM_TYPE_RUNE: 'rune',
    ITEM_TYPE_SCROLL: 'scroll',
    ITEM_TYPE_ARTIFACT: 'artifact',
    ITEM_TYPE_TOME: 'tome',

    _items: {
        old_key: {
            id: 'old_key',
            name: '古老钥匙',
            description: '一把锈迹斑斑的古老钥匙，可能能打开某个尘封的门',
            icon: '🗝️',
            rarity: 'common'
        },
        rusted_scythe: {
            id: 'rusted_scythe',
            name: '锈蚀镰刀',
            description: '废弃农场留下的农具，被时间侵蚀',
            icon: '🔧',
            rarity: 'common'
        },
        rotting_wood: {
            id: 'rotting_wood',
            name: '腐朽木材',
            description: '从腐烂森林中收集的奇异木材，散发着奇怪的气味',
            icon: '🪵',
            rarity: 'common'
        },
        mycelium: {
            id: 'mycelium',
            name: '菌丝体',
            description: '从腐烂森林采集的神秘菌丝，具有奇异的特性',
            icon: '🍄',
            rarity: 'uncommon'
        },
        swamp_moss: {
            id: 'swamp_moss',
            name: '沼泽苔藓',
            description: '从诡异沼泽中采集的湿滑苔藓',
            icon: '🌿',
            rarity: 'common'
        },
        fish_bone: {
            id: 'fish_bone',
            name: '鱼骨',
            description: '沼泽中发现的奇异鱼骨，不知属于什么生物',
            icon: '🦴',
            rarity: 'common'
        },
        stone_fragment: {
            id: 'stone_fragment',
            name: '石碑碎片',
            description: '从远古石碑群脱落的碎片，上面刻有模糊的符文',
            icon: '🗿',
            rarity: 'uncommon'
        },
        ancient_dust: {
            id: 'ancient_dust',
            name: '远古尘埃',
            description: '积累千年的神秘尘埃，蕴含着古老的力量',
            icon: '✨',
            rarity: 'uncommon'
        },
        ritual_dagger: {
            id: 'ritual_dagger',
            name: '仪式匕首',
            description: '邪教徒用于仪式的匕首，残留着诡异的气息',
            icon: '🗡️',
            rarity: 'rare'
        },
        candle_stub: {
            id: 'candle_stub',
            name: '蜡烛残根',
            description: '仪式现场残留的蜡烛，似乎还能闻到蜡油的气味',
            icon: '🕯️',
            rarity: 'common'
        },
        deep_sea_pearl: {
            id: 'deep_sea_pearl',
            name: '深海珍珠',
            description: '来自深海滩涂的奇异珍珠，散发着幽暗的光芒',
            icon: '🔮',
            rarity: 'rare'
        },
        fish_scales: {
            id: 'fish_scales',
            name: '鱼鳞',
            description: '从深海生物身上脱落的鳞片，闪烁着诡异的光泽',
            icon: '🐟',
            rarity: 'uncommon'
        },
        crystal_shard: {
            id: 'crystal_shard',
            name: '水晶碎片',
            description: '在地底洞穴中发现的发光水晶碎片',
            icon: '💎',
            rarity: 'rare'
        },
        cave_moss: {
            id: 'cave_moss',
            name: '洞穴苔藓',
            description: '生长在黑暗洞穴中的奇异苔藓，能够发出微弱的光',
            icon: '🌱',
            rarity: 'uncommon'
        },
        stardust: {
            id: 'stardust',
            name: '星尘',
            description: '从星界裂隙中逸出的神秘尘埃，闪烁着星辰的光芒',
            icon: '⭐',
            rarity: 'epic'
        },
        void_essence: {
            id: 'void_essence',
            name: '虚空精华',
            description: '来自虚空的神秘物质，蕴含着不可名状的力量',
            icon: '🌀',
            rarity: 'epic'
        },
        idol_fragment: {
            id: 'idol_fragment',
            name: '神像碎片',
            description: '旧日神殿中破碎神像的残片，散发着令人不安的气息',
            icon: '🗿',
            rarity: 'epic'
        },
        ancient_ink: {
            id: 'ancient_ink',
            name: '远古墨水',
            description: '用于撰写禁忌知识的神秘墨水，颜色深邃如夜',
            icon: '🖋️',
            rarity: 'rare'
        },
        beast_bone: {
            id: 'beast_bone',
            name: '巨兽骨骼',
            description: '沉睡巨兽残骸中发现的巨大骨骼，坚硬如铁',
            icon: '🦴',
            rarity: 'epic'
        },
        ichor_sample: {
            id: 'ichor_sample',
            name: '体液样本',
            description: '从远古巨兽身上采集的奇异体液，散发着腥甜的气味',
            icon: '🩸',
            rarity: 'epic'
        },
        alien_metal: {
            id: 'alien_metal',
            name: '异星金属',
            description: '来自无名古城的神秘金属，来自遥远的星空',
            icon: '⚙️',
            rarity: 'legendary'
        },
        unknown_mineral: {
            id: 'unknown_mineral',
            name: '未知矿物',
            description: '无名古城中发现的奇异矿物，性质未知',
            icon: '💎',
            rarity: 'legendary'
        }
    },

    _regions: {
        abandoned_farm: {
            id: 'abandoned_farm',
            name: '废弃农场',
            tier: 'shallow',
            description: '一座被遗弃多年的农场，周围长满了奇异的杂草。',
            icon: '🏚️',
            unlockConditions: [
                { type: 'time', value: 3, unit: 'days' }
            ],
            baseSanityCost: 5,
            basePollutionGain: 2,
            explorationTime: 15,
            rewards: {
                seeds: ['flesh_wheat', 'star_weed'],
                items: ['old_key', 'rusted_scythe'],
                artifacts: ['weathered_rune']
            },
            encounterChance: 0.1,
            regionEvents: ['flickering_light', 'whispering_wind']
        },
        rotten_forest: {
            id: 'rotten_forest',
            name: '腐烂森林',
            tier: 'shallow',
            description: '树木都已枯萎腐烂，但空气中却弥漫着奇异的生机。',
            icon: '🌲',
            unlockConditions: [
                { type: 'pollution', value: 20 }
            ],
            baseSanityCost: 8,
            basePollutionGain: 3,
            explorationTime: 20,
            rewards: {
                seeds: ['hallucination_mushroom', 'deep_spore_flower'],
                items: ['rotting_wood', 'mycelium'],
                artifacts: ['forest_mark']
            },
            encounterChance: 0.15,
            regionEvents: ['moving_shadow', 'fungal_cloud']
        },
        eerie_swamp: {
            id: 'eerie_swamp',
            name: '诡异沼泽',
            tier: 'shallow',
            description: '迷雾笼罩的沼泽，水面下似乎有什么东西在游动。',
            icon: '🌿',
            unlockConditions: [
                { type: 'time', value: 7, unit: 'days' },
                { type: 'pollution', value: 15 }
            ],
            baseSanityCost: 10,
            basePollutionGain: 4,
            explorationTime: 25,
            rewards: {
                seeds: ['tidal_aquatic_grass', 'tentacle_vine'],
                items: ['swamp_moss', 'fish_bone'],
                artifacts: ['tidal_rune']
            },
            encounterChance: 0.12,
            regionEvents: ['water_ripple', 'floating_lantern']
        },
        ancient_stone_circle: {
            id: 'ancient_stone_circle',
            name: '远古石碑群',
            tier: 'medium',
            description: '刻满奇异符文的石碑矗立成圈，月光下隐约闪烁着光芒。',
            icon: '🗿',
            unlockConditions: [
                { type: 'pollution', value: 50 },
                { type: 'time', value: 14, unit: 'days' }
            ],
            baseSanityCost: 15,
            basePollutionGain: 5,
            explorationTime: 30,
            rewards: {
                seeds: ['astral_flower', 'abyss_mushroom'],
                items: ['stone_fragment', 'ancient_dust'],
                artifacts: ['star_rune', 'blood_ritual_scroll']
            },
            encounterChance: 0.2,
            regionEvents: ['stone_hum', 'shadow_dance']
        },
        abandoned_cult_camp: {
            id: 'abandoned_cult_camp',
            name: '废弃邪教营地',
            tier: 'medium',
            description: '曾经是邪教徒聚集的地方，残留着诡异的仪式痕迹。',
            icon: '⛺',
            unlockConditions: [
                { type: 'pollution', value: 40 },
                { type: 'night', value: true }
            ],
            baseSanityCost: 18,
            basePollutionGain: 6,
            explorationTime: 35,
            rewards: {
                seeds: ['pulsating_root', 'flesh_tuber'],
                items: ['ritual_dagger', 'candle_stub'],
                artifacts: ['cult_diary', 'forbidden_symbol']
            },
            encounterChance: 0.25,
            regionEvents: ['lingering_chant', 'blood_stain']
        },
        deep_sea_tide: {
            id: 'deep_sea_tide',
            name: '深海滩涂',
            tier: 'medium',
            description: '潮水退去后露出的神秘海岸，散落着来自深海的奇异生物。',
            icon: '🌊',
            unlockConditions: [
                { type: 'pollution', value: 60 },
                { type: 'time', value: 20, unit: 'days' }
            ],
            baseSanityCost: 20,
            basePollutionGain: 7,
            explorationTime: 40,
            rewards: {
                seeds: ['sea_scale_coral', 'abyss_mushroom'],
                items: ['deep_sea_pearl', 'fish_scales'],
                artifacts: ['tidal_tome', 'deep_one_effigy']
            },
            encounterChance: 0.18,
            regionEvents: ['distant_call', 'bioluminescent_path']
        },
        subterranean_cave: {
            id: 'subterranean_cave',
            name: '地底洞穴',
            tier: 'medium',
            description: '深入地下的黑暗洞穴，墙壁上生长着发光的奇异植物。',
            icon: '🕳️',
            unlockConditions: [
                { type: 'pollution', value: 45 },
                { type: 'item', value: 'ancient_key' }
            ],
            baseSanityCost: 22,
            basePollutionGain: 8,
            explorationTime: 45,
            rewards: {
                seeds: ['whisper_grass', 'deep_spore_flower'],
                items: ['crystal_shard', 'cave_moss'],
                artifacts: ['echo_rune', 'underground_map']
            },
            encounterChance: 0.22,
            regionEvents: ['drip_sound', 'echo_voice']
        },
        astral_rift: {
            id: 'astral_rift',
            name: '星界裂隙',
            tier: 'deep',
            description: '连接星界与现实的裂缝，从中可以窥见无尽深空的景象。',
            icon: '✨',
            unlockConditions: [
                { type: 'pollution', value: 100 },
                { type: 'time', value: 30, unit: 'days' },
                { type: 'night', value: true }
            ],
            baseSanityCost: 35,
            basePollutionGain: 12,
            explorationTime: 60,
            rewards: {
                seeds: ['shoggoth_moss', 'astral_flower'],
                items: ['stardust', 'void_essence'],
                artifacts: ['astral_codex', 'star_eye_amulet']
            },
            encounterChance: 0.35,
            regionEvents: ['star_voice', 'reality_warp']
        },
        old_god_temple: {
            id: 'old_god_temple',
            name: '旧日神殿',
            tier: 'deep',
            description: '供奉着不可名状存在的古老神殿，空气中弥漫着远古的气息。',
            icon: '🏛️',
            unlockConditions: [
                { type: 'pollution', value: 120 },
                { type: 'time', value: 40, unit: 'days' },
                { type: 'item', value: 'temple_key' }
            ],
            baseSanityCost: 45,
            basePollutionGain: 15,
            explorationTime: 80,
            rewards: {
                seeds: ['black_wool_fruit', 'shoggoth_moss'],
                items: ['idol_fragment', 'ancient_ink'],
                artifacts: ['necronomicon_excerpt', 'elder_sign']
            },
            encounterChance: 0.4,
            regionEvents: ['unearthly_hymn', 'statue_gaze']
        },
        sleeping_beast_remains: {
            id: 'sleeping_beast_remains',
            name: '沉睡巨兽残骸',
            tier: 'deep',
            description: '远古巨兽的遗骸，它似乎还在沉睡中，偶尔会发出低沉的脉动。',
            icon: '🦴',
            unlockConditions: [
                { type: 'pollution', value: 150 },
                { type: 'time', value: 50, unit: 'days' }
            ],
            baseSanityCost: 50,
            basePollutionGain: 18,
            explorationTime: 90,
            rewards: {
                seeds: ['flesh_tuber', 'black_wool_fruit'],
                items: ['beast_bone', 'ichor_sample'],
                artifacts: ['beast_heart', 'dream_catcher']
            },
            encounterChance: 0.45,
            regionEvents: ['deep_snore', 'bone_vibration']
        },
        nameless_ancient_city: {
            id: 'nameless_ancient_city',
            name: '无名古城',
            tier: 'deep',
            description: '被遗忘的远古城市，建筑风格与任何已知文明都不相符。',
            icon: '🏙️',
            unlockConditions: [
                { type: 'pollution', value: 180 },
                { type: 'time', value: 60, unit: 'days' },
                { type: 'night', value: true }
            ],
            baseSanityCost: 60,
            basePollutionGain: 20,
            explorationTime: 120,
            rewards: {
                seeds: ['whisper_grass', 'sea_scale_coral'],
                items: ['alien_metal', 'unknown_mineral'],
                artifacts: ['city_archives', 'gate_key']
            },
            encounterChance: 0.5,
            regionEvents: ['geometry_shift', 'non_euclidean_corridor']
        }
    },

    _artifacts: {
        weathered_rune: {
            id: 'weathered_rune',
            name: '风化符文',
            type: 'rune',
            icon: '🔮',
            description: '一块刻有古老符文的石头，文字已经模糊不清。',
            rarity: 'common',
            effects: {
                unlocks: ['ancient_fertilizer_recipe']
            },
            readSanityLoss: 3,
            readMessage: '你勉强辨认出一些关于作物生长的古老知识...'
        },
        forest_mark: {
            id: 'forest_mark',
            name: '森林印记',
            type: 'rune',
            icon: '🌿',
            description: '森林深处发现的奇异印记，散发着微弱的光芒。',
            rarity: 'uncommon',
            effects: {
                passive: {
                    type: 'corruption_resistance',
                    value: 10,
                    name: '污染抵抗'
                }
            },
            readSanityLoss: 5,
            readMessage: '森林的低语在你耳边响起，你感到对污染的侵蚀有了一些抵抗力。'
        },
        tidal_rune: {
            id: 'tidal_rune',
            name: '潮汐符文',
            type: 'rune',
            icon: '🌊',
            description: '刻有潮汐图案的符文，似乎与深海有关。',
            rarity: 'uncommon',
            effects: {
                unlocks: ['water_field_blueprint']
            },
            readSanityLoss: 6,
            readMessage: '你理解了如何将土地改造成适合水生作物生长的池塘...'
        },
        star_rune: {
            id: 'star_rune',
            name: '星象符文',
            type: 'rune',
            icon: '⭐',
            description: '刻有星象图案的符文，在夜晚会发出微弱的光芒。',
            rarity: 'rare',
            effects: {
                passive: {
                    type: 'night_growth_boost',
                    value: 15,
                    name: '夜晚生长加速'
                }
            },
            readSanityLoss: 10,
            readMessage: '群星的位置向你揭示了秘密，夜晚作物生长速度提升15%。'
        },
        blood_ritual_scroll: {
            id: 'blood_ritual_scroll',
            name: '血祭卷轴',
            type: 'scroll',
            icon: '📜',
            description: '记载着古老献祭仪式的卷轴，墨水呈现暗红色。',
            rarity: 'rare',
            effects: {
                unlocks: ['blood_fertilizer_recipe', 'corruption_ritual']
            },
            readSanityLoss: 15,
            readMessage: '你学会了用血肉进行祭祀的仪式，这将加速土地的腐化...'
        },
        cult_diary: {
            id: 'cult_diary',
            name: '邪教日记',
            type: 'tome',
            icon: '📔',
            description: '一位已故邪教徒的日记，记载着他的所见所闻。',
            rarity: 'rare',
            effects: {
                unlocks: ['abandoned_cult_camp_lore'],
                passive: {
                    type: 'aberrant_survival',
                    value: 10,
                    name: '异化作物存活率提升'
                }
            },
            readSanityLoss: 12,
            readMessage: '日记中详细描述了邪教徒如何照料那些奇异的作物...'
        },
        forbidden_symbol: {
            id: 'forbidden_symbol',
            name: '禁忌符号',
            type: 'artifact',
            icon: '🔺',
            description: '一个无法描述其形状的符号，直视它会感到头痛。',
            rarity: 'epic',
            effects: {
                unlocks: ['old_god_temple_key_fragment'],
                passive: {
                    type: 'sanity_loss_reduction',
                    value: 15,
                    name: '理智损失减免'
                }
            },
            readSanityLoss: 20,
            readMessage: '符号的含义在你脑海中炸开，你学会了如何更好地保护自己的理智...'
        },
        tidal_tome: {
            id: 'tidal_tome',
            name: '潮汐圣典',
            type: 'tome',
            icon: '📕',
            description: '深潜者的圣典，记载着关于海洋深处的秘密。',
            rarity: 'epic',
            effects: {
                unlocks: ['deep_sea_crops_mastery'],
                passive: {
                    type: 'deep_crop_boost',
                    value: 20,
                    name: '深海作物产量提升'
                }
            },
            readSanityLoss: 25,
            readMessage: '你理解了深海的低语，深海作物的产量将提升20%。'
        },
        deep_one_effigy: {
            id: 'deep_one_effigy',
            name: '深潜者雕像',
            type: 'artifact',
            icon: '🗿',
            description: '一尊描绘着鱼人形态的古老雕像，它的眼睛似乎在注视着你。',
            rarity: 'epic',
            effects: {
                unlocks: ['fishman_ritual'],
                passive: {
                    type: 'rain_growth_boost',
                    value: 25,
                    name: '雨天生长加速'
                }
            },
            readSanityLoss: 22,
            readMessage: '雕像向你展示了雨水的秘密，雨天作物生长速度提升25%。'
        },
        echo_rune: {
            id: 'echo_rune',
            name: '回音符文',
            type: 'rune',
            icon: '🌀',
            description: '能记录并播放声音的奇异符文。',
            rarity: 'rare',
            effects: {
                unlocks: ['subterranean_lore'],
                passive: {
                    type: 'cave_exploration_bonus',
                    value: 20,
                    name: '地底探索奖励提升'
                }
            },
            readSanityLoss: 18,
            readMessage: '符文播放着古老的声音，你学会了如何在地底更好地探索。'
        },
        underground_map: {
            id: 'underground_map',
            name: '地底地图',
            type: 'scroll',
            icon: '🗺️',
            description: '一张描绘地底洞穴网络的古老地图。',
            rarity: 'rare',
            effects: {
                unlocks: ['deep_cave_access']
            },
            readSanityLoss: 15,
            readMessage: '地图揭示了更深层地底的入口位置...'
        },
        astral_codex: {
            id: 'astral_codex',
            name: '星界法典',
            type: 'tome',
            icon: '📗',
            description: '记载着星界秘密的神圣典籍，书页在星光下闪耀。',
            rarity: 'legendary',
            effects: {
                unlocks: ['astral_projection', 'stellar_crops_mastery'],
                passive: {
                    type: 'stellar_crop_boost',
                    value: 30,
                    name: '星界作物产量提升'
                }
            },
            readSanityLoss: 40,
            readMessage: '群星的智慧涌入你的脑海，星界作物产量提升30%。'
        },
        star_eye_amulet: {
            id: 'star_eye_amulet',
            name: '星眼护符',
            type: 'artifact',
            icon: '👁️',
            description: '一颗来自星界的宝石，能够保护佩戴者免受精神侵蚀。',
            rarity: 'legendary',
            effects: {
                passive: {
                    type: 'sanity_shield',
                    value: 25,
                    name: '理智护盾'
                }
            },
            readSanityLoss: 35,
            readMessage: '护符与你建立了链接，每次理智损失将减少25%。'
        },
        necronomicon_excerpt: {
            id: 'necronomicon_excerpt',
            name: '死灵书抄本',
            type: 'tome',
            icon: '📘',
            description: '《死灵之书》的部分抄本，记载着最危险的知识。',
            rarity: 'legendary',
            effects: {
                unlocks: ['old_one_crops_mastery', 'summoning_ritual'],
                passive: {
                    type: 'old_one_crop_boost',
                    value: 40,
                    name: '旧日作物产量提升'
                }
            },
            readSanityLoss: 50,
            readMessage: '你不敢相信自己读到了什么...但旧日作物的产量将提升40%。'
        },
        elder_sign: {
            id: 'elder_sign',
            name: '旧印',
            type: 'artifact',
            icon: '🔯',
            description: '古老的保护符文，据说可以抵御某些存在的注视。',
            rarity: 'legendary',
            effects: {
                unlocks: ['protection_ritual'],
                passive: {
                    type: 'curse_resistance',
                    value: 50,
                    name: '诅咒抵抗'
                }
            },
            readSanityLoss: 45,
            readMessage: '旧印的力量保护着你，收获诅咒的概率降低50%。'
        },
        beast_heart: {
            id: 'beast_heart',
            name: '巨兽之心',
            type: 'artifact',
            icon: '💀',
            description: '远古巨兽的心脏化石，仍然散发着微弱的脉动。',
            rarity: 'legendary',
            effects: {
                unlocks: ['beast_bond_ritual'],
                passive: {
                    type: 'flesh_crop_boost',
                    value: 35,
                    name: '血肉作物产量提升'
                }
            },
            readSanityLoss: 48,
            readMessage: '巨兽的力量流入你的身体，血肉作物产量提升35%。'
        },
        dream_catcher: {
            id: 'dream_catcher',
            name: '梦境捕手',
            type: 'artifact',
            icon: '🌙',
            description: '能够捕捉梦境的奇异物品，来自沉睡巨兽的力量。',
            rarity: 'legendary',
            effects: {
                unlocks: ['dream_walking'],
                passive: {
                    type: 'night_exploration_bonus',
                    value: 50,
                    name: '夜晚探索奖励提升'
                }
            },
            readSanityLoss: 42,
            readMessage: '你学会了在梦中行走，夜晚探索奖励提升50%。'
        },
        city_archives: {
            id: 'city_archives',
            name: '城市档案',
            type: 'tome',
            icon: '📚',
            description: '无名古城的档案，记载着那个失落文明的一切。',
            rarity: 'legendary',
            effects: {
                unlocks: ['ancient_technology', 'gate_crafting'],
                passive: {
                    type: 'all_crop_boost',
                    value: 15,
                    name: '所有作物产量提升'
                }
            },
            readSanityLoss: 55,
            readMessage: '失落文明的知识彻底改变了你对农业的理解，所有作物产量提升15%。'
        },
        gate_key: {
            id: 'gate_key',
            name: '门之钥',
            type: 'artifact',
            icon: '🗝️',
            description: '传说中能打开所有门的钥匙，包括那些不应该存在的门。',
            rarity: 'legendary',
            effects: {
                unlocks: ['final_gate'],
                passive: {
                    type: 'unlimited_potential',
                    value: 0,
                    name: '无限潜能'
                }
            },
            readSanityLoss: 60,
            readMessage: '你理解了门之钥的真正含义...一切的可能性都向你敞开。'
        }
    },

    _mysteryEvents: {
        time_displacement: {
            id: 'time_displacement',
            name: '时空错位',
            description: '你误入了一个时间流速不同的区域...',
            icon: '⏰',
            type: 'positive',
            duration: 60,
            effects: {
                type: 'time_skip',
                value: 120
            },
            choices: [
                {
                    id: 'stay',
                    text: '留在这个区域探索',
                    outcome: {
                        type: 'bonus_rewards',
                        rewardMultiplier: 2,
                        sanityCost: 10
                    }
                },
                {
                    id: 'leave',
                    text: '尽快离开这个不稳定的区域',
                    outcome: {
                        type: 'safe_exit'
                    }
                }
            ]
        },
        wandering_cultist: {
            id: 'wandering_cultist',
            name: '流浪邪教徒',
            description: '你遇到了一个独自徘徊的邪教徒...',
            icon: '🧙',
            type: 'neutral',
            choices: [
                {
                    id: 'trade',
                    text: '尝试与他交易',
                    outcome: {
                        type: 'trade',
                        possibleItems: ['rare_artifact', 'secret_knowledge', 'danger']
                    }
                },
                {
                    id: 'attack',
                    text: '趁他不注意发起攻击',
                    outcome: {
                        type: 'combat',
                        rewardChance: 0.6,
                        riskChance: 0.4
                    }
                },
                {
                    id: 'avoid',
                    text: '悄悄绕过他',
                    outcome: {
                        type: 'safe_avoid'
                    }
                }
            ]
        },
        strange_roaming_creature: {
            id: 'strange_roaming_creature',
            name: '奇异漫游生物',
            description: '你看到了一个无法描述其形态的生物正在游荡...',
            icon: '👾',
            type: 'dangerous',
            choices: [
                {
                    id: 'observe',
                    text: '保持距离观察',
                    outcome: {
                        type: 'observation',
                        knowledgeGain: true,
                        sanityCost: 5
                    }
                },
                {
                    id: 'approach',
                    text: '大胆接近它',
                    outcome: {
                        type: 'high_risk_high_reward',
                        rewardChance: 0.3,
                        curseChance: 0.5,
                        rewardMultiplier: 3
                    }
                },
                {
                    id: 'flee',
                    text: '立即逃离',
                    outcome: {
                        type: 'flee',
                        exploreInterrupt: true
                    }
                }
            ]
        },
        temporary_rift: {
            id: 'temporary_rift',
            name: '临时时空裂缝',
            description: '一个闪烁的裂缝出现在你面前，它不会持续太久...',
            icon: '🌀',
            type: 'positive',
            duration: 30,
            choices: [
                {
                    id: 'enter',
                    text: '冒险进入裂缝',
                    outcome: {
                        type: 'rift_travel',
                        possibleDestinations: ['treasure_room', 'alien_world', 'nightmare_realm'],
                        sanityCost: 20
                    }
                },
                {
                    id: 'collect',
                    text: '收集裂缝周围的能量',
                    outcome: {
                        type: 'energy_collect',
                        rewards: ['void_essence', 'stardust']
                    }
                },
                {
                    id: 'ignore',
                    text: '无视这个危险的现象',
                    outcome: {
                        type: 'safe_ignore'
                    }
                }
            ]
        },
        ancient_cache: {
            id: 'ancient_cache',
            name: '远古宝藏',
            description: '你发现了一个被遗忘的古老储藏室...',
            icon: '💎',
            type: 'positive',
            choices: [
                {
                    id: 'open',
                    text: '直接打开储藏室',
                    outcome: {
                        type: 'treasure',
                        rewardMultiplier: 1
                    }
                },
                {
                    id: 'examine',
                    text: '仔细检查是否有陷阱',
                    outcome: {
                        type: 'careful_treasure',
                        trapAvoidChance: 0.8,
                        rewardMultiplier: 1.5,
                        timeCost: 10
                    }
                }
            ]
        },
        whispering_voice: {
            id: 'whispering_voice',
            name: '低语声',
            description: '一个声音在你耳边低语，承诺给予你知识...',
            icon: '👂',
            type: 'neutral',
            choices: [
                {
                    id: 'listen',
                    text: '倾听低语',
                    outcome: {
                        type: 'knowledge_gain',
                        sanityCost: 15,
                        possibleRewards: ['secret_skill', 'location_hint', 'curse']
                    }
                },
                {
                    id: 'resist',
                    text: '抵抗诱惑',
                    outcome: {
                        type: 'resist',
                        sanityGain: 5
                    }
                }
            ]
        },
        forgotten_altar: {
            id: 'forgotten_altar',
            name: '被遗忘的祭坛',
            description: '一座古老的祭坛，上面刻着你不认识的符文...',
            icon: '⛩️',
            type: 'neutral',
            choices: [
                {
                    id: 'pray',
                    text: '在祭坛前祈祷',
                    outcome: {
                        type: 'divine_interaction',
                        possibleResults: ['blessing', 'curse', 'nothing'],
                        blessingChance: 0.3,
                        curseChance: 0.4
                    }
                },
                {
                    id: 'sacrifice',
                    text: '献上背包中的物品',
                    outcome: {
                        type: 'sacrifice',
                        rewardMultiplier: 2,
                        requiresItem: true
                    }
                },
                {
                    id: 'leave',
                    text: '离开这个不祥之地',
                    outcome: {
                        type: 'safe_leave'
                    }
                }
            ]
        }
    },

    getRegion(regionId) {
        return this._regions[regionId];
    },

    getAllRegions() {
        return Object.values(this._regions);
    },

    getRegionsByTier(tier) {
        return this.getAllRegions().filter(r => r.tier === tier);
    },

    getArtifact(artifactId) {
        return this._artifacts[artifactId];
    },

    getAllArtifacts() {
        return Object.values(this._artifacts);
    },

    getArtifactsByType(type) {
        return this.getAllArtifacts().filter(a => a.type === type);
    },

    getMysteryEvent(eventId) {
        return this._mysteryEvents[eventId];
    },

    getAllMysteryEvents() {
        return Object.values(this._mysteryEvents);
    },

    getRandomMysteryEvent() {
        const events = this.getAllMysteryEvents();
        return events[Math.floor(Math.random() * events.length)];
    },

    isRegionUnlocked(region, currentDay, currentPollution, isNight, collectedItems = []) {
        const regionData = typeof region === 'string' ? this.getRegion(region) : region;
        if (!regionData) return false;

        for (const condition of regionData.unlockConditions) {
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
    },

    getItem(itemId) {
        return this._items[itemId];
    },

    getAllItems() {
        return Object.values(this._items);
    }
};

window.ExplorationConfig = ExplorationConfig;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExplorationConfig;
}
