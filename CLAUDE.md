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

1. **GameState** (app.js:64-246): Central state management handling:
   - Seeds inventory (max 5)
   - Active plants (max 5 in garden)
   - Plantdex (collection of discovered plants)
   - Local storage persistence via STORAGE_KEYS

2. **GardenRenderer** (app.js:249-471): Canvas rendering engine that:
   - Draws plants at different growth stages
   - Handles mouse/touch interactions
   - Updates 60fps via requestAnimationFrame

3. **Plant Growth System**: 6 growth stages based on elapsed time:
   - Stage 0: Seed (0-20 minutes)
   - Stage 1: Sprout (20min-1hr)
   - Stage 2: Seedling (1-2hrs)
   - Stage 3: Young Plant (2-4hrs)
   - Stage 4: Mature Plant (4-24hrs)
   - Stage 5: Full Bloom (24+hrs)

### Plant Tiers & Rewards
Three rarity tiers with different reward probabilities:
- **Basic** (green): Common plants, 50% basic / 50% rare seed rewards
- **Rare** (purple): Uncommon plants, 25% basic / 50% rare / 25% extinct seed rewards
- **Extinct** (orange/gold): Legendary plants, 25% basic / 25% rare / 50% extinct seed rewards

### Data Persistence
Uses localStorage with versioned keys (v1) for:
- Seeds inventory
- Active plants with timestamps
- Plantdex collection stats
- User settings (sfx, animations toggles)

### Asset System
Currently uses placeholder colored circles for plants. The codebase is pre-wired to load PNG assets from `assets/{tier}/{id}_{stage}.png` structure once images are added.

## Key Implementation Details

- **Canvas coordinates**: Plants store absolute x,y positions from click events
- **Plant completion**: Enforces 20-minute minimum growth time before harvest
- **Seed bank auto-refill**: Automatically refills with 5 basic seeds when empty
- **Modal system**: Reusable modal components for task input, confirmations, and plant details
- **Toast notifications**: Non-blocking feedback system for user actions