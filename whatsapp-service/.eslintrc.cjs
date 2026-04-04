module.exports = {
  env: {
    node: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended'
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': 'warn',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'quote-props': ['warn', 'as-needed']
  }
};
