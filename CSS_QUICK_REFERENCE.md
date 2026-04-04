# 🎭 Quick CSS Reference - Spotlight Table

## Copy & Paste Customization

### Location
File: `src/styles/landing.css`
Lines: ~19-104

---

## Current Production Gradient

### Full CSS (Copy this section)
```css
.landing-stage {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(
    circle at center,
    #2dd4bf 0%,        /* 🟦 Bright cyan-green (center spotlight) */
    #1fb98f 6%,        /* 🟩 Vivid teal-green */
    #10b981 12%,       /* 🟩 Emerald (main table) */
    #059669 22%,       /* 🟩 Rich green (felt surface) */
    #047857 32%,       /* 🟩 Deep green */
    #065f46 42%,       /* 🟩 Dark green (shadows start) */
    #064e3b 55%,       /* 🟩 Very dark green (deep shadow) */
    #0f2818 70%,       /* 🟩 Nearly black-green (table edge) */
    #0a0a0a 85%,       /* ⬛ Very dark gray-black */
    #000000 100%       /* ⬛ Pure black (edges) */
  );

  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-primary);
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 600px rgba(0, 0, 0, 0.8);
}
```

---

## Preset Color Schemes

### 1️⃣ DARK & DRAMATIC (High Stakes)
**For intense, professional feel**

```css
background: radial-gradient(
  circle at center,
  #1fb98f 0%,        /* Darker center start */
  #10b981 8%,        /* Smaller bright area */
  #047857 18%,       /* Darkness comes sooner */
  #064e3b 35%,
  #0f2818 60%,
  #000000 100%
);
box-shadow: inset 0 0 800px rgba(0, 0, 0, 0.9);
```

### 2️⃣ BRIGHT & INVITING (Casual)
**For welcoming, approachable feel**

```css
background: radial-gradient(
  circle at center,
  #5eead4 0%,        /* Much brighter center */
  #2dd4bf 6%,        /* Extended bright zone */
  #1fb98f 15%,
  #10b981 25%,
  #059669 40%,
  #047857 55%,
  #065f46 75%,
  #000000 100%
);
box-shadow: inset 0 0 400px rgba(0, 0, 0, 0.5);
```

### 3️⃣ WARM & LUXE (Casino)
**Amber/gold spotlight instead of green**

```css
background: radial-gradient(
  circle at center,
  #fcd34d 0%,        /* Bright gold */
  #fbbf24 8%,        /* Warm amber */
  #f59e0b 18%,       /* Orange-gold */
  #d97706 32%,       /* Deep orange */
  #b45309 50%,       /* Brown-orange */
  #78350f 75%,       /* Dark brown */
  #000000 100%       /* Black edges */
);
```

### 4️⃣ COOL & MODERN (Neon)
**Blue/cyan spotlight**

```css
background: radial-gradient(
  circle at center,
  #7dd3fc 0%,        /* Bright sky blue */
  #38bdf8 8%,        /* Cyan */
  #0ea5e9 18%,       /* Sky blue */
  #0284c7 32%,       /* Ocean blue */
  #0c4a6e 50%,       /* Deep blue */
  #082f49 75%,       /* Dark navy */
  #000000 100%
);
```

### 5️⃣ PINK & VIBRANT (Pop)
**Magenta/pink spotlight**

```css
background: radial-gradient(
  circle at center,
  #f472b6 0%,        /* Bright pink */
  #ec4899 8%,        /* Hot pink */
  #db2777 18%,       /* Deep pink */
  #be185d 32%,
  #9d174d 50%,
  #500724 75%,
  #000000 100%
);
```

---

## Individual Parameter Adjustments

### Make Overall Brighter
Change this:
```css
box-shadow: inset 0 0 600px rgba(0, 0, 0, 0.8);
```
To this:
```css
box-shadow: inset 0 0 300px rgba(0, 0, 0, 0.4);  /* Lighter vignette */
```

### Make Overall Darker
Change this:
```css
box-shadow: inset 0 0 600px rgba(0, 0, 0, 0.8);
```
To this:
```css
box-shadow: inset 0 0 900px rgba(0, 0, 0, 0.95);  /* Darker vignette */
```

### Increase Center Glow
Edit `.landing-stage::before`:
```css
.landing-stage::before {
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.15) 0%,  /* was 0.08 - brighter glow */
    rgba(255, 255, 255, 0.06) 20%,
    transparent 70%
  );
}
```

### Slow Down Breathing Animation
Edit `.landing-stage::before`:
```css
animation: subtleGlow 8s ease-in-out infinite;  /* was 5s - slower */
```

### Turn Off Animation Completely
Remove this line:
```css
animation: subtleGlow 5s ease-in-out infinite;  /* DELETE THIS */
```

---

## Card Shadow Customization

### Default (Production)
```css
.card-option-face {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.35),
    0 6px 16px rgba(0, 0, 0, 0.45),
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
}
```

### Softer (Less Dramatic)
```css
.card-option-face {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 4px 8px rgba(0, 0, 0, 0.25),
    0 12px 30px rgba(0, 0, 0, 0.2),
    inset 0 0 15px rgba(255, 255, 255, 0.08);
}
```

### Harder (More Dramatic)
```css
.card-option-face {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.6),
    0 30px 80px rgba(0, 0, 0, 0.5),
    inset 0 0 25px rgba(255, 255, 255, 0.15);
}
```

### On Hover
```css
.card-option.idle:hover .card-option-face {
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.3),
    0 12px 28px rgba(0, 0, 0, 0.5),
    0 30px 80px rgba(0, 0, 0, 0.45),
    inset 0 0 30px rgba(255, 255, 255, 0.15),
    0 0 100px rgba(139, 92, 246, 0.25);  /* 👈 Adjust this for glow intensity */
}
```

---

## Quick Testing Workflow

1. **Edit gradient**:
   ```bash
   # Open file
   code src/styles/landing.css

   # Find .landing-stage (line ~19)
   # Modify the gradient colors
   ```

2. **View changes**:
   ```bash
   npm run dev
   # Go to http://localhost:5174
   # Changes auto-reload!
   ```

3. **Build when happy**:
   ```bash
   npm run build
   ```

---

## Validation Checklist

**After customizing, verify:**

- [ ] Colors are valid hex codes (`#XXXXXX`)
- [ ] Percentages add up (0% → 100%)
- [ ] No syntax errors (check browser console)
- [ ] Gradient transitions smoothly (no banding)
- [ ] Cards are visible on background
- [ ] Hover effects work
- [ ] Mobile looks good (resize to 768px)

---

## Emergency Reset

If something breaks, revert to production gradient:

```css
.landing-stage {
  background: radial-gradient(
    circle at center,
    #2dd4bf 0%,
    #1fb98f 6%,
    #10b981 12%,
    #059669 22%,
    #047857 32%,
    #065f46 42%,
    #064e3b 55%,
    #0f2818 70%,
    #0a0a0a 85%,
    #000000 100%
  );
}
```

---

## Pro Tips

💡 **Tip 1**: For custom colors, use:
- **Bright center**: Use saturated colors (#2dd4bf, #fcd34d, #7dd3fc)
- **Mid tones**: Slightly desaturated versions
- **Dark edges**: Very desaturated (toward pure black)

💡 **Tip 2**: Test on different devices:
```bash
# Check on mobile
npm run dev -- --host
# Visit: http://YOUR_IP:5174 on phone
```

💡 **Tip 3**: Color psychology:
- **Green** = Professional, card game, nature
- **Gold** = Luxury, casino, wealth
- **Blue** = Modern, tech, cool
- **Pink** = Fun, energetic, pop culture

💡 **Tip 4**: Always test card contrast:
- Cards must be **clearly visible** on background
- Glow shouldn't be too bright (distracting)
- Shadows should add depth, not obscure cards

---

**Ready to customize? Pick a preset or create your own!** 🎨
