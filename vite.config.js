import modify from 'rollup-plugin-modify';
import unassert from 'rollup-plugin-unassert';
import { defineConfig } from 'vite';

// Using js/ts compatibility from https://github.com/vitejs/vite/issues/3040

/*
  - Build failure, trying `npm run build --max-old-space-size`
    - export NODE_OPTIONS=--max-old-space-size=32768
    - Maybe we should... ditch loading all the data? (remove references for the collections tests?)
 */

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  resolve: {
    alias: [
      {
        find: /^(.*)\.js$/,
        replacement: '$1',
      },
    ],
  },

  // Because of https://github.com/vitejs/vite/issues/12434?
  optimizeDeps: {
    exclude: ['phet-lib', 'tesseract.js', 'culori', 'pako'],
    entries: [],
  },

  plugins: [
    // Work around paper.js stuff
    modify({
      find: 'self = self || window.self;',
      replace: '',
    }),
    modify({
      find: 'var window = self.window,',
      replace: '',
    }),
    modify({
      find: 'document = self.document;',
      replace: 'var document = self.document;',
    }),

    // Work around a Display.ts issue where we alias self and THEN try to access window
    modify({
      find: /const self = this;\s*\(/gm,
      replace: 'const _self = this;\n(',
    }),
    modify({
      find: 'self._requestAnimationFrameID = window.requestAnimationFrame( step, self._domElement );',
      replace: '_self._requestAnimationFrameID = self.requestAnimationFrame( step, _self._domElement );',
    }),
    modify({
      find: 'self.updateDisplay();',
      replace: '_self.updateDisplay();',
    }),

    // Redirect window to self
    modify({
      find: /([^.a-zA-Z0-9_])window(\.|\?\.|\[)/g,
      replace: (match, prefix, suffix) => `${prefix}self${suffix}`,
    }),

    // Standalone window to self
    modify({
      find: /(\s+)window(\s+)/g,
      replace: (match, prefix, suffix) => `${prefix}self${suffix}`,
    }),
    modify({
      find: /\(\s*window\s*\)/g,
      replace: '(self)',
    }),
    modify({
      find: /\(\s*window\s*,/g,
      replace: '(self,',
    }),
    modify({
      find: /\(\s*!window\s*\)/g,
      replace: '(!self)',
    }),
    modify({
      find: /in window;/g,
      replace: 'in self;',
    }),
  ],

  build: {
    rollupOptions: {
      input: {
        index: '/index.html',
        play: '/play.html',
        'rule-explorer': '/rule-explorer.html',
        rule: '/rule.html',
        'scan-test': '/scan-test.html',
        'solver-fuzz': '/solver-fuzz.html',
        'discover-rules': '/discover-rules.html',
        'rules-test': '/rules-test.html',
        'rule-image': '/rule-image.html',
        'curated-rules': '/curated-rules.html',
        'filtered-rules': '/filtered-rules.html',
        'formal-concept-analysis': '/formal-concept-analysis.html',
        'pattern-boards': '/pattern-boards.html',
        hooks: '/hooks.html',
        'test/model-tests': '/test/model-tests.html',
        'test/correctness-tests': '/test/correctness-tests.html',
      },
      plugins: [
        unassert({
          // include: [ '**/**.js', '**/**.ts' ]
        }),

        // TODO: why are these extra ones needed? This is a wreck

        // Redirect window to self
        modify({
          find: /([^.a-zA-Z0-9_])window(\.|\?\.|\[)/g,
          replace: (match, prefix, suffix) => `${prefix}self${suffix}`,
        }),

        // Standalone window to self
        modify({
          find: /(\s+)window(\s+)/g,
          replace: (match, prefix, suffix) => `${prefix}self${suffix}`,
        }),
        modify({
          find: /\(\s*window\s*\)/g,
          replace: '(self)',
        }),
        modify({
          find: /\(\s*window\s*,/g,
          replace: '(self,',
        }),
        modify({
          find: /\(\s*!window\s*\)/g,
          replace: '(!self)',
        }),
        modify({
          find: /in window;/g,
          replace: 'in self;',
        }),
      ],
    },
  },
});
