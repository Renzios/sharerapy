// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.d.ts",
    "!lib/**/*.d.ts",
  ],
  testMatch: ["<rootDir>/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@tests/(.*)$": "<rootDir>/__tests__/$1",
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/cypress/",
    "<rootDir>/tests/robot/",
    "<rootDir>/tests/server-actions/",
  ],
  // Ensure proper handling of ES modules and async/await
  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$|@blocknote|prosemirror-.*|@tiptap))",
  ],
  // Handle Next.js server components and actions
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  // Increase timeout for CI environments
  testTimeout: 10000,
  // Use separate TypeScript config for tests to avoid conflicts
  globals: {
    "ts-jest": {
      tsconfig: "__tests__/tsconfig.json",
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
