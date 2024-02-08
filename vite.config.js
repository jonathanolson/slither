import { defineConfig } from 'vite'

// Using js/ts compatibility from https://github.com/vitejs/vite/issues/3040

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find:/^(.*)\.js$/,
        replacement: '$1',
      }
    ]
  }
})
