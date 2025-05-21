const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.base.json');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\.(ts|tsx)?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        isolatedModules: true
      },
    ],
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  moduleNameMapper: {
    // Use pathsToModuleNameMapper to correctly map TypeScript paths
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/../../' }),
    '^@2dots1line/shared-types/ai$': '<rootDir>/../shared-types/src/ai/index.ts',
    '^@2dots1line/shared-types$': '<rootDir>/../shared-types/src/index.ts',
    // Add mappings for other packages like database, ai-clients as needed
    // Example: '^@2dots1line/database/(.*)$': '<rootDir>/../database/src/$1',
  },
}; 