module.exports = {
  preset: "jest-expo",
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*)"
  ],
  collectCoverageFrom: [
    "storage/**/*.ts",
    "services/**/*.ts",
    "components/**/*.tsx",
    "constants/**/*.ts",
    "!**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
};
