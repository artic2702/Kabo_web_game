# 🎭 Spotlight Background Customization Guide

## Overview

The new landing experience uses a **radial gradient background** to create a poker table under a spotlight effect. This replaces the old overlay-based spotlight system.

---

## Visual Effect

```
        🟩 Light Green (#4ade80)
            ↓ BRIGHT CENTER
        ┌─────────────────┐
        │    💳 💳      │
        │   CARDS HERE   │  ← Cards placed in bright area
        │                │
        └─────────────────┘
            ↓ FADES
        🟩 Dark Green (#15803d)
            ↓ FADES
        🟩 Very Dark (#0f3d23)
            ↓ FADES
        ⬛ Black (#000000)

Result: Looks like a table under a spotlight lamp
```

---

## Where to Customize

### Main Spotlight Background
**File**: `src/styles/landing.css`
**Class**: `.landing-stage` (lines ~19-32)

```css
.landing-stage {
  background: radial-gradient(
    circle at center,
    #4ade80 0%,        /* Bright green center */
    #22c55e 20%,       /* Light green */
    #16a34a 35%,       /* Green */
    #15803d 50%,       /* Medium green */
    #166534 65%,       /* Dark green */
    #0f3d23 80%,       /* Very dark green */
    #050f08 95%,       /* Near black */
    #000000 100%       /* Black edges */
  );
}
```

### Setup Pages (Offline/Online)
**File**: `src/styles/landing.css`
**Class**: `.spotlight-page` (lines ~220-245)

Uses the **exact same gradient** for consistency.

---

## How to Adjust the Effect

### 🎨 **Make it Brighter (More Light)**
Change the percentages and colors to use lighter greens longer:

```css
/* Original */
#4ade80 0%
#22c55e 20%
#16a34a 35%

/* Brighter (light green extends further) */
#4ade80 0%
#22c55e 35%    /* ← 35% instead of 20% */
#16a34a 50%    /* ← 50% instead of 35% */
```

### 🌙 **Make it Darker (More Shadow)**
Shift to darker colors earlier:

```css
/* Original */
#4ade80 0%
#22c55e 20%
#16a34a 35%

/* Darker (dark green starts sooner) */
#4ade80 0%
#22c55e 12%    /* ← 12% instead of 20% */
#16a34a 25%    /* ← 25% instead of 35% */
```

### 🔵 **Change Color Temperature**
Replace green with other colors:

**Warm (Orange/Amber spotlight):**
```css
#fbbf24 0%,     /* Warm gold */
#f59e0b 20%,
#d97706 40%,
#b45309 60%,
#78350f 80%,
#000000 100%
```

**Cool (Blue spotlight):**
```css
#93c5fd 0%,     /* Light blue */
#60a5fa 20%,
#3b82f6 40%,
#1d4ed8 60%,
#1e3a8a 80%,
#000000 100%
```

**Red/Pink spotlight:**
```css
#fca5a5 0%,     /* Light pink */
#f87171 20%,
#ef4444 40%,
#be123c 60%,
#831843 80%,
#000000 100%
```

---

## Card Customization

### Card Size
**File**: `src/styles/landing.css`
**Class**: `.card-option` (lines ~96-101)

```css
.card-option {
  width: 180px;      /* Change to 160px (smaller) or 220px (larger) */
  height: 270px;     /* Keep aspect ratio ~2:3 */
}
```

### Card Shadows
**File**: `src/styles/landing.css`
**Class**: `.card-option-face` (lines ~228-242)

```css
.card-option-face {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 8px 20px rgba(0, 0, 0, 0.4),      /* ← Increase last value for harder shadow */
    0 20px 50px rgba(0, 0, 0, 0.35);    /* ← Increase for more drop shadow */
}
```

### Card Hover Effect
**File**: `src/styles/landing.css`
**Class**: `.card-option.idle:hover` (lines ~325-328)

```css
.card-option.idle:hover {
  transform: translateY(-20px) scale(1.06);
  /* translateY: how much card lifts (bigger = more lift) */
  /* scale: how much bigger card becomes (1.06 = 6% bigger) */
}
```

---

## Dust Particles

### Adjust Visibility
**File**: `src/styles/landing.css`
**Class**: `.dust` (lines ~60-67)

```css
.dust {
  background: rgba(255, 255, 255, 0.4);  /* ← Change 0.4 for brightness */
  /* 0.2 = very faint, 0.6 = very visible */
}
```

### Change Particle Count
Edit `LandingAnimation.jsx` to add/remove dust particles:

```jsx
<div className="dust-particles">
  <span className="dust" />  {/* Add more of these for more particles */}
  <span className="dust" />
  <span className="dust" />
  {/* Optional: add more */}
  <span className="dust" />
  <span className="dust" />
</div>
```

---

## Responsive/Mobile

### Mobile Background
**File**: `src/styles/landing.css`
**Media Query**: `@media (max-width: 560px)` (lines ~910+)

```css
@media (max-width: 560px) {
  .landing-stage {
    /* Optionally adjust for mobile */
  }

  .card-option {
    width: 160px;   /* Smaller on mobile */
    height: 240px;
  }
}
```

---

## Animation Timing

### Entry Animation Speed
**File**: `src/styles/landing.css`
**Class**: `.card-option.entering.from-left` (lines ~273-276)

```css
.card-option.entering.from-left {
  animation: cardThrowLeft 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: 0.8s;
  /* 0.85s = duration, 0.8s = delay before starting */
}
```

### Flip Animation Speed
**File**: `src/styles/landing.css`
**Class**: `.card-option-flipper` (lines ~264-266)

```css
.card-option-flipper {
  transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* 0.55s = time to flip, cubic-bezier = easing function */
  /* cubic-bezier(0.34, 1.56, 0.64, 1) creates a "spring" bounce effect */
}
```

---

## Quick Presets

Copy and paste these combinations for different moods:

### 🌳 Forest Table
```css
#5eead4 0%,     /* Teal */
#2dd4bf 25%,
#14b8a6 40%,
#0d9488 60%,
#134e4a 85%,
#000000 100%
```

### ⚫ High Contrast (Dark)
```css
#86efac 0%,     /* Very bright green */
#22c55e 15%,
#16a34a 30%,
#052e16 70%,
#000000 100%
```

### ✨ Soft Glow
```css
#a7f3d0 0%,     /* Lighter green */
#6ee7b7 25%,
#34d399 40%,
#10b981 60%,
#059669 80%,
#000000 100%
```

---

## Testing

After changes, rebuild:
```bash
npm run build
```

Or run dev server:
```bash
npm run dev
```

Then visit: `http://localhost:5174`

---

## Advanced: Custom Gradient

For maximum control, you can use `at` positioning:

```css
background: radial-gradient(
  circle at 50% 40%,    /* Move center up */
  #4ade80 0%,
  #22c55e 20%,
  /* ... rest of gradient ... */
)
```

Or use multiple gradients:

```css
background:
  radial-gradient(circle at 50% 50%, #4ade80 0%, transparent 60%),
  radial-gradient(circle at 50% 50%, transparent 40%, #000000 100%);
```

---

## Files Affected

- ✅ `src/styles/landing.css` — Main gradient definitions
- ✅ `src/components/LandingAnimation.jsx` — Scene structure
- ✅ `src/components/StartScreen.jsx` — Offline setup
- ✅ `src/components/LobbyScreen.jsx` — Online setup
- ✅ `src/components/CardOption.jsx` — Card rendering

No other files were changed. GameBoard keeps its original theme.

---

Need help? Check the implementation in `landing.css` - everything is well-commented!
