import { AlignBox, Display, GridBox, Node, Rectangle, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { PatternRule } from './model/pattern/pattern-rule/PatternRule.ts';
import { planarPatternMaps } from './model/pattern/pattern-board/planar-map/planarPatternMaps.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import squareOnlyEdgeCollection from '../data-collections/snapshot-square-only-edge.json';
import { BinaryRuleCollection, SerializedBinaryRuleCollection } from './model/pattern/collection/BinaryRuleCollection.ts';

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

  // const aSequence = BinaryRuleSequence.deserialize( aaa as SerializedBinaryRuleSequence );
  // const bSequence = BinaryRuleSequence.deserialize( bbb as SerializedBinaryRuleSequence );
  //
  // const collection = aSequence.collection.withCollectionNonredundant( bSequence.collection );
  // const collection = aSequence.collection;

  const showRules = ( rules: PatternRule[] ) => {
    addPaddedNode( new GridBox( {
      xSpacing: 40,
      ySpacing: 20,
      // xAlign: 'origin',
      // yAlign: 'origin',
      autoColumns: rules.length < 9 ? 1 : Math.floor( 0.5 * Math.sqrt( rules.length ) ),
      children: rules.map( rule => {
        console.log( JSON.stringify( rule.serialize() ) );
        console.log( rule.getBinaryIdentifier() );

        const planarPatternMap = planarPatternMaps.get( rule.patternBoard )!;
        assertEnabled() && assert( planarPatternMap );
        return new PatternRuleNode( rule, planarPatternMap );
      } )
    } ) );
  };

  // const rules = BinaryRuleSequence.deserialize( serializedGeneralEdgeUnrestrictedSequence as SerializedBinaryRuleSequence ).collection.getRules().filter( ( rule, i ) => i % 100 === 0 );
  // const rules = collection.getRules().slice( aSequence.collection.size - 10, aSequence.collection.size + 50 );
  // const rules = collection.getRules().filter( ( rule, i ) => i % 100 === 0 );
  // const rules = collection.getRules().slice( 0, 300 );

  // const rules = [
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,10,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,7],"redEdges":[8,10,12,0,3,5,6]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"redEdges":[10]},"output":{"redEdges":[10],"sectorsNotOne":[1]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"redEdges":[12]},"output":{"redEdges":[12],"sectorsNotOne":[7]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[10]},"output":{"faceValues":[{"face":0,"value":2}],"redEdges":[10],"sectorsNotOne":[3,1],"sectorsOnlyOne":[2,0]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":1,"value":2}],"redEdges":[12]},"output":{"faceValues":[{"face":1,"value":2}],"redEdges":[12],"sectorsNotOne":[5,7],"sectorsOnlyOne":[4,6]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,12],"sectorsNotOne":[3,5,7],"sectorsOnlyOne":[4,6]},"output":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,4,7],"redEdges":[8,12,5,6],"sectorsNotTwo":[1]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":0,"value":2},{"face":4,"value":null},{"face":5,"value":null},{"face":2,"value":null},{"face":3,"value":null}],"redEdges":[8,10],"sectorsNotOne":[5,3,1],"sectorsOnlyOne":[2,0]},"output":{"faceValues":[{"face":0,"value":2},{"face":4,"value":null},{"face":5,"value":null},{"face":2,"value":null},{"face":3,"value":null}],"blackEdges":[6,5,2,1],"redEdges":[8,10,3,0],"sectorsNotTwo":[7]},"highlander":true}` ) ),
  //
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"vertex-2-exit-one","input":{"redEdges":[2]},"output":{"redEdges":[2],"sectorsNotOne":[0]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"vertex-2-exit-one","input":{"redEdges":[2]},"output":{"redEdges":[2],"sectorsNotOne":[0]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[4]},"output":{"faceValues":[{"face":0,"value":2}],"redEdges":[4],"sectorsNotOne":[1,3],"sectorsOnlyOne":[0,2]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-0-0","input":{"faceValues":[{"face":0,"value":2}],"redEdges":[4]},"output":{"faceValues":[{"face":0,"value":2}],"redEdges":[4],"sectorsNotOne":[1,3],"sectorsOnlyOne":[0,2]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,12],"sectorsNotOne":[3,5,7],"sectorsOnlyOne":[4,6]},"output":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,4,7],"redEdges":[8,12,5,6],"sectorsNotTwo":[1]},"highlander":true}` ) ),
  //   PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,12],"sectorsNotOne":[3,5,7],"sectorsOnlyOne":[4,6]},"output":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,4,7],"redEdges":[8,12,5,6],"sectorsNotTwo":[1]},"highlander":true}` ) ),
  // ];

  const rules = BinaryRuleCollection.deserialize( squareOnlyEdgeCollection as SerializedBinaryRuleCollection ).getRules().filter( ( rule, i ) => i % 1000 === 0 );

  showRules( rules );


  // const ruleSets = [
  //   ...basicEdgeRuleSets,
  //
  //   // ...triangularEdgeGeneration0RuleSets,
  //   ...squareEdgeGeneration0RuleSets,
  //   // ...cairoEdgeGeneration0RuleSets,
  //   // ...hexEdgeGeneration0RuleSets,
  //
  //   // ...triangularEdgeGeneration1RuleSets,
  //   ...squareEdgeGeneration1RuleSets,
  //   // ...snubSquareEdgeGeneration1RuleSets,
  //   // ...cairoEdgeGeneration1RuleSets,
  //   // ...hexEdgeGeneration1RuleSets,
  //
  //   // ...triangularEdgeGeneration2RuleSets,
  //   ...squareEdgeGeneration2RuleSets,
  //   // ...rhombilleEdgeGeneration2RuleSets,
  // ];

  // const ruleSets = [
  //   ...basicEdgeRuleSets,
  //
  //   dualEdgeColorRuleSet,
  //   basicColorOnly4RuleSet,
  //
  //   ...squareColorGeneration0RuleSets,
  //   ...squareOnlyEdgeGeneration0RuleSets,
  //
  //   ...squareColorGeneration1RuleSets,
  //   ...squareOnlyEdgeGeneration1RuleSets,
  //
  //   ...squareOnlyEdgeGeneration2RuleSets,
  // ];

  // const ruleSets = [
  //   // ...basicEdgeRuleSets,
  //
  //   ...hexEdgeGeneration0RuleSets,
  //   ...hexEdgeGeneration1RuleSets,
  // ];


  // addPaddedNode( new HBox( {
  //   spacing: 20,
  //   align: 'top',
  //   children: ruleSets.map( ruleSet => {
  //     return new VBox( {
  //       spacing: 10,
  //       // TODO: omg, associate boards with planar pattern maps
  //       children: ruleSet.rules.map( rule => new PatternRuleNode( rule, ruleSet.mapping ) )
  //     } );
  //   } )
  // } ) );


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
