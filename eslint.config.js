// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // This rule is for HTML. Apostrophes and quotes inside React Native <Text> render fine.
      'react/no-unescaped-entities': 'off',
    },
  },
]);
