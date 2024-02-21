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
    exclude: [ 'phet-lib', 'tesseract.js', 'culori', 'pako' ]
  },

  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        'scan-test': '/scan-test.html'
      },
      plugins: [
        unassert( {
          // include: [ '**/**.js', '**/**.ts' ]
        } )
      ]
    }
  }
} )
