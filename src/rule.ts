import { AlignBox, Display, HBox, Node, Rectangle, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import { PatternBoardSolver } from './model/pattern/PatternBoardSolver.ts';
import { PatternNode } from './view/pattern/PatternNode.ts';
import { FeatureSet } from './model/pattern/feature/FeatureSet.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';

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

  const background = new Rectangle( {
    fill: '#333'
  } );
  scene.addChild( background );

  const container = new VBox( {
    x: 10,
    y: 10,
    align: 'left'
  } );
  scene.addChild( container );

  const addPaddedNode = ( node: Node ) => {
    container.addChild( new AlignBox( node, { margin: 5 } ) );
  };

  // const rule = squareEdgeHighlanderOnlyImplied1RuleSets[ 1 ].rules[ 0 ];
  // const rule = PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-1","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"blackEdges":[5,6]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"blackEdges":[5,6],"redEdges":[0]}}` ) );
  const rule = PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,12]},"output":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,4,7],"redEdges":[8,5,6,12]}}` ) );

  const patternBoard = rule.patternBoard;
  const planarPatternMap = planarPatternMaps.get( patternBoard )!;
  assertEnabled() && assert( planarPatternMap );

  // Rule
  addPaddedNode( new PatternRuleNode( rule, planarPatternMap ) );

  {
    // Solutions
    const solutions = PatternBoardSolver.getSolutions( patternBoard, rule.inputFeatureSet.getFeaturesArray() );
    const solutionFeatureSets = solutions.map( solution => FeatureSet.fromSolution( patternBoard, solution ) );

    const compatibleFeatureSets: FeatureSet[] = [];
    const incompatibleFeatureSets: FeatureSet[] = [];
    for ( const solutionFeatureSet of solutionFeatureSets ) {
      if ( rule.outputFeatureSet.isCompatibleWith( solutionFeatureSet ) ) {
        compatibleFeatureSets.push( solutionFeatureSet );
      }
      else {
        // TODO: these should only exist for highlander rules
        incompatibleFeatureSets.push( solutionFeatureSet );
      }
    }

    container.addChild( new AlignBox( new HBox( {
      spacing: 10,
      children: compatibleFeatureSets.map( solutionFeatureSet => new PatternNode( patternBoard, solutionFeatureSet, planarPatternMap ) )
    } ), { margin: 5 } ) );

    container.addChild( new AlignBox( new HBox( {
      spacing: 10,
      children: incompatibleFeatureSets.map( solutionFeatureSet => new PatternNode( patternBoard, solutionFeatureSet, planarPatternMap ) )
    } ), { margin: 5 } ) );
  }

  console.log( rule.serialize() );



  if ( scene.bounds.isValid() ) {
    background.rectWidth = Math.ceil( scene.right + 10 );
    background.rectHeight = Math.ceil( scene.bottom + 10 );

    display.setWidthHeight(
      Math.ceil( scene.right + 10 ),
      Math.ceil( scene.bottom + 10 )
    );
    display.updateDisplay();

    // Serialize it to XHTML that can be used in foreignObject (HTML can't be)

    const xhtml = new window.XMLSerializer().serializeToString( display.getRootBackbone().blocks[ 0 ].domElement );

    console.log( xhtml );
  }

} )();
