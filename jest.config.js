const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Use different environments for different test types
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'jest-environment-node',
      testMatch: [
        '<rootDir>/__tests__/**/*.test.ts',
        '<rootDir>/__tests__/**/!(*.component|*.tsx).test.*'
      ],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jest-environment-jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testMatch: [
        '<rootDir>/__tests__/**/*.component.test.*',
        '<rootDir>/__tests__/**/*.test.tsx'
      ],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    }
  ],
  // Ignore E2E tests in Jest (they run with Playwright)
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/e2e/'
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)