/**
 * CLI ESLint config - extends root config
 */
module.exports = {
  extends: ['../.eslintrc.cjs'],
  root: false,
  rules: {
    'no-unused-vars': 'off',
    'no-console': 'off',
    'no-constant-condition': 'off',
  }
};
