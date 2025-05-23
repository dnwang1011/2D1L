import type { Meta, StoryObj } from '@storybook/react';
import GlassmorphicPanel from './GlassmorphicPanel';

const meta: Meta<typeof GlassmorphicPanel> = {
  title: 'Components/GlassmorphicPanel',
  component: GlassmorphicPanel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling',
    },
    children: {
      control: 'text', // Or 'object' if you want to pass more complex React nodes via controls
      description: 'Content to be displayed inside the panel',
      defaultValue: 'This is some content inside the panel.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p>This is a Glassmorphic Panel!</p>,
    className: 'w-96', // Example width for the story
  },
};

export const WithCustomStyling: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-xl font-semibold mb-2 text-white">Custom Title</h3>
        <p className="text-sm text-gray-200">Some custom descriptive text to demonstrate more complex children and styling inheritance.</p>
      </div>
    ),
    className: 'w-96 shadow-xl border-purple-500/50', // Example custom class
  },
};

export const LargerPanel: Story = {
  args: {
    children: "This panel is larger and has more padding due to a custom class.",
    className: 'w-[500px] h-[300px] p-10',
  },
}; 