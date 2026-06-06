import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      'expo-sqlite': path.resolve(rootDir, 'src/test-utils/expo-sqlite-node.ts'),
    },
  },
  test: {
    include: ['src/**/__tests__/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: true,
  },
});
