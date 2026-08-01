const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  clearMocks: true
};

// next/jest prepends its own transformIgnorePatterns, which would leave
// jose (ESM-only, v6) untransformed and crash on `export`. Override the
// resolved config so jose is transformed; the pattern is written to survive
// pnpm's nested node_modules layout.
module.exports = async () => {
  const resolved = await createJestConfig(config)();
  resolved.transformIgnorePatterns = [
    "node_modules/(?!.*jose)",
    "^.+\\.module\\.(css|sass|scss)$"
  ];
  return resolved;
};
