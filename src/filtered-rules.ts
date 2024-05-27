import { AlignBox, Display, FireListener, Node, Rectangle, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { copyToClipboard } from './util/copyToClipboard.ts';
import { PatternRule } from './model/pattern/pattern-rule/PatternRule.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import { TPatternBoard } from './model/pattern/pattern-board/TPatternBoard.ts';
import { curatedRules } from './model/pattern/data/curatedRules.ts';
import { getEmbeddings } from './model/pattern/embedding/getEmbeddings.ts';

const DO_FILTER = true;

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

  let rules: PatternRule[] = [];

  // const ruleSet = PatternBoardRuleSet.deserialize( JSON.parse( `{"patternBoard":"[1,0,\\"non-exit-vertex\\",4]","mapping":"[[[0,0]],[[0,[1,0]],[0,[6.123233995736766e-17,1]],[0,[-1,1.2246467991473532e-16]],[0,[-1.8369701987210297e-16,-1]]],[[[6.123233995736766e-17,1],[0,0],[1,0]],[[-1,1.2246467991473532e-16],[0,0],[6.123233995736766e-17,1]],[[-1.8369701987210297e-16,-1],[0,0],[-1,1.2246467991473532e-16]],[[1,0],[0,0],[-1.8369701987210297e-16,-1]]],[[[6.123233995736766e-17,1],[0,0],[1,0]],[[-1,1.2246467991473532e-16],[0,0],[6.123233995736766e-17,1]],[[-1.8369701987210297e-16,-1],[0,0],[-1,1.2246467991473532e-16]],[[1,0],[0,0],[-1.8369701987210297e-16,-1]]]]","rules":[{"input":{"blackEdges":[0]},"output":{"blackEdges":[0],"sectorsNotTwo":[1,2]}},{"input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[0,3]],"oppositeColorPaths":[]}]},"output":{"sectorsNotOne":[1,3],"sectorsNotTwo":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,2],"secondaryFaces":[],"sameColorPaths":[[0,3]],"oppositeColorPaths":[]}]}},{"input":{"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,3]]}]},"output":{"sectorsOnlyOne":[1,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0],"secondaryFaces":[2],"sameColorPaths":[],"oppositeColorPaths":[[0,3]]}]}},{"input":{"sectorsNotOne":[0]},"output":{"sectorsNotOne":[0,2],"sectorsNotTwo":[1,3],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1,3],"secondaryFaces":[],"sameColorPaths":[[1,0]],"oppositeColorPaths":[]}]}},{"input":{"sectorsNotZero":[0]},"output":{"sectorsNotZero":[0],"sectorsNotTwo":[2]}},{"input":{"sectorsNotTwo":[2],"sectorsOnlyOne":[0]},"output":{"sectorsOnlyOne":[0,2],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[1],"secondaryFaces":[3],"sameColorPaths":[],"oppositeColorPaths":[[1,0]]}]}},{"input":{"redEdges":[0],"sectorsNotTwo":[1,2]},"output":{"redEdges":[0,2]}},{"input":{"sectorsNotZero":[2],"sectorsNotTwo":[0,1]},"output":{"sectorsNotZero":[2,3],"sectorsNotTwo":[0,1]}}]}` ) );
  // const ruleSet = generalAllHighlanderImplied0RuleSets[ 3 ];
  // rules.push( ...ruleSet.rules );
  // TODO: add back in rules

  const embeddedRuleMap = new Map<TPatternBoard, PatternRule[]>;

  const getEmbeddedRules = ( patternBoard: TPatternBoard ) => {
    if ( !embeddedRuleMap.has( patternBoard ) ) {
      embeddedRuleMap.set( patternBoard, curatedRules.flatMap( curatedRule => curatedRule.getEmbeddedRules( getEmbeddings( curatedRule.patternBoard, patternBoard ) ) ) );
    }
    return embeddedRuleMap.get( patternBoard )!;
  };

  if ( DO_FILTER ) {
    rules = rules.filter( rule => !rule.isRedundant( getEmbeddedRules( rule.patternBoard ) ) );
  }

  addPaddedNode( new VBox( {
    spacing: 20,
    children: rules.map( rule => {
      const node = new PatternRuleNode( rule, planarPatternMaps.get( rule.patternBoard )! );

      node.cursor = 'pointer';

      node.addInputListener( new FireListener( {
        fire: () => {
          copyToClipboard( JSON.stringify( rule.serialize() ) );
          console.log( JSON.stringify( rule.serialize() ) );
        }
      } ) );

      return node;
    } )
  } ) );

  display.setWidthHeight(
    Math.ceil( scene.right + 10 ),
    Math.ceil( scene.bottom + 10 )
  );

  display.initializeEvents();

  display.updateOnRequestAnimationFrame( dt => {

  } );

} )();
