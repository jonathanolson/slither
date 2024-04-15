import { AlignBox, Display, HBox, Node, VBox } from 'phet-lib/scenery';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { TPatternBoard } from './model/pattern/TPatternBoard.ts';
import { PatternBoardSolver } from './model/pattern/PatternBoardSolver.ts';
import { TPlanarPatternMap } from './model/pattern/TPlanarPatternMap.ts';

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

  const container = new VBox( {
    x: 10,
    y: 10,
    align: 'left'
  } );
  scene.addChild( container );

  const addPaddedNode = ( node: Node ) => {
    container.addChild( new AlignBox( node, { margin: 5 } ) );
  };

  // TODO: omg, associate boards with planar pattern maps
  const addRuleNodes = ( rules: PatternRule[], planarPatternMap: TPlanarPatternMap ) => {
    addPaddedNode( new VBox( {
      spacing: 10,
      children: rules.map( rule => new PatternRuleNode( rule, planarPatternMap ) )
    } ) );
  };

  const squareBoardGenerations = FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 5 );


  // console.log( 'vertex' );
  // console.log( PatternRule.getRules( vertexExit4TwoOppositeSectorsPatternBoard ) );

  const squarePatternBoard = squareBoardGenerations[ 0 ][ 0 ];

  const newFilteredSquareRules = PatternRule.filterAndSortRules( PatternRule.getSolutionEnumeratedRules( squarePatternBoard ), [] );
  console.log( newFilteredSquareRules );

  addPaddedNode( new HBox( {
    spacing: 50,
    align: 'top',
    children: [
      new VBox( {
        spacing: 10,
        children: newFilteredSquareRules.map( rule => new PatternRuleNode( rule, squarePatternBoard.planarPatternMap ) )
      } )
    ]
  } ) );

  const diagonalPatternBoard = squareBoardGenerations[ 1 ][ 0 ];
  const rawDiagonalRules = PatternRule.getSolutionEnumeratedRules( diagonalPatternBoard );
  console.log( `rawDiagonalRules.length=${rawDiagonalRules.length}` );

  // const filteredDiagonalRules = PatternRule.filterAndSortRules( PatternRule.getSolutionEnumeratedRules( diagonalPatternBoard ).slice( 40000, 43000 ), newFilteredSquareRules );
  // console.log( filteredDiagonalRules );
  // addRuleNodes( filteredDiagonalRules, diagonalPatternBoard.planarPatternMap );

  const getSolutionCount = ( patternBoard: TPatternBoard ) => {
    return PatternBoardSolver.getSolutions( patternBoard, [] ).length;
  };

  console.log( 'square', getSolutionCount( squarePatternBoard ) );
  console.log( 'diagonal', getSolutionCount( squareBoardGenerations[ 1 ][ 0 ] ) );
  console.log( '3rd gen', getSolutionCount( squareBoardGenerations[ 2 ][ 0 ] ) );
  console.log( '4th gen', getSolutionCount( squareBoardGenerations[ 3 ][ 0 ] ) );
  console.log( '5th gen', getSolutionCount( squareBoardGenerations[ 4 ][ 0 ] ) );

  // TODO: OMG also avoid the double-logic-solver

  // addPaddedNode( new Rectangle( 0, 0, 100, 100, { fill: 'red' } ) );
  // addRuleNodes( squareRules, squarePatternBoard.planarPatternMap );

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
