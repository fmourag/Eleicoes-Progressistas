module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  maxWorkers: 1,
  moduleNameMapper: {
    '^@np/shared/(.*)$': '<rootDir>/../../packages/shared/src/$1',
    '^@np/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!jose)'
  ],
};
