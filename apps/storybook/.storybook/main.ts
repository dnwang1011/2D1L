import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../../../packages/ui-components/src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config, { configType }) {
    // Ensure Tailwind CSS is processed
    // You might need to explicitly add postcss configuration here if it's not picked up
    // For monorepos, make sure paths are resolved correctly.
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Example: if ui-components has its own tailwind config, you might need to point to it
        // or ensure the root tailwind config is accessible.
        // For now, assuming ui-components styles are compatible or root tailwind applies.
      };
    }
    return config;
  },
};
export default config; 