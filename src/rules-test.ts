import { AlignBox, Display, Node, VBox } from 'phet-lib/scenery';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { TPlanarPatternMap } from './model/pattern/TPlanarPatternMap.ts';
import _ from './workarounds/_.ts';

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

  const squarePatternBoard = squareBoardGenerations[ 0 ][ 0 ];
  const diagonalPatternBoard = squareBoardGenerations[ 1 ][ 0 ];

  // console.log( 'vertex' );
  // console.log( PatternRule.getRules( vertexExit4TwoOppositeSectorsPatternBoard ) );

  const filteredSquareRules = PatternRule.filterAndSortRules( PatternRule.getRules( squarePatternBoard ), [] );
  console.log( filteredSquareRules );
  addRuleNodes( filteredSquareRules, squarePatternBoard.planarPatternMap );

  const filteredDiagonalRules = PatternRule.filterAndSortRules( PatternRule.getRules( diagonalPatternBoard ), filteredSquareRules );
  console.log( filteredDiagonalRules );
  addRuleNodes( filteredDiagonalRules, diagonalPatternBoard.planarPatternMap );

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
