module.exports = {
  root: true,
  rules: {
    'no-bitwise': 'off'
  },
  globals: {
  },
  ignorePatterns: [ 'dist' ],
  overrides: [
    {
      files: [
        '**/*.ts'
      ],
      parserOptions: {
        sourceType: 'module'
      }
    }
  ],
  env: {
    browser: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module'
  }
};
