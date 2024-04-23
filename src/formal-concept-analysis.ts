import { Vector2 } from 'phet-lib/dot';
import { AttributeSet } from './model/pattern/formal-concept/AttributeSet.ts';
import { FormalContext } from './model/pattern/formal-concept/FormalContext.ts';

const vector = new Vector2( 0, 0 );
console.log( vector );
const attributeSet = AttributeSet.fromBinary( 3, 0b101n );

console.log( attributeSet.toString() );

// TODO: example closure from PatternBoardSolver.

const formalContext = new FormalContext( 3, [
  AttributeSet.fromBinary( 3, 0b001n ),
  AttributeSet.fromBinary( 3, 0b111n ),
  AttributeSet.fromBinary( 3, 0b011n ),
] );
console.log( formalContext.toString() );

let c: AttributeSet | null = AttributeSet.getEmpty( 3 );
while ( c ) {
  console.log( c.toString() );
  c = formalContext.getNextClosure( c );
}

// console.log( formalContext.getClosure( attributeSet ).toString() );

// @ts-expect-error
window.AttributeSet = AttributeSet;
// @ts-expect-error
window.FormalContext = FormalContext;


