module.exports = {
    root: true,
    extends: ['universe/native', 'universe/shared/typescript-analysis'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // JS only
      'no-console': 'warn'
    },
    ignorePatterns: ['node_modules/', 'dist/']
  };
  