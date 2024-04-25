import { Vector2 } from 'phet-lib/dot';
import { AttributeSet } from './model/pattern/formal-concept/AttributeSet.ts';
import { FormalContext } from './model/pattern/formal-concept/FormalContext.ts';
import { PatternBoardSolver } from './model/pattern/PatternBoardSolver.ts';
import { standardSquareBoardGenerations } from './model/pattern/patternBoards.ts';
import { SolutionSet } from './model/pattern/SolutionSet.ts';
import { FeatureSet } from './model/pattern/feature/FeatureSet.ts';

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

const squarePatternBoard = standardSquareBoardGenerations[ 1 ][ 0 ];
const squareSolutions = PatternBoardSolver.getSolutions( squarePatternBoard, [] );
console.log( squareSolutions );

const squareFormalContext = new FormalContext( 2 * squarePatternBoard.edges.length, squareSolutions.map( solution => {
  return AttributeSet.fromCallback( 2 * squarePatternBoard.edges.length, i => {
    const edgeIndex = Math.floor( i / 2 );
    const isStart = i % 2 === 0;

    return solution.includes( squarePatternBoard.edges[ edgeIndex ] ) === isStart;
  } );
} ) );

console.log( squareFormalContext.toString() );

// console.log( squareFormalContext.getIntents().map( intent => intent.toString() ) );
console.log( squareFormalContext.getIntents().length );

// const data = squareFormalContext.getIntentsAndImplicationsParallelizable();
// console.log( data.intents.length, data.implications.length );

const data2 = squareFormalContext.getIntentsAndImplications();
console.log( data2.intents.length, data2.implications.length );

// console.log( data2.implications.map( implication => implication.toString() ) );

console.log( SolutionSet.getImpliedRules( FeatureSet.emptyWithVertexOrderLimit( squarePatternBoard, 4 ), true, false, false ).map( rule => rule.toCanonicalString() ) );
