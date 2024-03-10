import { Display, Node } from 'phet-lib/scenery';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { HexagonalBoard } from './model/board/hex/HexagonalBoard.ts';
import { generateFaceAdditive } from './model/generator/generateFaceAdditive.ts';
import { greedyFaceMinimize } from './model/generator/greedyFaceMinimize.ts';
import { BasicPuzzle } from './model/puzzle/BasicPuzzle.ts';
import PuzzleNode from './view/puzzle/PuzzleNode.ts';
import { sleep } from './util/sleep.ts';
import { BooleanProperty } from 'phet-lib/axon';
import { safeSolve, standardSolverFactory } from './model/solver/autoSolver.ts';
import { CompleteDataValidator } from './model/data/combined/CompleteDataValidator.ts';
import EdgeState from './model/data/edge/EdgeState.ts';

// @ts-expect-error
window.assertions.enableAssert();

const scene = new Node();

const rootNode = new Node( {
  renderer: 'svg',
  children: [ scene ]
} );

const display = new Display( rootNode, {
  allowWebGL: true,
  allowBackingScaleAntialiasing: true,
  allowSceneOverflow: false
} );
document.body.appendChild( display.domElement );

display.setWidthHeight( window.innerWidth, window.innerHeight );

console.log( 'test' );

const boards = [
  new SquareBoard( 10, 10 ),
  // new SquareBoard( 20, 20 ),
  new HexagonalBoard( 4, 1, true )
];

( async () => {
  let puzzleNode: Node | null = null;

  const interrutedProperty = new BooleanProperty( false );

  while ( true ) {
    console.log( 'board loaded' );
    const board = boards[ Math.floor( Math.random() * boards.length ) ];

    // TODO: omg, cleanup here, it is a wreck with naming

    const definedPuzzle = await generateFaceAdditive( board, interrutedProperty );
    const minimizedPuzzle = await greedyFaceMinimize( definedPuzzle, interrutedProperty );

    const solvedPuzzle = minimizedPuzzle;

    const solvedState = solvedPuzzle.cleanState.clone();
    solvedPuzzle.blackEdges.forEach( edge => solvedState.setEdgeState( edge, EdgeState.BLACK ) );
    safeSolve( board, solvedState );

    const unsolvedPuzzle = BasicPuzzle.fromSolvedPuzzle( solvedPuzzle );

    if ( puzzleNode ) {
      puzzleNode.dispose();
    }

    puzzleNode = new PuzzleNode( unsolvedPuzzle, {
      scale: 30,
      left: 20,
      top: 20
    } );
    scene.addChild( puzzleNode );
    display.updateDisplay();

    await sleep( 50 );

    const state = unsolvedPuzzle.stateProperty.value.clone();
    const solver = standardSolverFactory( board, state, true );

    const updateView = () => {
      unsolvedPuzzle.stateProperty.value = state.clone();
    };

    let count = 0;
    while ( solver.dirty ) {
      if ( count++ > 100000 ) {
        throw new Error( 'Solver iteration limit exceeded? Looped?' );
      }
      const action = solver.nextAction();
      if ( action ) {
        console.log( action );
        const validator = new CompleteDataValidator( board, solvedState );
        action.apply( validator );
        action.apply( state );
      }
      updateView();
      await sleep( 0 );
    }
  }
} )();
