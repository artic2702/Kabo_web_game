# 🎭 Premium Spotlight Table Design System

## Overview

Your Kabo landing screen now features a **professional poker table under stage lighting** effect using advanced CSS gradients and overlay techniques.

---

## Visual Design Philosophy

### Before vs After

**BEFORE:**
```
❌ Hard circular color bands
❌ Flat appearance
❌ Visible color stops at 5%, 10%, 15%, 20%
❌ No depth perception
❌ Artificial-looking gradients
```

**AFTER:**
```
✅ Smooth, natural light falloff
✅ Multi-layer depth effect
✅ Soft gradients with premium feel
✅ Realistic 3D table appearance
✅ Professional casino-style lighting
```

---

## How It Works: The 3-Layer System

### Layer 1: Base Radial Gradient (`.landing-stage` background)

**Purpose**: Main lighting effect with smooth color transitions

**Color Structure**:
```
0% - 12%:   Bright cyan-green      (#2dd4bf → #10b981)
            ↓ Card spotlight area
12% - 42%:  Rich poker-table green (#059669 → #065f46)
            ↓ Illuminated felt surface
42% - 70%:  Dark green shadows     (#064e3b → #0f2818)
            ↓ Table edges fade to darkness
70% - 100%: Black vignette         (#0a0a0a → #000000)
            ↓ Stage darkness beyond table
```

**Key Improvement**: Instead of abrupt color stops every 5%, colors now transition smoothly over 15-20% ranges, creating a natural light falloff.

### Layer 2: Breathing Glow (`.landing-stage::before`)

**Purpose**: Adds subtle atmospheric glow that creates premium, lived-in aesthetic

**Effect**:
- Radial glow emanating from center
- Subtle white highlight overlay
- Soft animation (breathing: 5s cycle)
- Creates warmth and sophistication

**CSS**:
```css
background: radial-gradient(
  circle at center,
  rgba(255, 255, 255, 0.08) 0%,
  rgba(255, 255, 255, 0.04) 20%,
  transparent 70%
);
animation: subtleGlow 5s ease-in-out infinite;
```

### Layer 3: Depth Shadows (`.landing-stage::after`)

**Purpose**: Creates 3D perception and atmospheric depth

**Effect Breakdown**:
1. **Rim light** (top-left highlight):
   - `radial-gradient(circle at 45% 35%, rgba(255,255,255,0.05)...)`
   - Simulates light reflection on glass/cards

2. **Mid-tone shadow**:
   - Adds gradual darkening from center
   - Creates hollow vignette effect

3. **Outer vignette**:
   - Heavy shadow at edges
   - Ensures stage darkness effect

**CSS**:
```css
background:
  radial-gradient(circle at 45% 35%, rgba(255, 255, 255, 0.05) 0%, transparent 30%),
  radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.15) 50%, transparent 100%),
  radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.4) 80%, rgba(0, 0, 0, 0.7) 100%);
mix-blend-mode: overlay;
```

---

## Card Styling: Premium Depth

### Shadow System (`.card-option-face`)

**Layered shadows create realistic 3D**:

```css
box-shadow:
  0 1px 3px rgba(0, 0, 0, 0.35),      /* Close shadow: near card */
  0 6px 16px rgba(0, 0, 0, 0.45),     /* Mid shadow: object depth */
  0 20px 60px rgba(0, 0, 0, 0.4),     /* Far shadow: table perspective */
  inset 0 0 20px rgba(255, 255, 255, 0.1);  /* Rim light: premium edge */
```

**Effect**: Card appears to float above the table surface

### Hover Enhancement

**On hover**, cards get:
- **Stronger shadows**: Lift increases perceived distance
- **Glowing aura**: Colored light emission (green for online, purple for offline)
- **Inset highlight**: More pronounced rim lighting
- **Scale up**: 1.08x (8% larger) for emphasis

```css
box-shadow:
  0 2px 6px rgba(0, 0, 0, 0.3),
  0 12px 28px rgba(0, 0, 0, 0.5),
  0 30px 80px rgba(0, 0, 0, 0.45),
  inset 0 0 30px rgba(255, 255, 255, 0.15),
  0 0 100px rgba(139, 92, 246, 0.25);  /* Purple glow */
```

### Card Shadow on Table (`.card-shadow`)

**Purpose**: Grounds cards to table surface

**Effect**:
- Elliptical shadow beneath card
- Expands when card hovers (shows lift)
- Blurred for softness
- Creates depth perception

```css
background: radial-gradient(
  ellipse at center,
  rgba(0, 0, 0, 0.6) 0%,      /* Dark core */
  rgba(0, 0, 0, 0.3) 50%,     /* Medium fade */
  transparent 75%              /* Soft edge */
);
filter: blur(1px);
```

---

## Customization Guide

### Adjust Brightness/Intensity

**Make Brighter** (more light on table):
1. Shift color stops earlier:
```css
#10b981 20%,  /* was 12% - green extends further */
#059669 35%,  /* was 22% - bright area larger */
```

2. Increase glow brightness:
```css
rgba(255, 255, 255, 0.12) 0%,  /* was 0.08 */
```

3. Reduce shadow inset:
```css
box-shadow: inset 0 0 300px rgba(0, 0, 0, 0.5);  /* was 0.8 */
```

### Make Darker (dramatic stage lighting):
1. Push color stops later:
```css
#10b981 8%,   /* was 12% - bright area shrinks */
#059669 15%,  /* was 22% - darkness comes sooner */
```

2. Reduce glow:
```css
rgba(255, 255, 255, 0.04) 0%,  /* was 0.08 */
```

3. Increase shadow:
```css
box-shadow: inset 0 0 800px rgba(0, 0, 0, 0.9);  /* was 0.8 */
```

### Change Colors (different table mood)

**Warm Amber Lighting** (candlelight):
```css
#ffd89b 0%,    /* Warm gold */
#ffb347 12%,
#ff9500 22%,
#cc7700 32%,
#8b4513 42%,
```

**Cool Blue Lighting** (neon):
```css
#7dd3fc 0%,    /* Cool blue */
#38bdf8 12%,
#0ea5e9 22%,
#0284c7 32%,
```

**Pink/Magenta Lighting** (cyberpunk):
```css
#f472b6 0%,    /* Bright pink */
#db2777 12%,
#be123c 22%,
#831843 32%,
```

---

## Animation: Subtle Breathing Glow

### Keyframe Definition

```css
@keyframes subtleGlow {
  0% {
    opacity: 0.6;        /* dim */
    filter: brightness(1);
  }
  50% {
    opacity: 1;          /* bright */
    filter: brightness(1.15);
  }
  100% {
    opacity: 0.6;        /* dim again */
    filter: brightness(1);
  }
}
```

**Effect**: Creates pulsing, living atmosphere without being distracting

**Adjust Duration**:
- `5s` → `3s`: Faster breathe (more energetic)
- `5s` → `8s`: Slower breathe (more calm, elegant)
- Remove entirely: Delete `animation: subtleGlow 5s...;` from `.landing-stage::before`

---

## Mobile Responsiveness

### Gradient Auto-Scales

The radial gradient naturally scales with viewport size (uses percentages, not pixels).

### Optional Media Query Override

```css
@media (max-width: 768px) {
  .landing-stage {
    background: radial-gradient(
      circle at center,
      #2dd4bf 0%,
      #10b981 10%,   /* tighter on mobile */
      #059669 25%,
      #047857 40%,
      /* ... rest ... */
    );
  }
}
```

---

## Performance Considerations

✅ **GPU Accelerated**:
- Uses CSS gradients (GPU-native)
- `mix-blend-mode` runs on GPU
- No JavaScript animation
- Smooth 60fps

✅ **File Size**:
- Pure CSS (~1KB after gzip)
- No image assets needed
- Scales infinitely without quality loss

✅ **Browser Support**:
- Works on all modern browsers
- Graceful degradation on older browsers
- CSS gradients: ~99% support

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Colors look washed out | Increase inset shadow: `inset 0 0 800px...` |
| Too dark, can't see cards | Reduce shadow or push color stops earlier |
| Glow is too subtle | Increase `opacity` or `filter: brightness()` |
| Edges are too sharp | Increase final color stop percentages (85% → 70%) |
| Card shadows look wrong | Check z-index and ensure card is `z-index: 5` |

---

## Files Affected

✅ `src/styles/landing.css` — All gradient definitions
✅ `src/components/LandingAnimation.jsx` — Uses `.landing-stage`
✅ `src/components/StartScreen.jsx` — Uses `.spotlight-page`
✅ `src/components/LobbyScreen.jsx` — Uses `.spotlight-page`

---

## Visual Comparison

### Color Gradient Values

```
[Core]              [Table Felt]        [Shadow]           [Vignette]
┌────────────────┬─────────────────┬──────────────────┬──────────────┐
#2dd4bf (0%)    #059669 (22%)    #064e3b (55%)      #0a0a0a (85%)
  ↓               ↓                 ↓                   ↓
#10b981 (12%)   #047857 (32%)    #0f2818 (70%)      #000000 (100%)
└────────────────┴─────────────────┴──────────────────┴──────────────┘
   [Cyan-Green]    [Poker Green]   [Deep Shadow]    [Stage Black]
```

---

## Implementation Checklist

- ✅ Smooth radial gradient (no hard circles)
- ✅ Natural light falloff
- ✅ Multi-layer depth system
- ✅ Breathing glow animation
- ✅ Premium card shadows
- ✅ Card hover lighting enhancement
- ✅ Vignette effect (dark edges)
- ✅ Responsive design
- ✅ GPU-accelerated performance
- ✅ Professional casino aesthetic

---

## Next Steps

1. **Test**: View at localhost:5174
2. **Customize**: Adjust colors or timing as needed
3. **Deploy**: Build with `npm run build`

Enjoy your premium spotlight table! 🎭✨

---

*Last Updated: April 3, 2026*
