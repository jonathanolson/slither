// @ts-check

import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default {
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaFeatures: { modules: true },
      ecmaVersion: 'latest',
      project: './tsconfig.json'
    }
  },
  plugins: {
    '@typescript-eslint': ts,
    ts
  },
  rules: {
    ...ts.configs[ 'eslint-recommended' ].rules,
    ...ts.configs[ 'recommended' ].rules,

    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/class-literal-property-style': 'off',
    '@typescript-eslint/consistent-generic-constructors': 'error',
    '@typescript-eslint/consistent-type-assertions': 'error',
    '@typescript-eslint/consistent-type-exports': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/member-delimiter-style': 'error',
    '@typescript-eslint/member-ordering': 'off',
    '@typescript-eslint/method-signature-style': 'off',
    '@typescript-eslint/no-base-to-string': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/no-duplicate-enum-values': 'error',
    '@typescript-eslint/no-dynamic-delete': 'off',
    '@typescript-eslint/no-empty-interface': 'error',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-invalid-void-type': 'error',
    '@typescript-eslint/no-meaningless-void-operator': 'error',
    '@typescript-eslint/no-misused-new': 'error',
    '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-this-alias': 'error',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
    '@typescript-eslint/no-unnecessary-qualifier': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/no-useless-empty-export': 'error',
    '@typescript-eslint/non-nullable-type-assertion-style': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/prefer-enum-initializers': 'error',
    '@typescript-eslint/prefer-includes': 'error',
    '@typescript-eslint/prefer-literal-enum-member': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-ts-expect-error': 'error',
    '@typescript-eslint/typedef': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',

    'brace-style': 'off',
    '@typescript-eslint/brace-style': [ 'error', 'stroustrup', { allowSingleLine: true } ],

    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': 'off',

    'comma-spacing': 'off',
    '@typescript-eslint/comma-spacing': 'error',

    'default-param-last': 'off',
    '@typescript-eslint/default-param-last': 'error',

    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': 'error',

    indent: 'off',
    '@typescript-eslint/indent': 'off',

    'keyword-spacing': 'off',
    '@typescript-eslint/keyword-spacing': [ 'error', {
      before: true,
      after: true,
      overrides: {
        case: { after: true },
        switch: { after: true },
        catch: { after: true }
      }
    } ],

    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-dupe-class-members': 'error',

    'no-invalid-this': 'off',
    '@typescript-eslint/no-invalid-this': 'error',

    'no-loop-func': 'off',
    '@typescript-eslint/no-loop-func': 'error',

    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': 'error',

    'no-throw-literal': 'off',
    '@typescript-eslint/no-throw-literal': 'off',

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [ 'error', {

    args: 'none'
    } ],


    'object-curly-spacing': 'off',
    '@typescript-eslint/object-curly-spacing': [ 'error', 'always' ],

    'padding-line-between-statements': 'off',
    '@typescript-eslint/padding-line-between-statements': 'error',

    quotes: 'off',
    '@typescript-eslint/quotes': 'off',

    'require-await': 'off',
    '@typescript-eslint/require-await': 'off',

    semi: 'off',
    '@typescript-eslint/semi': [ 'error', 'always' ],

    'space-before-blocks': 'off',
    '@typescript-eslint/space-before-blocks': 'error',

    'space-before-function-paren': 'off',
    '@typescript-eslint/space-before-function-paren': [ 'error', {
    anonymous: 'never',
    named: 'never',
    asyncArrow: 'always'
    } ],

    'space-infix-ops': 'off',
    '@typescript-eslint/space-infix-ops': 'error',

    'ts/return-await': 2
  },
  files: [ 'src/**/*.ts', 'src/**/*.js' ],
};
