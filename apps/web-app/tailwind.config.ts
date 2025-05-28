import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // V7 Design Token System Implementation
      colors: {
        // Reference Palette
        ref: {
          palette: {
            primary: {
              dawn: '#F8F0E3',
              twilight: '#CEC8FF',
              overcast: '#D1D1D1',
              kgo: '#10002B',
            },
            secondary: {
              dawn: '#FDEBD0',
              twilight: '#E0BBE4',
              overcast: '#A0B2A6',
              kgo: '#301E67',
            },
            tertiary: {
              dawn: '#FFF8E7',
              twilight: '#A2A2D0',
              overcast: '#EAEAEA',
              kgo: '#5B8FB9',
            },
            neutral: {
              white: '#FFFFFF',
              alabaster: '#F0EBF4',
              lightGray: '#EAEAEA',
              midGray: '#A9A9A9',
              darkGray: '#36454F',
              deepCosmos: '#03001C',
            },
            accent: {
              journeyGold: '#E6BE8A',
              connectionEmber: '#FF6B6B',
              reflectionAmethyst: '#B28DFF',
              growthAurora: '#48AAAD',
            },
            error: '#B00020',
            onError: '#FFFFFF',
            success: '#38A169',
            onSuccess: '#FFFFFF',
          },
        },
        // System Color Roles (Light Theme - Dawn Haze inspired)
        sys: {
          color: {
            primary: '#E6BE8A', // journeyGold
            onPrimary: '#03001C', // deepCosmos
            primaryContainer: '#F8F0E3', // dawn
            onPrimaryContainer: '#B8956A', // darker journeyGold
            secondary: '#B28DFF', // reflectionAmethyst
            onSecondary: '#FFFFFF',
            secondaryContainer: '#E0BBE4', // twilight
            onSecondaryContainer: '#8B5FBF',
            tertiary: '#48AAAD', // growthAurora
            onTertiary: '#FFFFFF',
            tertiaryContainer: '#A2A2D0',
            onTertiaryContainer: '#2E7A7D',
            error: '#B00020',
            onError: '#FFFFFF',
            errorContainer: '#FDEAEA',
            onErrorContainer: '#8B0000',
            background: '#F8F0E3', // dawn
            onBackground: '#36454F', // darkGray
            surface: '#F0EBF4', // alabaster
            onSurface: '#36454F', // darkGray
            surfaceVariant: '#E8E3ED',
            onSurfaceVariant: '#A9A9A9', // midGray
            surfaceContainerLowest: '#FFFFFF',
            surfaceContainerLow: '#F8F5FA',
            surfaceContainer: '#F0EBF4',
            surfaceContainerHigh: '#E8E3ED',
            surfaceContainerHighest: '#E0DBE6',
            inverseSurface: '#36454F',
            inverseOnSurface: '#F0EBF4',
            inversePrimary: '#E6BE8A',
            outline: 'rgba(169, 169, 169, 0.5)',
            outlineVariant: 'rgba(169, 169, 169, 0.3)',
            scrim: 'rgba(0, 0, 0, 0.5)',
            shadow: 'rgba(0, 0, 0, 0.3)',
            // Glassmorphism Specific
            glass: {
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'rgba(255, 255, 255, 0.2)',
            },
          },
        },
        // Dark Theme System Colors (KGO Palette inspired)
        'sys-dark': {
          color: {
            primary: '#E6BE8A', // journeyGold
            onPrimary: '#03001C', // deepCosmos
            primaryContainer: '#B8956A',
            onPrimaryContainer: '#E6BE8A',
            secondary: '#B28DFF', // reflectionAmethyst
            onSecondary: '#03001C',
            secondaryContainer: '#8B5FBF',
            onSecondaryContainer: '#B28DFF',
            tertiary: '#48AAAD', // growthAurora
            onTertiary: '#03001C',
            tertiaryContainer: '#2E7A7D',
            onTertiaryContainer: '#48AAAD',
            error: '#FF6B6B',
            onError: '#03001C',
            errorContainer: '#8B0000',
            onErrorContainer: '#FF6B6B',
            background: '#03001C', // deepCosmos
            onBackground: '#F0EBF4', // alabaster
            surface: '#10002B', // kgo
            onSurface: '#F0EBF4', // alabaster
            surfaceVariant: '#1A0A35',
            onSurfaceVariant: '#A9A9A9', // midGray
            surfaceContainerLowest: '#03001C',
            surfaceContainerLow: '#0A0020',
            surfaceContainer: '#10002B',
            surfaceContainerHigh: '#1A0A35',
            surfaceContainerHighest: '#241440',
            inverseSurface: '#F0EBF4',
            inverseOnSurface: '#36454F',
            inversePrimary: '#B8956A',
            outline: 'rgba(169, 169, 169, 0.3)',
            outlineVariant: 'rgba(169, 169, 169, 0.2)',
            scrim: 'rgba(0, 0, 0, 0.7)',
            shadow: 'rgba(0, 0, 0, 0.5)',
            // Glassmorphism Specific
            glass: {
              background: 'rgba(30, 30, 40, 0.1)',
              border: 'rgba(80, 80, 100, 0.2)',
            },
          },
        },
      },
      // V7 Typography System
      fontFamily: {
        brand: ['General Sans', 'sans-serif'], // sys.typescale.brand-font-family
        plain: ['Inter', 'sans-serif'], // sys.typescale.plain-font-family
      },
      fontSize: {
        // Display Scale
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px', fontWeight: '400' }],
        'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0px', fontWeight: '400' }],
        'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0px', fontWeight: '400' }],
        // Headline Scale
        'headline-large': ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'headline-medium': ['28px', { lineHeight: '36px', fontWeight: '400' }],
        'headline-small': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        // Title Scale
        'title-large': ['22px', { lineHeight: '28px', fontWeight: '400' }],
        'title-medium': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'title-small': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        // Body Scale
        'body-large': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        // Label Scale
        'label-large': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-medium': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-small': ['11px', { lineHeight: '16px', fontWeight: '500' }],
      },
      // V7 Spacing System (8pt Grid)
      spacing: {
        'xxs': '4px',   // sys.spacing.xxs
        'xs': '8px',    // sys.spacing.xs
        'sm': '12px',   // sys.spacing.sm
        'md': '16px',   // sys.spacing.md
        'lg': '24px',   // sys.spacing.lg
        'xl': '32px',   // sys.spacing.xl
        'xxl': '48px',  // sys.spacing.xxl
        'xxxl': '64px', // sys.spacing.xxxl
      },
      // V7 Shape System (Corner Radius)
      borderRadius: {
        'none': '0px',      // sys.shape.corner.none
        'extra-small': '4px',  // sys.shape.corner.extra-small
        'small': '8px',     // sys.shape.corner.small
        'medium': '12px',   // sys.shape.corner.medium
        'large': '16px',    // sys.shape.corner.large
        'extra-large': '28px', // sys.shape.corner.extra-large
        'full': '9999px',   // sys.shape.corner.full
      },
      // V7 Box Shadow (Elevation System)
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'elevation-2': '0 2px 6px 2px rgba(0, 0, 0, 0.15), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'elevation-3': '0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        'elevation-4': '0 6px 10px 4px rgba(0, 0, 0, 0.15), 0 2px 3px 0 rgba(0, 0, 0, 0.3)',
        'elevation-5': '0 8px 12px 6px rgba(0, 0, 0, 0.15), 0 4px 4px 0 rgba(0, 0, 0, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)', // sys.shadow.glass
      },
      // V7 Animation & Transition System
      transitionTimingFunction: {
        'emphasized': 'cubic-bezier(0.2, 0, 0, 1)',    // sys.motion.easing.emphasized
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',    // sys.motion.easing.standard
        'decelerated': 'cubic-bezier(0.0, 0.0, 0.2, 1)', // sys.motion.easing.decelerated
        'accelerated': 'cubic-bezier(0.4, 0.0, 1, 1)',   // sys.motion.easing.accelerated
      },
      transitionDuration: {
        'short1': '100ms',    // sys.motion.duration.short1
        'short2': '150ms',    // sys.motion.duration.short2
        'medium1': '250ms',   // sys.motion.duration.medium1
        'medium2': '300ms',   // sys.motion.duration.medium2
        'long1': '400ms',     // sys.motion.duration.long1
        'long2': '500ms',     // sys.motion.duration.long2
        'extra-long1': '800ms', // sys.motion.duration.extraLong1
      },
      // V7 Z-Index System
      zIndex: {
        'canvas': '0',        // sys.zIndex.canvas
        'modal-backdrop': '700', // sys.zIndex.modalBackdrop
        'modal': '800',       // sys.zIndex.modal
        'hud': '900',         // sys.zIndex.hud
        'orb': '1000',        // sys.zIndex.orb
      },
      // V7 State Layer Opacity
      opacity: {
        'hover': '0.08',      // sys.state.hover.state-layer-opacity
        'focus': '0.12',      // sys.state.focus.state-layer-opacity
        'pressed': '0.12',    // sys.state.pressed.state-layer-opacity
        'dragged': '0.16',    // sys.state.dragged.state-layer-opacity
      },
    },
  },
  plugins: [],
};

export default config; 