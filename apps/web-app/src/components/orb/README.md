# Orb Implementation (S2.T6)

This directory contains the implementation of the Orb UI MVP and basic state management as specified in the V7UltimateWorkplan S2.T6.

## Components

### `Orb.tsx`
The main Orb component that renders a 3D sphere with dynamic visual properties:

- **Visual Appearance**: Emissive material with color based on emotional tone
- **Animations**: 
  - Gentle floating motion (sin wave on Y-axis)
  - Pulsing scale effect based on visual state
  - Rotation animation for 'thinking' state
- **Responsiveness**: Reacts to OrbStore state changes in real-time

#### Emotional Tone Colors:
- `neutral`: Grey (#808080)
- `happy`: Gold/Yellow (#FFD700)
- `sad`: Royal Blue (#4169E1)
- `excited`: Tomato Red (#FF6347)
- `calm`: Pale Green (#98FB98)
- `angry`: Crimson (#DC143C)

#### Visual State Animations:
- `default`: Standard pulsing (speed: 1, intensity: 0.1)
- `listening`: Active pulsing (speed: 2, intensity: 0.2)
- `thinking`: Slow pulsing + rotation (speed: 0.5, intensity: 0.05)
- `speaking`: Fast pulsing (speed: 3, intensity: 0.3)
- `sleeping`: Very slow pulsing (speed: 0.2, intensity: 0.02)

### `OrbLayer.tsx`
Container component for the Orb and future 3D elements:

- Wraps Orb in Suspense for loading handling
- Provides structure for future expansion (particle effects, multiple orbs)
- Clean separation of concerns

### `OrbDebugPanel.tsx`
Interactive debug panel for testing Orb functionality:

- Real-time state modification controls
- Visual feedback for current state
- Position controls with preset locations
- Complete reset functionality

## State Management

### `OrbStore.ts`
Zustand store managing Orb state:

```typescript
interface OrbState {
  isVisible: boolean;                    // Show/hide the Orb
  position: [number, number, number];    // 3D position coordinates
  emotionalTone: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'angry';
  visualState: 'default' | 'listening' | 'thinking' | 'speaking' | 'sleeping';
  
  // Actions
  setVisible: (visible: boolean) => void;
  setPosition: (position: [number, number, number]) => void;
  setEmotionalTone: (tone: EmotionalTone) => void;
  setVisualState: (state: VisualState) => void;
  reset: () => void;
}
```

**Default State:**
- `isVisible`: true
- `position`: [0, 0, 0]
- `emotionalTone`: 'neutral'
- `visualState`: 'default'

## Integration

### Canvas3D Integration
The Orb is integrated into the existing `Canvas3D.tsx` component:

```tsx
<Canvas>
  <ambientLight intensity={0.5} />
  <pointLight position={[10, 10, 10]} intensity={1} />
  
  {/* Original rotating cube (moved to side for comparison) */}
  <RotatingCube />
  
  {/* New Orb implementation */}
  <OrbLayer />
  
  <OrbitControls />
</Canvas>
```

## Usage Examples

### Basic Usage
```tsx
import { useOrbStore } from '../../stores/OrbStore';

function MyComponent() {
  const { setEmotionalTone, setVisualState } = useOrbStore();
  
  const handleHappyMood = () => {
    setEmotionalTone('happy');
    setVisualState('speaking');
  };
  
  return <button onClick={handleHappyMood}>Make Orb Happy</button>;
}
```

### React DevTools Testing
1. Open React DevTools in browser
2. Navigate to Components tab
3. Find `OrbStore` in component tree
4. Modify state values directly to see real-time changes

## Testing

### Component Tests
Location: `__tests__/Orb.test.tsx`

Tests cover:
- Sphere rendering when visible
- Hiding when not visible
- Emotional tone color application
- Position property handling

### Manual Testing
1. Start the web app: `npm run dev`
2. Navigate to http://localhost:3000
3. Use the debug panel in the top-right corner
4. Test all emotional tones and visual states
5. Verify position changes and visibility toggle

## Performance Considerations

- **useFrame Optimization**: Animation loop only runs when Orb is visible
- **Material Caching**: Standard materials are efficiently reused
- **State Updates**: Zustand provides optimized re-renders only for changed properties

## Future Enhancements

Planned expansions for the OrbLayer:
- Particle effects around the Orb
- Multiple Orb instances for different contexts
- Environmental elements that respond to Orb state
- Audio visualization elements
- Advanced lighting effects

## Dependencies

- `@react-three/fiber`: React renderer for Three.js
- `@react-three/drei`: Useful helpers for R3F
- `three`: 3D graphics library
- `zustand`: State management
- `react`: UI framework

## Browser Compatibility

Tested on:
- Chrome 91+
- Firefox 89+
- Safari 14+
- Edge 91+

Requires WebGL support for 3D rendering. 