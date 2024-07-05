import type { Config } from 'jest';
import { defaults } from 'jest-config';

const config: Config = {
  ...defaults,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  preset: 'ts-jest',
  resetMocks: true,
  resetModules: true,

  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
    '!**/__tests__/**/__*/**/*',
  ],

  transform: { '.*.ts': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
};

export default config;
