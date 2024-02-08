module.exports = {
  "root": true,
  // "parser": "@typescript-eslint/parser",
  // "plugins": [ "@typescript-eslint" ],
  "rules": {
    "no-bitwise": "off"
  },
  "globals": {
  },
  "overrides": [
    {
      "files": [
        "**/*.ts"
      ],
      "parserOptions": {
        "sourceType": "module"
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
