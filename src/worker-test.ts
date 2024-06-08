import { Vector2 } from 'phet-lib/dot';

// @ts-expect-error
if ( window.assertions && !( import.meta.env.PROD ) ) {
  // @ts-expect-error
  window.assertions.enableAssert();
}

console.log( 'angle', new Vector2( 1, 4 ).angle );
