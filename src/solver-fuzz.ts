import { Display, Node } from 'phet-lib/scenery';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { HexagonalBoard } from './model/board/hex/HexagonalBoard.ts';
import { generateFaceAdditive } from './model/generator/generateFaceAdditive.ts';
import { greedyFaceMinimize } from './model/generator/greedyFaceMinimize.ts';
import { BasicPuzzle } from './model/puzzle/BasicPuzzle.ts';
import PuzzleNode from './view/puzzle/PuzzleNode.ts';
import { sleep } from './util/sleep.ts';
import { BooleanProperty } from 'phet-lib/axon';
import { finalStateSolve, standardSolverFactory } from './model/solver/autoSolver.ts';
import { CompleteValidator } from './model/data/combined/CompleteValidator.ts';
import EdgeState from './model/data/edge-state/EdgeState.ts';
import { simpleRegionIsSolved } from './model/data/simple-region/TSimpleRegionData.ts';
import _ from './workarounds/_.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import { PolygonalBoard } from './model/board/core/TiledBoard.ts';
import { PolygonGenerator, polygonGenerators } from './view/GenerateNode.ts';
import { AnnotationNode } from './view/AnnotationNode.ts';

// Load with `http://localhost:5173/solver-fuzz.html?debugger`

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

const getPolygonalBoard = ( generator: PolygonGenerator ) => {
  const polygons = generator.generate( generator.defaultParameterValues );

  return new PolygonalBoard( polygons, generator.scale ?? 1 );
};

const boards = [
  new SquareBoard( 10, 10 ),
  // new SquareBoard( 15, 15 ),
  new HexagonalBoard( 4, 1, true ),

  ...polygonGenerators.map( getPolygonalBoard )
];

( async () => {
  let puzzleNode: PuzzleNode | null = null;

  const interrutedProperty = new BooleanProperty( false );

  while ( true ) {
    console.log( 'board loaded' );
    const board = boards[ Math.floor( Math.random() * boards.length ) ];

    // TODO: omg, cleanup here, it is a wreck with naming

    const definedPuzzle = await generateFaceAdditive( board, interrutedProperty );
    const minimizedPuzzle = await greedyFaceMinimize( definedPuzzle, () => true, interrutedProperty );

    const solvedPuzzle = minimizedPuzzle;

    const solvedState = solvedPuzzle.cleanState.clone();
    solvedPuzzle.blackEdges.forEach( edge => solvedState.setEdgeState( edge, EdgeState.BLACK ) );
    finalStateSolve( board, solvedState );

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
      display.updateDisplay(); // NOTE: this MIGHT look for overkill, but keeps things looking correct
    };

    let count = 0;
    while ( !simpleRegionIsSolved( state ) ) {
      puzzleNode.clearAnnotationNodes();

      if ( count++ > 100000 ) {
        throw new Error( 'Solver iteration limit exceeded? Looped?' );
      }

      const stateCopy = state.clone();
      const solverCopy = solver.clone( stateCopy );

      const action = solver.nextAction();
      if ( action ) {
        console.log( action );
        const validator = new CompleteValidator( board, state, solvedState );
        puzzleNode.addAnnotationNode( new AnnotationNode( action.annotation ) );
        updateView();
        await sleep( 0 );
        try {
          action.apply( validator );
        }
        catch ( e ) {
          console.error( e );
          debugger;
          const actionCopy = solverCopy.nextAction();
          if ( actionCopy ) {
            actionCopy.apply( validator );
          }
        }
        action.apply( state );
      }
      // If it doesn't pick up on anything, give it a hint so we can test more things
      else if ( !simpleRegionIsSolved( state ) ) {
        // Ensure a fresh solver doesn't give us anything new, otherwise we have a bug in "dirty" detection code.
        const freshSolver = standardSolverFactory( board, state, true );
        const freshSolverAction = freshSolver.nextAction();
        if ( freshSolverAction ) {
          puzzleNode.addAnnotationNode( new AnnotationNode( freshSolverAction.annotation ) );
          updateView();
          await sleep( 0 );
          throw new Error( 'Fresh solver should not have any actions' );
        }
        freshSolver.dispose();

        const edge = _.find( _.shuffle( board.edges ), edge => state.getEdgeState( edge ) === EdgeState.WHITE )!;
        assertEnabled() && assert( edge );
        state.setEdgeState( edge, solvedState.getEdgeState( edge ) );

        console.log( 'setting white edge to red/black', edge );

        if ( !solver.dirty ) {
          throw new Error( 'Solver should be dirty after setting edge state' );
        }
      }
      updateView();
      await sleep( 0 );
    }

    if ( !simpleRegionIsSolved( state ) ) {
      throw new Error( 'Solver did not solve the puzzle' );
    }
  }
} )();
