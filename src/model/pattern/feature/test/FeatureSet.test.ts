import { standardSquareBoardGenerations } from '../../pattern-board/patternBoards.ts';
import QUnit from 'qunit';

import { Vector2 } from 'phet-lib/dot';

// TODO

QUnit.module('zero', () => {
  QUnit.test('two numbers', (assert) => {
    assert.equal(Vector2.ZERO.x, 0);
  });
});

console.log(standardSquareBoardGenerations[0][0]);
