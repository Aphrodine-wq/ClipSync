module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/backend/__tests__', '<rootDir>/clipsync-app/src/__tests__'],
  testMatch: ['**/*.test.js', '**/*.test.jsx'],
  collectCoverageFrom: [
    'backend/**/*.js',
    'clipsync-app/src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};

