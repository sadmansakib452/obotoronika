module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@nuxt/eslint-config',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    // Turn off the "no-explicit-any" rule
    '@typescript-eslint/no-explicit-any': 'off',

    // Optional tweaks
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
}
