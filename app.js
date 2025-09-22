// Productivity Garden - Main App Logic
'use strict';

// Constants
const STORAGE_KEYS = {
    SEEDS: 'pgarden:v1:seeds',
    PLANTS: 'pgarden:v1:plants',
    DEX: 'pgarden:v1:dex',
    SETTINGS: 'pgarden:v1:settings'
};

const GAME_CONFIG = {
    MAX_SEEDS: 5,
    MAX_PLANTS: Infinity, // Unlimited plants
    MIN_COMPLETE_TIME: 1 * 60 * 1000, // 20 minutes in ms
    GROWTH_STAGES: [
        { time: 0, label: 'Seed' },
        { time: 20 * 60 * 1000, label: 'Sprout' },
        { time: 60 * 60 * 1000, label: 'Seedling' },
        { time: 2 * 60 * 60 * 1000, label: 'Young Plant' },
        { time: 4 * 60 * 60 * 1000, label: 'Mature Plant' },
        { time: 24 * 60 * 60 * 1000, label: 'Full Bloom' }
    ]
};

const TIERS = {
    BASIC: 'basic',
    RARE: 'rare',
    EXTINCT: 'extinct'
};

const TIER_COLORS = {
    [TIERS.BASIC]: '#7cb342',
    [TIERS.RARE]: '#5e35b1',
    [TIERS.EXTINCT]: '#ff6f00'
};

// Plant Database
const PLANT_DATABASE = {
    basic: [
        { id: 1, name: 'Moonbell Fern', icon: 'moonbell_fern.png', description: 'A gentle fern that chimes softly in moonlight, said to bring peaceful dreams to those who tend it.' },
        { id: 2, name: 'Dewdrop Moss', icon: 'dewdrop_moss.png', description: 'This humble moss collects morning dew that sparkles like tiny diamonds, beloved by hedge wizards for simple enchantments.' },
        { id: 3, name: 'Whisperwort', icon: 'whisper_wort.png', description: 'Its leaves rustle with the faintest breeze, carrying messages between gardeners who know how to listen.' },
        { id: 4, name: 'Glimmergrass', icon: 'glimmergrass.png', description: 'Common in magical meadows, each blade reflects light differently, creating a shimmering carpet effect.' },
        { id: 5, name: 'Starlight Sprout', icon: 'starlight_sprout.png', description: 'A hardy little plant that glows faintly at night, often used to mark garden paths in wizarding communities.' }
    ],
    rare: [
        { id: 1, name: 'Crystalbark Sapling', icon: 'crystalbark_sapling.png', description: 'Its bark slowly crystallizes over time, producing fragments sought after by alchemists for focus potions.' },
        { id: 2, name: 'Dreamweaver Vine', icon: 'dreamweaver_vine.png', description: 'These purple vines grow in spirals and are said to enhance lucid dreaming when dried and kept under pillows.' },
        { id: 3, name: 'Phoenix Bloom', icon: 'phoenix_bloom.png', description: 'A flower that wilts and regrows daily, its petals carry warmth even in winter and are prized by herbalists.' },
        { id: 4, name: 'Shadowleaf Orchid', icon: 'shadowleaf_orchid.png', description: 'Thrives in darkness rather than light, its midnight-blue flowers are essential in nocturnal spell work.' },
        { id: 5, name: 'Timekeeper Rose', icon: 'timekeeper_rose.png', description: 'Each petal marks an hour of the day, opening and closing in perfect rhythm with the sun\'s journey.' }
    ],
    extinct: [
        { id: 1, name: 'Dragon\'s Breath Lily', icon: 'dradonbreath_lily.png', description: 'Once thought lost to the ages, this fiery bloom exhales warm mist and was treasured by ancient fire mages.' },
        { id: 2, name: 'Void Lotus', icon: 'void_lotus.png', description: 'A legendary flower that absorbs all light around it, creating patches of absolute darkness in daylight gardens.' },
        { id: 3, name: 'Eternal Frost Pine', icon: 'eternalfrost_pine.png', description: 'From the frozen north, this tree never thaws and its needles can preserve anything they touch indefinitely.' },
        { id: 4, name: 'Starfall Mushroom', icon: 'starfall_mushroom.png', description: 'Said to grow only where meteors have fallen, these luminous fungi pulse with celestial energy.' },
        { id: 5, name: 'Worldtree Seedling', icon: 'worldtree_seedling.png', description: 'The rarest of all plants, descended from the mythical tree that connects all realms of existence.' }
    ]
};

// Growth stage emojis
const GROWTH_STAGE_EMOJIS = [
    '🌰', // Stage 0: Seed (0-20 minutes)
    '🌱', // Stage 1: Sprout (20min-1hr)
    '🌿', // Stage 2: Seedling (1-2hrs)
    '🌾', // Stage 3: Young Plant (2-4hrs)
    '🌲', // Stage 4: Mature Plant (4-24hrs)
    '🌺'  // Stage 5: Full Bloom (24+hrs)
];

// Game State
class GameState {
    constructor() {
        this.seeds = [];
        this.plants = [];
        this.dex = {};
        this.settings = {
            sfx: true,
            animations: true
        };
        this.selectedPlant = null;
        this.hoveredPlant = null;
        this.pendingPlant = null;
    }

    load() {
        try {
            // Check if this is a new player (no saved data)
            const savedSeeds = localStorage.getItem(STORAGE_KEYS.SEEDS);
            const isNewPlayer = !savedSeeds && !localStorage.getItem(STORAGE_KEYS.PLANTS) && !localStorage.getItem(STORAGE_KEYS.DEX);

            // Only give default seeds to new players
            this.seeds = savedSeeds ? JSON.parse(savedSeeds) : (isNewPlayer ? this.getDefaultSeeds() : []);
            this.plants = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANTS)) || [];
            this.dex = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEX)) || {};
            this.settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || this.settings;
        } catch (e) {
            console.error('Failed to load game state:', e);
            this.reset();
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEYS.SEEDS, JSON.stringify(this.seeds));
            localStorage.setItem(STORAGE_KEYS.PLANTS, JSON.stringify(this.plants));
            localStorage.setItem(STORAGE_KEYS.DEX, JSON.stringify(this.dex));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save game state:', e);
        }
    }

    getDefaultSeeds() {
        return Array(5).fill(null).map((_, i) => ({
            id: `seed_${Date.now()}_${i}`,
            tier: TIERS.BASIC
        }));
    }

    reset() {
        this.seeds = this.getDefaultSeeds();
        this.plants = [];
        this.dex = {};
        this.save();
    }

    consumeSeed() {
        if (this.seeds.length === 0) return null;
        const seed = this.seeds.shift();

        // No auto-refill - seeds only come from harvesting

        this.save();
        return seed;
    }

    addSeed(tier, highlight = false) {
        if (this.seeds.length >= GAME_CONFIG.MAX_SEEDS) {
            showToast('Seed bank is full! Reward discarded.', 'warning');
            return false;
        }

        const newSeed = {
            id: `seed_${Date.now()}_${Math.random()}`,
            tier: tier,
            isNew: highlight
        };
        this.seeds.push(newSeed);
        this.save();

        // Remove the highlight after a delay
        if (highlight) {
            setTimeout(() => {
                const seed = this.seeds.find(s => s.id === newSeed.id);
                if (seed) {
                    seed.isNew = false;
                    this.save();
                    updateSeedBank();
                }
            }, 3000);
        }

        return true;
    }

    plantSeed(x, y, title, seed) {
        // No plant limit check - unlimited plants allowed

        const plant = {
            id: `plant_${Date.now()}_${Math.random()}`,
            title: title,
            tier: seed.tier,
            x: x,
            y: y,
            plantedAt: Date.now()
        };

        this.plants.push(plant);
        this.save();
        return true;
    }

    completePlant(plantId) {
        const plantIndex = this.plants.findIndex(p => p.id === plantId);
        if (plantIndex === -1) return null;

        const plant = this.plants[plantIndex];
        const elapsed = Date.now() - plant.plantedAt;

        if (elapsed < GAME_CONFIG.MIN_COMPLETE_TIME) {
            showToast('Plant needs more time to grow!', 'warning');
            return null;
        }

        // Check if already harvested
        if (plant.harvested) {
            showToast('This plant has already been harvested!', 'info');
            return null;
        }

        // Mark plant as harvested instead of removing it
        plant.harvested = true;
        plant.harvestedAt = Date.now();

        // Roll plant type within tier
        const typeIndex = Math.floor(Math.random() * 5) + 1;
        const plantKey = `${plant.tier}:${typeIndex}`;

        // Store the specific plant type for rendering
        plant.harvestedType = typeIndex;
        plant.harvestedPlant = PLANT_DATABASE[plant.tier][typeIndex - 1];

        // Update dex
        this.dex[plantKey] = (this.dex[plantKey] || 0) + 1;

        // Roll seed reward
        const rewardTier = this.rollSeedReward(plant.tier);
        if (rewardTier) {
            this.addSeed(rewardTier, true); // Pass true to highlight new seed
        }

        // Give bonus basic seed if seed bank is completely empty to prevent soft-lock
        if (this.seeds.length === 0) {
            this.addSeed(TIERS.BASIC, false);
            showToast('Received bonus seed to keep growing!', 'info');
        }

        this.save();

        const plantInfo = PLANT_DATABASE[plant.tier][typeIndex - 1];
        showToast(`Harvested ${plantInfo.name}!`, 'success');
        
        return { plantKey, plantInfo };
    }

    rollSeedReward(completedTier) {
        const roll = Math.random();
        let rewardTier;

        switch (completedTier) {
            case TIERS.BASIC:
                rewardTier = roll < 0.5 ? TIERS.BASIC : TIERS.RARE;
                break;
            case TIERS.RARE:
                if (roll < 0.25) rewardTier = TIERS.BASIC;
                else if (roll < 0.75) rewardTier = TIERS.RARE;
                else rewardTier = TIERS.EXTINCT;
                break;
            case TIERS.EXTINCT:
                if (roll < 0.25) rewardTier = TIERS.BASIC;
                else if (roll < 0.5) rewardTier = TIERS.RARE;
                else rewardTier = TIERS.EXTINCT;
                break;
        }

        return rewardTier;
    }

    removePlant(plantId) {
        const index = this.plants.findIndex(p => p.id === plantId);
        if (index !== -1) {
            this.plants.splice(index, 1);
            this.save();
            showToast('Plant removed', 'warning');
            return true;
        }
        return false;
    }

    getGrowthStage(plant) {
        const elapsed = Date.now() - plant.plantedAt;
        let stage = 0;
        
        for (let i = GAME_CONFIG.GROWTH_STAGES.length - 1; i >= 0; i--) {
            if (elapsed >= GAME_CONFIG.GROWTH_STAGES[i].time) {
                stage = i;
                break;
            }
        }
        
        return stage;
    }
}

// Canvas Renderer
class GardenRenderer {
    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;
        this.animationFrame = null;
        this.dpr = window.devicePixelRatio || 1;
        this.imageCache = new Map();

        this.setupCanvas();
        this.bindEvents();
        this.preloadImages();
    }

    preloadImages() {
        // Preload all plant images
        Object.entries(PLANT_DATABASE).forEach(([tier, plants]) => {
            plants.forEach(plant => {
                const img = new Image();
                img.src = `assets/${plant.icon}`;
                img.onload = () => {
                    this.imageCache.set(plant.icon, img);
                };
                img.onerror = () => {
                    console.warn(`Failed to load image: ${plant.icon}`);
                };
            });
        });
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        
        // Store logical dimensions
        this.width = rect.width;
        this.height = rect.height;
    }

    bindEvents() {
        window.addEventListener('resize', () => this.setupCanvas());
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking on a plant
        const plant = this.getPlantAt(x, y);

        if (plant) {
            // Don't show popover for harvested plants
            if (!plant.harvested) {
                this.showPlantPopover(plant, x, y);
            }
        } else {
            // Plant a new seed
            if (this.gameState.seeds.length === 0) {
                showToast('No seeds available!', 'error');
                return;
            }

            // Store pending plant location
            this.gameState.pendingPlant = { x, y };
            showTitleModal();
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const plant = this.getPlantAt(x, y);

        // Ignore harvested plants for hover
        const effectivePlant = plant && !plant.harvested ? plant : null;

        if (effectivePlant !== this.gameState.hoveredPlant) {
            this.gameState.hoveredPlant = effectivePlant;

            if (effectivePlant) {
                showPlantTooltip(effectivePlant, e.clientX, e.clientY);
                this.canvas.style.cursor = 'pointer';
            } else {
                hidePlantTooltip();
                this.canvas.style.cursor = 'crosshair';
            }
        } else if (effectivePlant) {
            // Update tooltip position for non-harvested plants
            showPlantTooltip(effectivePlant, e.clientX, e.clientY);
        }
    }

    handleMouseLeave() {
        this.gameState.hoveredPlant = null;
        hidePlantTooltip();
        this.canvas.style.cursor = 'crosshair';
    }

    handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.handleClick({ clientX: touch.clientX, clientY: touch.clientY });
    }

    getPlantAt(x, y) {
        // Check plants in reverse order (top to bottom)
        for (let i = this.gameState.plants.length - 1; i >= 0; i--) {
            const plant = this.gameState.plants[i];
            const radius = 30;
            const dx = x - plant.x;
            const dy = y - plant.y;
            
            if (dx * dx + dy * dy <= radius * radius) {
                return plant;
            }
        }
        return null;
    }

    showPlantPopover(plant, x, y) {
        this.gameState.selectedPlant = plant;
        
        const popover = document.getElementById('plant-popover');
        const completeBtn = document.getElementById('complete-task-btn');
        
        // Check if can complete
        const elapsed = Date.now() - plant.plantedAt;
        completeBtn.disabled = elapsed < GAME_CONFIG.MIN_COMPLETE_TIME;
        
        if (completeBtn.disabled) {
            const remaining = GAME_CONFIG.MIN_COMPLETE_TIME - elapsed;
            const minutes = Math.ceil(remaining / 60000);
            completeBtn.textContent = `Complete (${minutes}m)`;
        } else {
            completeBtn.textContent = 'Complete Task';
        }
        
        // Position popover
        const rect = this.canvas.getBoundingClientRect();
        popover.style.left = `${rect.left + x}px`;
        popover.style.top = `${rect.top + y}px`;
        popover.classList.add('show');
        
        hidePlantTooltip();
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#98fb98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        
        // Draw plants
        this.gameState.plants.forEach(plant => {
            this.drawPlant(plant);
        });
    }

    drawPlant(plant) {
        const stage = this.gameState.getGrowthStage(plant);
        const x = plant.x;
        const y = plant.y;

        // Apply opacity for harvested plants (higher opacity for images)
        if (plant.harvested) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.7; // Increased from 0.4 for better visibility
        }

        // Highlight if hovered (but not if harvested)
        if (plant === this.gameState.hoveredPlant && !plant.harvested) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 35, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw checkmark for harvested plants
        if (plant.harvested) {
            // Draw a subtle checkmark overlay
            this.ctx.strokeStyle = '#4caf50';
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(x - 10, y);
            this.ctx.lineTo(x - 2, y + 8);
            this.ctx.lineTo(x + 12, y - 8);
            this.ctx.stroke();
        }

        // Draw plant - either image for harvested or emoji for growing
        if (plant.harvested && plant.harvestedPlant) {
            // Draw the harvested plant image
            const img = this.imageCache.get(plant.harvestedPlant.icon);
            if (img) {
                // Draw image centered at plant position
                const imgSize = 60;
                this.ctx.drawImage(img, x - imgSize/2, y - imgSize/2, imgSize, imgSize);
            } else {
                // Fallback to emoji if image not loaded
                this.ctx.font = '40px serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('🌺', x, y);
            }
        } else if (stage <= 5) {
            // Draw growth stage emoji for non-harvested plants
            const emoji = GROWTH_STAGE_EMOJIS[stage];

            this.ctx.font = '40px serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(emoji, x, y);
        }

        // Restore opacity if it was changed
        if (plant.harvested) {
            this.ctx.restore();
        }
    }

    start() {
        const animate = () => {
            this.render();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// UI Controllers
function updateSeedBank() {
    const slots = document.querySelectorAll('.seed-slot');

    slots.forEach((slot, index) => {
        if (index < gameState.seeds.length) {
            slot.classList.add('filled');
            slot.classList.remove('empty');

            // Set tier-specific styling
            const seed = gameState.seeds[index];
            slot.dataset.tier = seed.tier;

            // Add highlight animation for new seeds
            if (seed.isNew) {
                slot.classList.add('new-seed-highlight');
                // Remove the animation class after it completes
                setTimeout(() => {
                    slot.classList.remove('new-seed-highlight');
                }, 3000);
            }
        } else {
            slot.classList.remove('filled');
            slot.classList.add('empty');
            slot.classList.remove('new-seed-highlight');
            delete slot.dataset.tier;
        }
    });
}

function updatePlantCount() {
    const countEl = document.getElementById('plant-count');
    countEl.textContent = `Plants: ${gameState.plants.length}`;
}

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function showTitleModal() {
    const modal = document.getElementById('title-modal');
    const input = document.getElementById('title-input');
    
    modal.classList.add('show');
    input.value = '';
    input.focus();
}

function hideTitleModal() {
    const modal = document.getElementById('title-modal');
    modal.classList.remove('show');
}

function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const messageEl = document.getElementById('confirm-message');
    
    messageEl.textContent = message;
    modal.classList.add('show');
    
    // Store callback
    modal.dataset.confirmCallback = onConfirm.toString();
    window.tempConfirmCallback = onConfirm;
}

function hideConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('show');
    delete window.tempConfirmCallback;
}

function showPlantTooltip(plant, x, y) {
    const tooltip = document.getElementById('plant-tooltip');
    const elapsed = Date.now() - plant.plantedAt;
    const stage = gameState.getGrowthStage(plant);
    const stageName = GAME_CONFIG.GROWTH_STAGES[stage].label;
    
    tooltip.textContent = `${plant.title} (${stageName})`;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y - 40}px`;
    tooltip.classList.add('show');
}

function hidePlantTooltip() {
    const tooltip = document.getElementById('plant-tooltip');
    tooltip.classList.remove('show');
}

function hidePopover() {
    const popover = document.getElementById('plant-popover');
    popover.classList.remove('show');
    gameState.selectedPlant = null;
}

function showPlantdex() {
    const pane = document.getElementById('side-pane');
    const title = document.getElementById('pane-title');
    const content = document.getElementById('pane-content');
    
    title.textContent = 'Plantdex';
    content.innerHTML = '';
    
    // Create sections for each tier
    Object.values(TIERS).forEach(tier => {
        const section = document.createElement('div');
        section.className = `plantdex-section ${tier}`;
        
        const sectionTitle = document.createElement('h3');
        sectionTitle.className = 'plantdex-section-title';
        sectionTitle.textContent = tier.charAt(0).toUpperCase() + tier.slice(1) + ' Plants';
        section.appendChild(sectionTitle);
        
        const grid = document.createElement('div');
        grid.className = 'plantdex-grid';
        
        PLANT_DATABASE[tier].forEach((plant, index) => {
            const key = `${tier}:${plant.id}`;
            const count = gameState.dex[key] || 0;
            
            const item = document.createElement('div');
            item.className = `plantdex-item ${count > 0 ? 'discovered' : 'undiscovered'}`;
            item.dataset.plantKey = key;
            
            const icon = document.createElement('div');
            icon.className = 'plantdex-icon';
            if (count > 0) {
                const img = document.createElement('img');
                img.src = `assets/${plant.icon}`;
                img.alt = plant.name;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                icon.appendChild(img);
            } else {
                icon.textContent = '?';
            }
            item.appendChild(icon);
            
            const name = document.createElement('div');
            name.className = 'plantdex-name';
            name.textContent = count > 0 ? plant.name : '???';
            item.appendChild(name);
            
            if (count > 0) {
                const badge = document.createElement('div');
                badge.className = 'plantdex-count';
                badge.textContent = count;
                item.appendChild(badge);
            }
            
            item.addEventListener('click', () => {
                if (count > 0) {
                    showPlantDetail(tier, plant, count);
                }
            });
            
            grid.appendChild(item);
        });
        
        section.appendChild(grid);
        content.appendChild(section);
    });
    
    pane.classList.add('open');
}

function showSettings() {
    const pane = document.getElementById('side-pane');
    const title = document.getElementById('pane-title');
    const content = document.getElementById('pane-content');
    
    title.textContent = 'Settings';
    content.innerHTML = `
        <div class="settings-section">
            <h3>Preferences</h3>
            <div class="setting-item">
                <span class="setting-label">Sound Effects</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="sfx-toggle" ${gameState.settings.sfx ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="setting-item">
                <span class="setting-label">Animations</span>
                <label class="toggle-switch">
                    <input type="checkbox" id="animations-toggle" ${gameState.settings.animations ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
        <div class="settings-section">
            <h3>Data</h3>
            <button class="danger-btn" id="reset-btn">Reset All Data</button>
        </div>
    `;
    
    // Bind settings events
    document.getElementById('sfx-toggle').addEventListener('change', (e) => {
        gameState.settings.sfx = e.target.checked;
        gameState.save();
    });
    
    document.getElementById('animations-toggle').addEventListener('change', (e) => {
        gameState.settings.animations = e.target.checked;
        gameState.save();
    });
    
    document.getElementById('reset-btn').addEventListener('click', () => {
        showConfirmModal('Reset all progress? This cannot be undone!', () => {
            gameState.reset();
            updateSeedBank();
            updatePlantCount();
            hideConfirmModal();
            showToast('Game reset!', 'success');
        });
    });
    
    pane.classList.add('open');
}

function showPlantDetail(tier, plant, count) {
    const modal = document.getElementById('plant-detail-modal');
    const icon = document.getElementById('detail-icon');
    const name = document.getElementById('detail-name');
    const tierEl = document.getElementById('detail-tier');
    const description = document.getElementById('detail-description');
    const countEl = document.getElementById('detail-count');
    
    icon.innerHTML = '';
    const img = document.createElement('img');
    img.src = `assets/${plant.icon}`;
    img.alt = plant.name;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    icon.appendChild(img);
    icon.style.background = `linear-gradient(135deg, ${TIER_COLORS[tier]}33 0%, ${TIER_COLORS[tier]}66 100%)`;
    name.textContent = plant.name;
    tierEl.textContent = tier.charAt(0).toUpperCase() + tier.slice(1);
    tierEl.className = `plant-tier ${tier}`;
    description.textContent = plant.description;
    countEl.textContent = count;
    
    modal.classList.add('show');
}

// Initialize
let gameState;
let renderer;

function init() {
    // Create game state
    gameState = new GameState();
    gameState.load();
    
    // Create renderer
    const canvas = document.getElementById('garden-canvas');
    renderer = new GardenRenderer(canvas, gameState);
    renderer.start();
    
    // Update UI
    updateSeedBank();
    updatePlantCount();
    
    // Bind UI events
    bindUIEvents();
}

function bindUIEvents() {
    // Header buttons
    document.getElementById('plantdex-btn').addEventListener('click', showPlantdex);
    document.getElementById('settings-btn').addEventListener('click', showSettings);
    
    // Side pane close
    document.getElementById('close-pane-btn').addEventListener('click', () => {
        document.getElementById('side-pane').classList.remove('open');
    });
    
    // Title modal
    document.getElementById('title-confirm-btn').addEventListener('click', () => {
        const input = document.getElementById('title-input');
        const title = input.value.trim();
        
        if (!title) {
            showToast('Please enter a task title', 'error');
            return;
        }
        
        if (gameState.pendingPlant) {
            const seed = gameState.consumeSeed();
            if (seed) {
                gameState.plantSeed(
                    gameState.pendingPlant.x,
                    gameState.pendingPlant.y,
                    title,
                    seed
                );
                updateSeedBank();
                updatePlantCount();
                showToast('Task planted!', 'success');
            }
            gameState.pendingPlant = null;
        }
        
        hideTitleModal();
    });
    
    document.getElementById('title-cancel-btn').addEventListener('click', () => {
        gameState.pendingPlant = null;
        hideTitleModal();
    });
    
    document.getElementById('title-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('title-confirm-btn').click();
        } else if (e.key === 'Escape') {
            document.getElementById('title-cancel-btn').click();
        }
    });
    
    // Confirm modal
    document.getElementById('confirm-yes-btn').addEventListener('click', () => {
        if (window.tempConfirmCallback) {
            window.tempConfirmCallback();
        }
        hideConfirmModal();
    });
    
    document.getElementById('confirm-no-btn').addEventListener('click', hideConfirmModal);
    
    // Plant popover
    document.getElementById('complete-task-btn').addEventListener('click', () => {
        if (gameState.selectedPlant) {
            const result = gameState.completePlant(gameState.selectedPlant.id);
            if (result) {
                updateSeedBank();
                updatePlantCount();
                hidePopover();
            }
        }
    });
    
    document.getElementById('remove-plant-btn').addEventListener('click', () => {
        if (gameState.selectedPlant) {
            showConfirmModal('Remove this plant? The seed will not be returned.', () => {
                gameState.removePlant(gameState.selectedPlant.id);
                updatePlantCount();
                hidePopover();
                hideConfirmModal();
            });
        }
    });
    
    document.getElementById('popover-close-btn').addEventListener('click', hidePopover);
    
    // Plant detail modal
    document.getElementById('detail-close-btn').addEventListener('click', () => {
        document.getElementById('plant-detail-modal').classList.remove('show');
    });
    
    // Close modals on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hidePopover();
            document.querySelectorAll('.modal.show').forEach(modal => {
                modal.classList.remove('show');
            });
        }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        // Close popover if clicking outside
        const popover = document.getElementById('plant-popover');
        if (popover.classList.contains('show') && 
            !popover.contains(e.target) && 
            e.target !== renderer.canvas) {
            hidePopover();
        }
    });
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}