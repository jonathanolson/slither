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
        main: '/index.html',
        'scan-test': '/scan-test.html',
        'solver-fuzz': '/solver-fuzz.html',
        'discover-rules': '/discover-rules.html',
        'rules-test': '/rules-test.html',
        'rule-gen': '/rule-gen.html',
        'rule-list': '/rule-list.html',
        'rule-image': '/rule-image.html',
        'debug-rule': '/debug-rule.html',
      },
      plugins: [
        unassert( {
          // include: [ '**/**.js', '**/**.ts' ]
        } )
      ]
    }
  }
} )
