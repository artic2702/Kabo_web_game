# Kabo Project - Premium Spotlight Design

## Current Design Status
- ✅ Landing page: Premium spotlight table with smooth gradients
- ✅ Setup pages (StartScreen, LobbyScreen): Same theme applied
- ✅ Card styling: Enhanced shadows with 4-layer depth system
- ✅ Animations: Breathing glow + card hover effects
- ✅ Performance: GPU-accelerated, responsive, ~1KB CSS

## Key Design Values

### Main Gradient (`.landing-stage`)
```css
#2dd4bf 0%      /* Bright cyan-green center */
#10b981 12%     /* Table spotlight green */
#059669 22%     /* Rich poker table green */
#047857 32%     /* Mid-tone green */
#065f46 42%     /* Dark green (shadow begins) */
#064e3b 55%     /* Deep shadow green */
#0f2818 70%     /* Near-black at edges */
#000000 100%    /* Pure black vignette */
```

### Shadow System (Cards)
```css
Close:    0 1px 3px rgba(0,0,0,0.35)
Mid:      0 6px 16px rgba(0,0,0,0.45)
Far:      0 20px 60px rgba(0,0,0,0.4)
Rim:      inset 0 0 20px rgba(255,255,255,0.1)
```

### Hover Enhancements
- Lift: `translateY(-24px)`
- Scale: `1.08x` (8% larger)
- Additional glow on variant cards

## Customization Points

### Quick Adjustments
1. **Brightness**: Adjust `rgba(255,255,255,0.08)` in glow layer
2. **Darkness**: Increase `inset 0 0 600px rgba(0,0,0,0.8)`
3. **Colors**: Change hex values in main gradient
4. **Animation**: Modify `subtleGlow 5s` duration

### Common Variations
- **Brighter**: Shift color stops 2-3% earlier
- **Darker**: Add deeper shadows, increase vignette
- **Warmer**: Use amber/gold colors instead of green
- **Cooler**: Use blue/cyan colors instead of green

## File Locations
- Main CSS: `src/styles/landing.css`
- Component: `src/components/LandingAnimation.jsx`
- Setup pages: `src/components/StartScreen.jsx`, `LobbyScreen.jsx`
- Docs: `SPOTLIGHT_DESIGN_SYSTEM.md`, `BEFORE_AND_AFTER.md`

## Next Features to Add
- [ ] Card entry animations (throw + flip)
- [ ] Dynamic spotlight following mouse
- [ ] Particle effects (dust)
- [ ] Sound effects on card hover
- [ ] Mobile touch optimizations

## Notes
- Design uses 3-layer system: gradient + glow overlay + depth shadows
- All animations are GPU-accelerated (no perf issues)
- Responsive design (scales with viewport)
- Future color schemes simply require value changes
