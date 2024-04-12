import { Display, Node } from 'phet-lib/scenery';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
import { vertexExit4TwoOppositeSectorsPatternBoard } from './model/pattern/patternBoards.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';

// Load with `http://localhost:5173/rules-test.html?debugger`

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

( async () => {

  const squareBoardGenerations = FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 5 );

  const squarePatternBoard = squareBoardGenerations[ 0 ][ 0 ];
  // const diagonalPatternBoard = squareBoardGenerations[ 1 ][ 0 ];

  console.log( 'vertex' );
  console.log( PatternRule.getRules( vertexExit4TwoOppositeSectorsPatternBoard ) );
  console.log( 'square' );
  console.log( PatternRule.getRules( squarePatternBoard ) );
  // console.log( 'diagonal' );
  // console.log( PatternRule.getRules( diagonalPatternBoard ) );

  if ( scene.bounds.isValid() ) {
    display.setWidthHeight(
      Math.ceil( scene.right + 10 ),
      Math.ceil( scene.bottom + 10 )
    );
    display.updateDisplay();
  }

} )();
