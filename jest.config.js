// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/configuration

const config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8", // babel is an option
  preset: "@shelf/jest-mongodb",
  watchPathIgnorePatterns: ['globalConfig']
};

module.exports = config;
