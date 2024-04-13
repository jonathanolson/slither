import { AlignBox, Display, Node, Rectangle, VBox } from 'phet-lib/scenery';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
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


  // console.log( 'vertex' );
  // console.log( PatternRule.getRules( vertexExit4TwoOppositeSectorsPatternBoard ) );
  console.log( 'square' );
  const squareRules = _.sortBy( PatternRule.getRules( squarePatternBoard ), rule => rule.getInputDifficultyScoreA() );
  console.log( squareRules );


  // TODO: use a better way for given the "score" setup
  const solveRuleScores = _.uniq( squareRules.map( rule => rule.getInputDifficultyScoreA() ) );
  const embeddedRulesLessThanScoreMap = new Map<number, PatternRule[]>( solveRuleScores.map( size => [ size, [] ] ) );

  const squareEmbeddings = getEmbeddings( squarePatternBoard, squarePatternBoard );
  for ( const rule of squareRules ) {
    const embeddedRules = squareEmbeddings.map( embedding => rule.embedded( squarePatternBoard, embedding ) ).filter( rule => rule !== null ) as PatternRule[];
    const score = rule.getInputDifficultyScoreA();

    for ( const otherScore of solveRuleScores ) {
      if ( score < otherScore ) {
        embeddedRulesLessThanScoreMap.get( otherScore )!.push( ...embeddedRules );
      }
    }
  }

  const filteredSquareRules = squareRules.filter( rule => !rule.isRedundant( embeddedRulesLessThanScoreMap.get( rule.getInputDifficultyScoreA() )! ) );
  console.log( filteredSquareRules );

  // TODO: OH NO, we can't prune isomorphic how we are doing it, because we need to SKIP FEATURES LAST?

  // TODO: 3-black-edge pattern... not showing up?

  // TODO: OMG also avoid the double-logic-solver

  addRuleNodes( filteredSquareRules, squarePatternBoard.planarPatternMap );
  addPaddedNode( new Rectangle( 0, 0, 100, 100, { fill: 'red' } ) );
  addRuleNodes( squareRules, squarePatternBoard.planarPatternMap );

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
