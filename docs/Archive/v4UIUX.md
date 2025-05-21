## 🌌 2dots1line — Reimagined UI/UX Spec: "The Empyrean Interface"

### 🧭 Overview

A deeply reflective, skyscape-inspired interface where users discover and connect their dimensional self through memory, metaphor, and insight. Dot is not an AI friend—it’s an orb-like agent with expressive hands that embodies the user's evolving knowledge graph and AI's capacity for pattern recognition.

---

### 1. **ONBOARDING — "Entering the Sky"**

**Empyrean Gate:**

* Dynamic cloud-parting animation.
* Logo draws itself as calligraphic line between two stars.
* Dot (orb with two hands) floats in asleep; wakes up upon tap.

**Dot's First Words:**

> "Hm? Oh! A new thread to follow… What brings you through my sky today?"

**Initial Capture Options:**

* Type a fleeting thought
* Speak a short memory (voice-to-text)
* Upload moment (image, video, file)

**Result:**

* Dot replies with a poetic metaphor card + a "Hidden Trait Detected" badge.
* Soft chime + Dot whispers: "I’ve marked this for dream processing later…"

---

### 2. **TODAY VIEW — "The Observatory"**

**Background:** Time-based skyscape (sunrise, day, dusk, night).

**Sections:**

* **Dot's Dream Last Night**: A metaphor cluster visualized (interactive, tap to see source memories).
* **One Small Prompt**: e.g. "What almost went unnoticed yesterday?"
* **Loose Threads**: Incomplete entries from prior days.
* **What Dot Found**: Patterns/metaphors Dot discovered overnight.

---

### 3. **CHAT WITH DOT — "The Listening Chamber"**

**Visual Style:**

* Dark, introspective theme.
* Floating orb of Dot, surrounded by particle halo.
* Typing box hidden until user engages.

**Mechanics:**

* Dot may answer with:

  * A poetic line
  * A memory bead
  * A link to a past cluster
* Optional tools:

  * "Show me a pattern"
  * "Tell me a secret"
  * "Cluster my thoughts"

**Expression Layer:**

* One hand draws mid-air glyphs
* Other hand gestures reflect mood (tap chin = curious, rotate = thinking)

---

### 4. **MY LIFEWEB — "The Constellation Map"**

**Modes:**

* **Constellation:** Concepts as stars, memories orbiting them
* **Thread View:** Narrative arcs (e.g. "Trust", "Leaving Home")
* **Microscope:** Zoom into one concept, see linked insights
* **Growth Bloom:** Visual growth of personal traits over time

**Interaction:**

* Hover: see summary
* Tap: open card
* Drag: create new thread between dots

---

### 5. **ARCHIVE / DREAM LIBRARY**

**Content Types:**

* Dot’s Dream Logs (poetic, surreal pattern finds)
* Metaphor Gallery (e.g. "You’re a snowglobe thinker")
* Narrative Arcs (user + Dot co-written stories)

**User Actions:**

* Pin a metaphor to Today View
* Share or draft from a cluster
* Replay a past self (Time Capsule)

---

### 🎨 SHARED COMPONENTS & STYLE

| Component        | Style                                          |
| ---------------- | ---------------------------------------------- |
| DotCard          | Glassmorphic, accent tinted, layered glow      |
| BeadComposer     | Drag+drop threading of concepts/memories       |
| ReflectionPrompt | Floating card, calm animation, light haptic    |
| Lifeweb3D        | WebGL via Three.js or Babylon.js               |
| Typography       | Montserrat (UI), Lora/Merriweather (content)   |
| Color System     | Themed by view (Dawn Rose, Twilight Amethyst)  |
| Dot Avatar       | Orb with subtle light pulses, expressive hands |
| Particle System  | Sky dust, ambient movement                     |

---

### 🛠️ For Implementation

* **Prompt System for Cursor/Framer:**

  * Style prompt: “Empyrean Interface—dynamic skyscape + glassmorphism + warm clarity.”
  * Modular: DotCard, MemoryCard, 3DGraphScene, PromptUnit

* **Animation System:**

  * Use Framer Motion or R3F/Three.js with GPU optimization
  * Light-based transitions (sunrise to dusk fade; constellation shimmer)

* **Behavior System:**

  * Dot can nap, fumble with beads, mumble dreams
  * Idle state triggers metaphoric dream generation

Let me know if you want this translated into Figma specs, prototyping flows, or developer tickets next.
