import { AlignBox, Display, HBox, Node, Rectangle, VBox } from 'phet-lib/scenery';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
import { vertexExit4TwoOppositeSectorsPatternBoard } from './model/pattern/patternBoards.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { TPlanarPatternMap } from './model/pattern/TPlanarPatternMap.ts';
import _ from './workarounds/_.ts';
import { getEmbeddings } from './model/pattern/getEmbeddings.ts';
import { FaceFeature } from './model/pattern/feature/FaceFeature.ts';
import { BlackEdgeFeature } from './model/pattern/feature/BlackEdgeFeature.ts';
import { RedEdgeFeature } from './model/pattern/feature/RedEdgeFeature.ts';
import { SectorOnlyOneFeature } from './model/pattern/feature/SectorOnlyOneFeature.ts';
import { SectorNotOneFeature } from './model/pattern/feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from './model/pattern/feature/SectorNotTwoFeature.ts';
import { SectorNotZeroFeature } from './model/pattern/feature/SectorNotZeroFeature.ts';
import { FaceColorDualFeature } from './model/pattern/feature/FaceColorDualFeature.ts';

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


  const getInputDifficultyScore = ( rule: PatternRule ) => {
    let score = 0;

    for ( const feature of rule.inputFeatureSet.getFeaturesArray() ) {
      if ( feature instanceof FaceFeature ) {
        score += 0.5;
      }
      else if ( feature instanceof BlackEdgeFeature ) {
        score += 1;
      }
      else if ( feature instanceof RedEdgeFeature ) {
        score += feature.edge.isExit ? 2.5 : 1.2;
      }
      else if ( feature instanceof SectorOnlyOneFeature ) {
        score += 3;
      }
      else if ( feature instanceof SectorNotOneFeature ) {
        score += 4;
      }
      else if ( feature instanceof SectorNotTwoFeature ) {
        score += 4.1;
      }
      else if ( feature instanceof SectorNotZeroFeature ) {
        score += 4.2;
      }
      else if ( feature instanceof FaceColorDualFeature ) {
        score += feature.allFaces.size - 1;
      }
    }

    return score;
  };


  // TODO: use a better way for given the "score" setup
  const solveRuleScores = _.uniq( squareRules.map( getInputDifficultyScore ) );
  const embeddedRulesLessThanScoreMap = new Map<number, PatternRule[]>( solveRuleScores.map( size => [ size, [] ] ) );

  const squareEmbeddings = getEmbeddings( squarePatternBoard, squarePatternBoard );
  for ( const rule of squareRules ) {
    const embeddedRules = squareEmbeddings.map( embedding => rule.embedded( squarePatternBoard, embedding ) ).filter( rule => rule !== null ) as PatternRule[];
    const score = getInputDifficultyScore( rule );

    for ( const otherScore of solveRuleScores ) {
      if ( score < otherScore ) {
        embeddedRulesLessThanScoreMap.get( otherScore )!.push( ...embeddedRules );
      }
    }
  }

  const filteredSquareRules = squareRules.filter( rule => !rule.isRedundant( embeddedRulesLessThanScoreMap.get( getInputDifficultyScore( rule ) )! ) );
  console.log( filteredSquareRules );

  // TODO: 3-black-edge pattern... not showing up?

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
