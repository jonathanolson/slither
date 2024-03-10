import { Display, Node } from 'phet-lib/scenery';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { HexagonalBoard } from './model/board/hex/HexagonalBoard.ts';
import { generateFaceAdditive } from './model/generator/generateFaceAdditive.ts';
import { greedyFaceMinimize } from './model/generator/greedyFaceMinimize.ts';
import { BasicPuzzle } from './model/puzzle/BasicPuzzle.ts';
import PuzzleNode from './view/puzzle/PuzzleNode.ts';
import { sleep } from './util/sleep.ts';
import { BooleanProperty } from 'phet-lib/axon';

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

    const definedPuzzle = await generateFaceAdditive( board, interrutedProperty );
    const minimizedPuzzle = await greedyFaceMinimize( definedPuzzle, interrutedProperty );

    const solvedPuzzle = minimizedPuzzle;
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
  }
} )();
