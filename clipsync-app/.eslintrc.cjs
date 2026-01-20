/**
 * Web App ESLint config - extends root config
 */
module.exports = {
  extends: ['../.eslintrc.cjs'],
  root: false,
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off',
    'react/prop-types': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**', '**/*.test.{js,jsx}'],
      env: {
        jest: true,
      },
    },
  ],
};
