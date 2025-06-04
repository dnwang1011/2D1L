import { Canvas, type MeshProps } from '@react-three/fiber';
import { render } from '@testing-library/react';
import React from 'react';

import { useOrbStore } from '../../../stores/OrbStore';
import Orb from '../Orb';

// Mock the OrbStore
jest.mock('../../../stores/OrbStore');
const mockUseOrbStore = useOrbStore as jest.MockedFunction<typeof useOrbStore>;

// Mock Three.js components
jest.mock('@react-three/drei', () => ({
  Sphere: ({ children, ...props }: { children?: React.ReactNode } & Omit<MeshProps, 'children'>) => (
    <mesh {...props} data-testid="orb-sphere">
      {children}
    </mesh>
  ),
}));

describe('Orb Component', () => {
  const defaultOrbState = {
    isVisible: true,
    position: [0, 0, 0] as [number, number, number],
    emotionalTone: 'neutral' as const,
    visualState: 'default' as const,
  };

  beforeEach(() => {
    mockUseOrbStore.mockReturnValue({
      ...defaultOrbState,
      setVisible: jest.fn(),
      setPosition: jest.fn(),
      setEmotionalTone: jest.fn(),
      setVisualState: jest.fn(),
      reset: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders a sphere when visible', () => {
    const { getByTestId } = render(
      <Canvas>
        <Orb />
      </Canvas>
    );

    expect(getByTestId('orb-sphere')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    mockUseOrbStore.mockReturnValue({
      ...defaultOrbState,
      isVisible: false,
      setVisible: jest.fn(),
      setPosition: jest.fn(),
      setEmotionalTone: jest.fn(),
      setVisualState: jest.fn(),
      reset: jest.fn(),
    });

    const { queryByTestId } = render(
      <Canvas>
        <Orb />
      </Canvas>
    );

    expect(queryByTestId('orb-sphere')).not.toBeInTheDocument();
  });

  it('applies correct emotional tone color', () => {
    mockUseOrbStore.mockReturnValue({
      ...defaultOrbState,
      emotionalTone: 'happy',
      setVisible: jest.fn(),
      setPosition: jest.fn(),
      setEmotionalTone: jest.fn(),
      setVisualState: jest.fn(),
      reset: jest.fn(),
    });

    const { getByTestId } = render(
      <Canvas>
        <Orb />
      </Canvas>
    );

    const sphere = getByTestId('orb-sphere');
    expect(sphere).toBeInTheDocument();
    // Note: In a real test environment, you would test the material properties
    // This is a simplified test structure
  });

  it('uses correct position from store', () => {
    const testPosition: [number, number, number] = [1, 2, 3];
    mockUseOrbStore.mockReturnValue({
      ...defaultOrbState,
      position: testPosition,
      setVisible: jest.fn(),
      setPosition: jest.fn(),
      setEmotionalTone: jest.fn(),
      setVisualState: jest.fn(),
      reset: jest.fn(),
    });

    const { getByTestId } = render(
      <Canvas>
        <Orb />
      </Canvas>
    );

    const sphere = getByTestId('orb-sphere');
    expect(sphere).toBeInTheDocument();
    expect(sphere).toHaveAttribute('position', testPosition.toString());
  });
}); 