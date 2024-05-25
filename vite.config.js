import unassert from 'rollup-plugin-unassert';
import { defineConfig } from 'vite';

// Using js/ts compatibility from https://github.com/vitejs/vite/issues/3040

// https://vitejs.dev/config/
export default defineConfig( {
  base: '',
  resolve: {
    alias: [
      {
        find: /^(.*)\.js$/,
        replacement: '$1'
      }
    ]
  },

  // Because of https://github.com/vitejs/vite/issues/12434?
  optimizeDeps: {
    exclude: [ 'phet-lib', 'tesseract.js', 'culori', 'pako', 'tactile-js' ],
    entries: []
  },

  build: {
    rollupOptions: {
      input: {
        'main': '/index.html',
        'rule-explorer': '/rule-explorer.html',
        'rule': '/rule.html',
        'scan-test': '/scan-test.html',
        'solver-fuzz': '/solver-fuzz.html',
        'discover-rules': '/discover-rules.html',
        'rules-test': '/rules-test.html',
        'rule-image': '/rule-image.html',
        'curated-rules': '/curated-rules.html',
        'filtered-rules': '/filtered-rules.html',
        'formal-concept-analysis': '/formal-concept-analysis.html',
        'pattern-boards': '/pattern-boards.html',
        'export-ruleset-image': '/export-ruleset-image.html',
        'hooks': '/hooks.html',
        'test/model-tests': '/test/model-tests.html',
        'test/correctness-tests': '/test/correctness-tests.html',
      },
      plugins: [
        unassert( {
          // include: [ '**/**.js', '**/**.ts' ]
        } )
      ]
    }
  }
} )
