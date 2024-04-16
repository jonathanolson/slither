import { AlignBox, Display, HBox, Node, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { basicEdgeRuleSets, squareOnlyEdgeGeneration0RuleSets, squareOnlyEdgeGeneration1RuleSets, squareOnlyEdgeGeneration2RuleSets } from './model/pattern/rules.ts';

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

  // const squareOnlyEdgeGeneration0RuleSets = squareEdgeGeneration0RuleSets;
  // const squareOnlyEdgeGeneration1RuleSets = squareEdgeGeneration1RuleSets.map( ruleSet => {
  //   return ruleSet.filterCollapseWithVertexOrderLimit( 4, [
  //     ...basicEdgeRuleSets,
  //     ...squareOnlyEdgeGeneration0RuleSets,
  //   ] );
  // } );
  // const squareOnlyEdgeGeneration2RuleSets = squareEdgeGeneration2RuleSets.map( ruleSet => {
  //   return ruleSet.filterCollapseWithVertexOrderLimit( 4, [
  //     ...basicEdgeRuleSets,
  //     ...squareOnlyEdgeGeneration0RuleSets,
  //     ...squareOnlyEdgeGeneration1RuleSets,
  //   ] );
  // } );
  //
  // console.log( '0' );
  // squareOnlyEdgeGeneration0RuleSets.forEach( ruleSet => {
  //   console.log( JSON.stringify( ruleSet.serialize() ) );
  // } );
  //
  // console.log( '1' );
  // squareOnlyEdgeGeneration1RuleSets.forEach( ruleSet => {
  //   console.log( JSON.stringify( ruleSet.serialize() ) );
  // } );
  //
  // console.log( '2' );
  // squareOnlyEdgeGeneration2RuleSets.forEach( ruleSet => {
  //   console.log( JSON.stringify( ruleSet.serialize() ) );
  // } );
  //
  // const ruleSets = [
  //   // ...squareEdgeGeneration0RuleSets,
  //
  //   squareEdgeGeneration1RuleSets[ 0 ],
  //   squareOnlyEdgeGeneration1RuleSets[ 0 ],
  //
  //   squareEdgeGeneration2RuleSets[ 0 ],
  //   squareOnlyEdgeGeneration2RuleSets[ 0 ],
  // ];

  // const ruleSets = [
  //   new PatternBoardRuleSet( squareEdgeGeneration1RuleSets[ 0 ].patternBoard, squareEdgeGeneration1RuleSets[ 0 ].mapping, [
  //     new PatternRule(
  //       squareEdgeGeneration1RuleSets[ 0 ].patternBoard,
  //       FeatureSet.deserialize( JSON.parse( '{"faceValues":[{"face":0,"value":1},{"face":1,"value":2}],"redEdges":[1,2,12,8]}' ), squareEdgeGeneration1RuleSets[ 0 ].patternBoard ),
  //       FeatureSet.deserialize( JSON.parse( '{"faceValues":[{"face":0,"value":1},{"face":1,"value":2}],"blackEdges":[4,7],"redEdges":[1,2,12,5,6,8]}' ), squareEdgeGeneration1RuleSets[ 0 ].patternBoard )
  //     )
  //   ] )
  // ];


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

  const ruleSets = [
    ...basicEdgeRuleSets,

    ...squareOnlyEdgeGeneration0RuleSets,
    ...squareOnlyEdgeGeneration1RuleSets,
    ...squareOnlyEdgeGeneration2RuleSets,
  ];

  // const ruleSets = [
  //   // ...basicEdgeRuleSets,
  //
  //   ...hexEdgeGeneration0RuleSets,
  //   ...hexEdgeGeneration1RuleSets,
  // ];



  addPaddedNode( new HBox( {
    spacing: 20,
    align: 'top',
    children: ruleSets.map( ruleSet => {
      return new VBox( {
        spacing: 10,
        // TODO: omg, associate boards with planar pattern maps
        children: ruleSet.rules.map( rule => new PatternRuleNode( rule, ruleSet.mapping ) )
      } );
    } )
  } ) );


  if ( scene.bounds.isValid() ) {
    display.setWidthHeight(
      Math.ceil( scene.right + 10 ),
      Math.ceil( scene.bottom + 10 )
    );
    display.updateDisplay();
  }

} )();