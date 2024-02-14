
import { resolve } from 'path'
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
    exclude: [ 'phet-lib', 'tesseract.js' ]
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve( __dirname, 'index.html' ),
        'scan-test': resolve( __dirname, 'scan-test.html' )
      }
    }
  }
} )
