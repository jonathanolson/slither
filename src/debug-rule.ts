import { AlignBox, Display, HBox, Node, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
import { FeatureSet } from './model/pattern/feature/FeatureSet.ts';
import { standardSquareBoardGenerations } from './model/pattern/patternBoards.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import { getSolutionImpliedRules } from './model/pattern/generation/getSolutionImpliedRules.ts';
import { basicEdgeRuleSets } from './model/pattern/data/basicEdgeRuleSets.ts';
import { deprecatedSquareEdgeGeneration1RuleSets } from './model/pattern/data/deprecatedSquareEdgeGeneration1RuleSets.ts';

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

const container = new VBox( {
  x: 10,
  y: 10,
  align: 'left'
} );
scene.addChild( container );

const addPaddedNode = ( node: Node ) => {
  container.addChild( new AlignBox( node, { margin: 5 } ) );
};

// TODO: omg, just add a single serialize and deserialize method.
const addRule = ( serializedInput: string, serializedOutput: string ) => {

  // const patternBoardDescriptor = deserializePatternBoardDescriptor( JSON.parse( patternBoardDescriptorString ) );
  // const patternBoard = new BasePatternBoard( patternBoardDescriptor );

  // TODO: omg
  const patternBoard = deprecatedSquareEdgeGeneration1RuleSets[ 1 ].patternBoard;
  const mapping = deprecatedSquareEdgeGeneration1RuleSets[ 1 ].mapping;

  // '{"faceValues":[{"face":1,"value":1}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,3,5,6,7],"secondaryFaces":[],"sameColorPaths":[[0,4],[0,5],[0,6],[2]],"oppositeColorPaths":[]}]}'
  // TODO: add a 'debug-rule' page? And move things out into a directory
  const ruleSets = [
    new PatternBoardRuleSet( patternBoard, mapping, [
      new PatternRule(
        patternBoard,
        FeatureSet.deserialize( JSON.parse( serializedInput ), patternBoard ),
        FeatureSet.deserialize( JSON.parse( serializedOutput ), patternBoard )
      )
    ] )
  ];

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
};

// @ts-expect-error
window.addRule = addRule;

addRule(
  '{"faceValues":[{"face":0,"value":2}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,1],"secondaryFaces":[],"sameColorPaths":[[0]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[2],"secondaryFaces":[4],"sameColorPaths":[],"oppositeColorPaths":[[1,3]]}]}',
  '{"faceValues":[{"face":0,"value":2}],"faceColorDualFeatures":[{"type":"face-color-dual","primaryFaces":[0,1],"secondaryFaces":[],"sameColorPaths":[[0]],"oppositeColorPaths":[]},{"type":"face-color-dual","primaryFaces":[3,2],"secondaryFaces":[4],"sameColorPaths":[[2,1]],"oppositeColorPaths":[[2,3]]}]}'
);
addRule(
  "{\"faceValues\":[{\"face\":1,\"value\":1}],\"faceColorDualFeatures\":[{\"type\":\"face-color-dual\",\"primaryFaces\":[0,3,5,6,7],\"secondaryFaces\":[],\"sameColorPaths\":[[0,4],[0,5],[0,6],[2]],\"oppositeColorPaths\":[]}]}",
  "{\"faceValues\":[{\"face\":1,\"value\":1}],\"faceColorDualFeatures\":[{\"type\":\"face-color-dual\",\"primaryFaces\":[2],\"secondaryFaces\":[4],\"sameColorPaths\":[],\"oppositeColorPaths\":[[1,3]]},{\"type\":\"face-color-dual\",\"primaryFaces\":[6,7,5,3,1,0],\"secondaryFaces\":[],\"sameColorPaths\":[[5],[4],[0],[6],[2]],\"oppositeColorPaths\":[]}]}",
);

const squarePatternBoard = standardSquareBoardGenerations[ 0 ][ 0 ];

const rules = getSolutionImpliedRules( squarePatternBoard, {
  vertexOrderLimit: 4,
  prefilterRules: [
    ...basicEdgeRuleSets.flatMap( ruleSet => ruleSet.rules ),
  ],
  includeFaceValueZero: true
} );

rules.forEach( rule => {
  addPaddedNode( new PatternRuleNode( rule, planarPatternMaps.get( squarePatternBoard )! ) );
} );

// const featureSet = FeatureSet.emptyWithVertexOrderLimit( squarePatternBoard, 4 );
// featureSet.addFaceValue( squarePatternBoard.faces[ 0 ], 2 );
// // featureSet.addFaceValue( squarePatternBoard.faces[ 1 ], 2 );
//
// const impliedRules = SolutionSet.getImpliedRules( featureSet, true, false, false );
//
// // console.log( impliedRules[ 0 ].isIsomorphicTo( impliedRules[ 3 ] ) );
//
// const filteredRules = filterAndSortRules( impliedRules );
//
// // console.log( filteredRules[ 0 ].isIsomorphicTo( filteredRules[ 3 ] ) );
//
// filteredRules.forEach( rule => {
//   addPaddedNode( new PatternRuleNode( rule, planarPatternMaps.get( squarePatternBoard )! ) );
// } );

if ( scene.bounds.isValid() ) {
  display.setWidthHeight(
    Math.ceil( scene.right + 10 ),
    Math.ceil( scene.bottom + 10 )
  );
  display.updateDisplay();
}