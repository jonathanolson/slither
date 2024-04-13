import { AlignBox, Display, HBox, Node, VBox } from 'phet-lib/scenery';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
import { vertexExit4TwoOppositeSectorsPatternBoard } from './model/pattern/patternBoards.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { TPlanarPatternMap } from './model/pattern/TPlanarPatternMap.ts';
import _ from './workarounds/_.ts';
import { getEmbeddings } from './model/pattern/getEmbeddings.ts';

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
  // const diagonalPatternBoard = squareBoardGenerations[ 1 ][ 0 ];


  console.log( 'vertex' );
  console.log( PatternRule.getRules( vertexExit4TwoOppositeSectorsPatternBoard ) );
  console.log( 'square' );
  const squareRules = _.sortBy( PatternRule.getRules( squarePatternBoard ), rule => rule.inputFeatureSet.size );
  console.log( squareRules );
  // addRuleNodes( squareRules, squarePatternBoard.planarPatternMap );

  const solveRuleSizes = _.uniq( squareRules.map( rule => rule.inputFeatureSet.size ) );
  const embeddedRulesLessThanSizeMap = new Map<number, PatternRule[]>( solveRuleSizes.map( size => [ size, [] ] ) );

  const squareEmbeddings = getEmbeddings( squarePatternBoard, squarePatternBoard );
  for ( const rule of squareRules ) {
    const embeddedRules = squareEmbeddings.map( embedding => rule.embedded( squarePatternBoard, embedding ) ).filter( rule => rule !== null ) as PatternRule[];
    const size = rule.inputFeatureSet.size;

    for ( const otherSize of solveRuleSizes ) {
      if ( size < otherSize ) {
        embeddedRulesLessThanSizeMap.get( otherSize )!.push( ...embeddedRules );
      }
    }
  }

  // TODO: we are missing black-edge internal and red-edge exit to a vertex?!?

  const filteredSquareRules = squareRules.filter( rule => !rule.isRedundant( embeddedRulesLessThanSizeMap.get( rule.inputFeatureSet.size )! ) );
  console.log( filteredSquareRules );
  addRuleNodes( filteredSquareRules, squarePatternBoard.planarPatternMap );

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
