/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  experimentalTernaries: true,
  printWidth: 120,
  quoteProps: 'as-needed',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  useTabs: false,
  importOrder: [
    '\.css',
    '<THIRD_PARTY_MODULES>',
    '^\./SlitherQueryParameters\.ts$',
    'phet-lib',
    '^\./model',
    '^\./scan',
    '^\./test',
    '^\./util',
    '^\./view',
    '^\./workarounds',
    '^\./workers',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

export default config;
