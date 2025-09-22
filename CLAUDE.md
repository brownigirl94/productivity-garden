# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Productivity Garden is a vanilla JavaScript web application that gamifies task management through a virtual garden where tasks grow as plants. Users plant "seeds" (create tasks), watch them grow through different stages, and harvest them when complete.

## Commands

### Running the Application
This is a static web application with no build process. Simply open `index.html` in a web browser or use a local web server:
```bash
python3 -m http.server 8000
# or
npx http-server
```

## Architecture

### Core Game Loop
The application uses a canvas-based rendering system with three main components:

1. **GameState** (app.js:74-283): Central state management handling:
   - Seeds inventory (max 5)
   - Active plants (max 5 in garden)
   - Plantdex (collection of discovered plants)
   - Local storage persistence via STORAGE_KEYS

2. **GardenRenderer** (app.js:285-547): Canvas rendering engine that:
   - Draws plants at different growth stages using emojis or images
   - Handles mouse/touch interactions for planting and harvesting
   - Updates at 60fps via requestAnimationFrame
   - Manages image caching for harvested plant sprites

3. **Plant Growth System**: 6 growth stages based on elapsed time:
   - Stage 0: Seed (0-20 minutes) 🌰
   - Stage 1: Sprout (20min-1hr) 🌱
   - Stage 2: Seedling (1-2hrs) 🌿
   - Stage 3: Young Plant (2-4hrs) 🌾
   - Stage 4: Mature Plant (4-24hrs) 🌲
   - Stage 5: Full Bloom (24+hrs) 🌺

### Plant Database Structure
15 unique plants across 3 tiers stored in `PLANT_DATABASE` (app.js:39-61):
- 5 Basic plants (moonbell_fern, dewdrop_moss, etc.)
- 5 Rare plants (crystalbark_sapling, dreamweaver_vine, etc.)
- 5 Extinct plants (dragonbreath_lily, void_lotus, etc.)

### Plant Tiers & Rewards
Three rarity tiers with different reward probabilities:
- **Basic** (green #7cb342): Common plants, 50% basic / 50% rare seed rewards
- **Rare** (purple #5e35b1): Uncommon plants, 25% basic / 50% rare / 25% extinct seed rewards
- **Extinct** (orange/gold #ff6f00): Legendary plants, 25% basic / 25% rare / 50% extinct seed rewards

### Data Persistence
Uses localStorage with versioned keys (v1) for:
- Seeds inventory (`pgarden:v1:seeds`)
- Active plants with timestamps (`pgarden:v1:plants`)
- Plantdex collection stats (`pgarden:v1:dex`)
- User settings (`pgarden:v1:settings`)

### Canvas Rendering Details
- **Garden dimensions**: 1280x375px (scales responsively)
- **Plant interaction radius**: 30px from center point
- **Visual states**: Normal, hovered (white outline), harvested (70% opacity + checkmark)
- **Harvested plants**: Display actual plant image at 60x60px, fallback to 🌺 emoji if image fails

### Asset System
Currently uses emoji placeholders for growing plants. Harvested plants attempt to load PNG assets from `assets/{tier}/{plant.icon}` structure. Images are preloaded and cached in `GardenRenderer.imageCache`.

## Key Implementation Details

- **Canvas coordinates**: Plants store absolute x,y positions from click events
- **Plant completion**: Enforces 20-minute minimum growth time before harvest (currently set to 1 minute for testing at line 15)
- **Seed bank auto-refill**: Automatically refills with 5 basic seeds when empty
- **Modal system**: Reusable modal components for task input, confirmations, and plant details
- **Toast notifications**: Non-blocking feedback system for user actions
- **Click detection**: Uses distance calculation from plant center (30px radius)
- **Plant selection**: Clicking seeds in seed bank activates planting mode, clicking garden places plant