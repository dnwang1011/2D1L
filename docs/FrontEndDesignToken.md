**2dots1line: Design Tokens Specification**

---

## 🔍 Purpose

Design tokens provide a centralized system of values for consistent styling across the entire 2dots1line platform. These tokens define colors, typography, spacing, radii, shadows, motion, and layering for both 2D UI and 3D-inspired visual systems.

---

## 🌈 Color Tokens

### Brand & Functional Colors

| Token                      | Value     | Description                         |
| -------------------------- | --------- | ----------------------------------- |
| `color.journeyGold`        | `#E6BE8A` | Highlights, call-to-actions         |
| `color.connectionEmber`    | `#FF6B6B` | Active links, relationship cues     |
| `color.reflectionAmethyst` | `#B28DFF` | Annotations, prompts, introspection |
| `color.growthAurora`       | `#48AAAD` | Progress, motivation indicators     |

### Neutrals

| Token               | Value             | Use Case                  |
| ------------------- | ----------------- | ------------------------- |
| `color.nebulaWhite` | `#F0EBF4`         | Primary text, overlays    |
| `color.cometGrey`   | `#A9A9A9`         | Secondary text, dividers  |
| `color.voidBlack`   | `#0B0E2D`         | Background of graph scene |
| `color.overlayDark` | `rgba(0,0,0,0.4)` | Modals, backdrop filter   |

### Gradients (as references)

| Token                       | Stops                                       | Use                         |
| --------------------------- | ------------------------------------------- | --------------------------- |
| `gradient.cosmicDawn`       | Twilight Veil → Journey Gold → Nebula White | Onboarding, card activation |
| `gradient.galacticFlow`     | Deep Cosmos → Amethyst → Ember              | Active graph interactions   |
| `gradient.atmosphericShell` | Dawn → Twilight → Overcast                  | Interface backgrounds       |

---

## ✏️ Typography Tokens

| Token                 | Value                      | Usage                    |
| --------------------- | -------------------------- | ------------------------ |
| `font.family.base`    | 'Inter', sans-serif        | Default text             |
| `font.family.display` | 'General Sans', sans-serif | Headlines, large numbers |

| Token                 | Value  | Notes                        |
| --------------------- | ------ | ---------------------------- |
| `font.size.xs`        | `12px` | UI labels                    |
| `font.size.sm`        | `14px` | Descriptive text             |
| `font.size.md`        | `16px` | Body text                    |
| `font.size.lg`        | `20px` | Modal headings               |
| `font.size.xl`        | `28px` | Card titles, section headers |
| `font.weight.regular` | `400`  | Base text                    |
| `font.weight.bold`    | `600`  | Emphasis                     |

---

## ↕️ Spacing & Layout Tokens

| Token      | Value  | Description                 |
| ---------- | ------ | --------------------------- |
| `space.xs` | `4px`  | Tight padding, icon spacing |
| `space.sm` | `8px`  | Inline spacing              |
| `space.md` | `16px` | Standard padding            |
| `space.lg` | `24px` | Section spacing             |
| `space.xl` | `32px` | Large layout breathing room |

\| `container.width.max` | `1200px` | Max width for centered layout   |

---

## ○ Radius & Shape Tokens

| Token         | Value    | Application                         |
| ------------- | -------- | ----------------------------------- |
| `radius.xs`   | `4px`    | Input fields, micro cards           |
| `radius.md`   | `12px`   | Modals, standard cards              |
| `radius.xl`   | `32px`   | Floating containers, HUD panels     |
| `radius.full` | `9999px` | Orb, status pills, floating buttons |

---

## 🔦 Shadow & Elevation Tokens

| Token         | Value                            | Use Case                  |
| ------------- | -------------------------------- | ------------------------- |
| `shadow.sm`   | `0 1px 2px rgba(0,0,0,0.06)`     | Cards, small elements     |
| `shadow.md`   | `0 4px 8px rgba(0,0,0,0.1)`      | Modals, floating buttons  |
| `shadow.lg`   | `0 12px 24px rgba(0,0,0,0.15)`   | Elevated HUD elements     |
| `shadow.glow` | `0 0 12px rgba(178,141,255,0.6)` | Orb aura, activated cards |

---

## 🎙 Motion & Transition Tokens

| Token                | Value                     | Description                          |
| -------------------- | ------------------------- | ------------------------------------ |
| `transition.default` | `all 300ms ease`          | Standard UI transitions              |
| `transition.modal`   | `opacity 400ms ease-out`  | Modal fade-ins                       |
| `motion.bounce`      | Spring (0.4, 0.1, 0.2, 1) | Card or Orb response movement        |
| `motion.slow`        | `ease-in-out 800ms`       | Used for camera or scene transitions |

---

## ⬆️ Z-Index & Layering Tokens

| Layer              | Token      | Z-Index | Description                          |
| ------------------ | ---------- | ------- | ------------------------------------ |
| **Orb (3D)**       | `z.orb`    | `1000`  | Always on top (3D to DOM projection) |
| **2D Modal Layer** | `z.modal`  | `800`   | Cards, HUD, dashboard                |
| **3D Canvas**      | `z.canvas` | `0`     | Immersive background                 |

---

This design token system ensures a **cohesive, scalable, and expressive design language** across the product—from subtle UI details to immersive emotional storytelling. Tokens can be exported as JSON for Tailwind, CSS variables, or design tools like Figma.
