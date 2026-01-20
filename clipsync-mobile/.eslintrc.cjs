/**
 * React Native Mobile ESLint config - extends root and React Native configs
 */
module.exports = {
  extends: ['../.eslintrc.cjs'],
  root: false,
  env: {
    'react-native/react-native': true,
    jest: true,
  },
  plugins: ['react-native'],
  rules: {
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
    'no-console': 'off',
  },
  overrides: [
    {
      files: ['e2e/**/*.js', '**/*.e2e.js'],
      env: {
        jest: true,
      },
      globals: {
        device: 'readonly',
        waitFor: 'readonly',
        element: 'readonly',
        by: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
      },
    },
  ],
};
