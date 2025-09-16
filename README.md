# Assets Folder Structure

This folder is structured to hold future PNG assets for the Productivity Garden app.

## Directory Structure

```
assets/
├── basic/        # Basic tier plant images
├── rare/         # Rare tier plant images
├── extinct/      # Extinct tier plant images
└── README.md     # This file
```

## File Naming Convention

Plant images should follow this naming pattern:
`{tier}/{id}_{stage}.png`

Where:
- `{tier}` = basic, rare, or extinct
- `{id}` = 1-5 (plant ID within tier)
- `{stage}` = 0-5 (growth stage) or "final" for mature form

### Example Files:
- `basic/1_0.png` - Basic plant #1, seed stage
- `basic/1_1.png` - Basic plant #1, sprout stage
- `basic/1_final.png` - Basic plant #1, final mature form
- `rare/3_2.png` - Rare plant #3, seedling stage
- `extinct/5_final.png` - Extinct plant #5, final form

## Growth Stages

- Stage 0: Seed (0-20 minutes)
- Stage 1: Sprout (20 min - 1 hour)
- Stage 2: Seedling (1-2 hours)
- Stage 3: Young Plant (2-4 hours)
- Stage 4: Mature Plant (4-24 hours)
- Stage 5: Full Bloom (24+ hours)
- Final: Completed/harvested form

## Plant Reference

### Basic Plants (Green theme)
1. Moonbell Fern - 🌿
2. Dewdrop Moss - 🍃
3. Whisperwort - 🌱
4. Glimmergrass - 🌾
5. Starlight Sprout - ☘️

### Rare Plants (Purple theme)
1. Crystalbark Sapling - 🌲
2. Dreamweaver Vine - 🌿
3. Phoenix Bloom - 🌺
4. Shadowleaf Orchid - 🌸
5. Timekeeper Rose - 🌹

### Extinct Plants (Orange/Gold theme)
1. Dragon's Breath Lily - 🔥
2. Void Lotus - 🌑
3. Eternal Frost Pine - ❄️
4. Starfall Mushroom - 🍄
5. Worldtree Seedling - 🌳

## Image Specifications

Recommended specs for PNG files:
- Size: 128x128 pixels for plants
- Format: PNG with transparency
- Color depth: 32-bit (RGBA)
- Optimization: Use tools like pngcrush or optipng for web

## Integration

The app is already wired to load these images. Simply place properly named PNG files in the correct directories, and they will automatically be used instead of the placeholder shapes.