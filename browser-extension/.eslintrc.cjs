/**
 * Browser Extension ESLint config - extends root config
 */
module.exports = {
  extends: ['../.eslintrc.cjs'],
  root: false,
  env: {
    webextensions: true,
  },
  globals: {
    chrome: 'readonly',
    browser: 'readonly',
  },
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off',
  }
};
