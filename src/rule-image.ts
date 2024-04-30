import { AlignBox, Display, GridBox, Node, Rectangle, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { squareEdgeHighlanderOnlyImplied1RuleSets } from './model/pattern/data/squareEdgeHighlanderOnlyImplied1RuleSets.ts';

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

  const showRuleSet = ( ruleSet: PatternBoardRuleSet ) => {
    addPaddedNode( new GridBox( {
      xSpacing: 40,
      ySpacing: 20,
      // xAlign: 'origin',
      // yAlign: 'origin',
      autoColumns: ruleSet.rules.length < 9 ? 1 : Math.floor( 0.5 * Math.sqrt( ruleSet.rules.length ) ),
      children: ruleSet.rules.map( rule => new PatternRuleNode( rule, ruleSet.mapping ) )
    } ) );
  };

  // showRuleSet( squareOnlyEdgeGeneration1RuleSets[ 0 ] );
  // showRuleSet( squareOnlyEdgeGeneration3RuleSets[ 0 ] );
  // showRuleSet( squareOnlyEdgeGeneration0RuleSets[ 0 ] );
  // showRuleSet( squareOnlyEdgeGeneration3RuleSets[ 0 ] );

  // showRuleSet( squareOnlyImpliedEdgeGeneration0RuleSets[ 0 ] );
  // showRuleSet( squareOnlyImpliedEdgeGeneration1RuleSets[ 1 ] );
  // showRuleSet( squareOnlyImpliedEdgeGeneration2RuleSets[ 4 ] );
  // showRuleSet( squareOnlyImpliedEdgeGeneration3RuleSets[ 1 ] );

  // showRuleSet( squareImpliedColorGeneration1RuleSets[ 1 ] );

  // showRuleSet( basicSectorImpliedRuleSets[ 8 ] );
  // showRuleSet( basicSectorImpliedRuleSets[ 8 ] );

  // TODO OMG!!!
  // showRuleSet( squareOnlyImpliedSectorGeneration0RuleSets[ 0 ] );

  // showRuleSet( squareOnlyImpliedSectorGeneration1RuleSets[ 0 ] );

  // showRuleSet( highlanderSquareOnlyImpliedEdgeGeneration0RuleSets[ 0 ] );
  // showRuleSet( squareImpliedColorGeneration1RuleSets[ 0 ] );
  // showRuleSet( squareOnlyImpliedEdgeGeneration2RuleSets[ 0 ] );
  // showRuleSet( basicSectorImpliedRuleSets[ 3 ] );
  // showRuleSet( generalImpliedEdgeGeneration0RuleSets[ 0 ] );

  // showRuleSet( generalImpliedSectorGeneration0RuleSets[ 2 ] );
  // showRuleSet( squareEdgeOnlyImplied3RuleSets[ 5 ] );
  // showRuleSet( squareOnlyImpliedEdgeGeneration3RuleSets[ 11 ] );

  // console.log( basicSectorImpliedRuleSets[ 13 ].rules[ 0 ].isIsomorphicTo( basicSectorImpliedRuleSets[ 13 ].rules[ 1 ] ) );
  // console.log( basicSectorImpliedRuleSets[ 13 ].rules[ 0 ].isRedundant( basicSectorImpliedRuleSets[ 13 ].rules[ 1 ].getEmbeddedRules( getEmbeddings( basicSectorImpliedRuleSets[ 13 ].patternBoard, basicSectorImpliedRuleSets[ 13 ].patternBoard ) ) ) );
  // debugger;
  // const embeddings = getEmbeddings( basicSectorImpliedRuleSets[ 13 ].patternBoard, basicSectorImpliedRuleSets[ 13 ].patternBoard );
  // const embeddedRules = basicSectorImpliedRuleSets[ 13 ].rules[ 1 ].getEmbeddedRules( embeddings );
  // console.log( basicSectorImpliedRuleSets[ 13 ].rules[ 0 ].isRedundant( embeddedRules ) );
  // console.log( basicSectorImpliedRuleSets[ 13 ].rules[ 0 ].isIsomorphicTo( basicSectorImpliedRuleSets[ 13 ].rules[ 1 ] ) );

  // showRuleSet( PatternBoardRuleSet.deserialize( JSON.parse( `{"patternBoard":"[0,4,\\"faces\\",[[0,1,2,3]]]","mapping":"[[[9,9],[10,9],[10,10],[9,10]],[[0,1],[1,2],[2,3],[0,3]],[[[9,9],[10,9],[10,10]],[[10,9],[10,10],[9,10]],[[10,10],[9,10],[9,9]],[[9,10],[9,9],[10,9]]],[[[9,9],[10,9],[10,10],[9,10]],[[9,9],[10,9],[9.5,8.75]],[[10,9],[10,10],[10.25,9.5]],[[10,10],[9,10],[9.5,10.25]],[[9,9],[9,10],[8.75,9.5]]]]","rules":[{"input":{"faceValues":[{"face":0,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[4]},"output":{"faceValues":[{"face":0,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"blackEdges":[0,1,3],"redEdges":[2,4,5]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[5]},"output":{"faceValues":[{"face":0,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"blackEdges":[0,1,3],"redEdges":[2,4,5]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[6,7]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[0,1,2,3,6,7]}}]}` ) ) );
  // showRuleSet( PatternBoardRuleSet.deserialize( JSON.parse( `{"patternBoard":"[0,4,\\"faces\\",[[0,1,2,3]]]","mapping":"[[[9,9],[10,9],[10,10],[9,10]],[[0,1],[1,2],[2,3],[0,3]],[[[9,9],[10,9],[10,10]],[[10,9],[10,10],[9,10]],[[10,10],[9,10],[9,9]],[[9,10],[9,9],[10,9]]],[[[9,9],[10,9],[10,10],[9,10]],[[9,9],[10,9],[9.5,8.75]],[[10,9],[10,10],[10.25,9.5]],[[10,10],[9,10],[9.5,10.25]],[[9,9],[9,10],[8.75,9.5]]]]","rules":[{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[4,5]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[0,1,2,3,4,5]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[4,6]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null}],"redEdges":[0,1,2,3,4,6]}}]}` ) ) );
  showRuleSet( squareEdgeHighlanderOnlyImplied1RuleSets[ 1 ] );

  console.log( JSON.stringify( squareEdgeHighlanderOnlyImplied1RuleSets[ 1 ].rules[ 0 ].serialize() ) );

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
