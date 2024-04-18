import QUnit from 'qunit';
import { Vector2 } from 'phet-lib/dot';

QUnit.module( 'zero', () => {
  QUnit.test('two numbers', assert => {
    assert.equal( Vector2.ZERO.x, 0 );
  } );
} );
