import { AlignBox, Display, HBox, Node, Rectangle, Text, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import { PatternBoardSolver } from './model/pattern/PatternBoardSolver.ts';
import { PatternNode } from './view/pattern/PatternNode.ts';
import { FeatureSet } from './model/pattern/feature/FeatureSet.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { FaceFeature } from './model/pattern/feature/FaceFeature.ts';
import { BinaryFeatureMap } from './model/pattern/generation/BinaryFeatureMap.ts';
import { RichSolution } from './model/pattern/generation/RichSolution.ts';
import { HighlanderPruner } from './model/pattern/formal-concept/HighlanderPruner.ts';
import { arrayRemove } from 'phet-lib/phet-core';
import _ from './workarounds/_.ts';
import { TPatternEdge } from './model/pattern/pattern-board/TPatternEdge.ts';
import { IncompatibleFeatureError } from './model/pattern/feature/IncompatibleFeatureError.ts';

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
  // const rule = PatternRule.deserialize( JSON.parse( `{"patternBoard":"square-1-0","input":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,12]},"output":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,4,7],"redEdges":[8,5,6,12]}}` ) );
  const rule = PatternBoardRuleSet.deserialize( JSON.parse( `{"patternBoard":"[0,7,\\"faces\\",[[0,1,2,3],[4,5,0,6]]]","mapping":"[[[9,9],[10,9],[10,10],[9,10],[8,8],[9,8],[8,9]],[[0,1],[1,2],[2,3],[0,3],[4,5],[0,5],[0,6],[4,6]],[[[9,9],[10,9],[10,10]],[[10,9],[10,10],[9,10]],[[10,10],[9,10],[9,9]],[[9,10],[9,9],[10,9]],[[8,8],[9,8],[9,9]],[[9,8],[9,9],[8,9]],[[9,9],[8,9],[8,8]],[[8,9],[8,8],[9,8]]],[[[9,9],[10,9],[10,10],[9,10]],[[8,8],[9,8],[9,9],[8,9]],[[9,9],[10,9],[9.5,8.75]],[[10,9],[10,10],[10.25,9.5]],[[10,10],[9,10],[9.5,10.25]],[[9,9],[9,10],[8.75,9.5]],[[8,8],[9,8],[8.5,7.75]],[[9,9],[9,8],[9.25,8.5]],[[9,9],[8,9],[8.5,9.25]],[[8,8],[8,9],[7.75,8.5]]]]","rules":[{"input":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,12]},"output":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,4,7],"redEdges":[8,5,6,12]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[5],"redEdges":[8,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[5],"redEdges":[8,6,12]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[5],"redEdges":[8,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,5],"redEdges":[8,6,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[6],"redEdges":[8,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[6],"redEdges":[8,4,5,13]}},{"input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,13]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,1,2,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,0,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[3,7],"redEdges":[8,0,13]}},{"input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,12]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,1,2,12]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,7],"redEdges":[8,13]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,7],"redEdges":[8,2,13]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,10,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,5,6,10,12]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,10,13]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,4,5,6,10,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,0,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[3,4,7],"redEdges":[8,0,12]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,4,7],"redEdges":[8,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,4,7],"redEdges":[8,2,12]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,6,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,4,7],"redEdges":[8,5,6,12]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,4,5,6,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,7],"redEdges":[8,4,5,6,13]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,10,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,7],"redEdges":[8,0,3,5,6,10,12]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,7],"redEdges":[8,6,9,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,4,5,7],"redEdges":[8,6,9,12,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,4,7],"redEdges":[8,5,9,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,4,6,7],"redEdges":[8,5,9,12,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,7],"redEdges":[8,6,10,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,5,7],"redEdges":[8,6,10,12,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,7],"redEdges":[8,4,5,9,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,6,7],"redEdges":[8,4,5,9,13,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,6,9,10,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,5,7],"redEdges":[8,6,9,10,12,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,6,9,11,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,5,7],"redEdges":[8,6,9,11,12,13]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,3,9,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,1,2],"redEdges":[8,3,9,10,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,3,9,13]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,1,2],"redEdges":[8,3,9,10,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,7],"redEdges":[8,5,10,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,6,7],"redEdges":[8,5,10,12,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,7],"redEdges":[8,4,5,10,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,6,7],"redEdges":[8,4,5,10,13,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,9,10,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,6,7],"redEdges":[8,5,9,10,12,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,9,11,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,6,7],"redEdges":[8,5,9,11,12,14]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,9,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,6,7],"redEdges":[8,5,9,12,14]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2],"redEdges":[8,0,10,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,3],"redEdges":[8,0,10,11,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,9,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,3],"redEdges":[8,0,1,9,11,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,9,13]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,3],"redEdges":[8,0,1,9,11,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,4,5,9,10,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[6,7],"redEdges":[8,4,5,9,10,13,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,4,5,9,11,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[6,7],"redEdges":[8,4,5,9,11,13,14]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,6,10,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,7],"redEdges":[8,0,3,5,6,10,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,6,9,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,0,1,3,5,6,9,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2],"redEdges":[8,0,3,10,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2],"redEdges":[8,0,3,5,6,10,12]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,4,5,6,10,13]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,7],"redEdges":[8,0,3,4,5,6,10,13]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,3,9,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,3,5,6,9,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,3,9,13]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,3,4,5,6,9,13]}}],"highlander":true}` ) ).rules[ 4 ];

  const patternBoard = rule.patternBoard;
  const planarPatternMap = planarPatternMaps.get( patternBoard )!;
  assertEnabled() && assert( planarPatternMap );

  // Rule
  addPaddedNode( new PatternRuleNode( rule, planarPatternMap ) );

  // {
  //   const edgeClosure = getFeatureSetClosure( rule.inputFeatureSet, true, false, false, false );
  //   addPaddedNode( new PatternNode( patternBoard, edgeClosure!, planarPatternMap ) );
  // }
  //
  // if ( rule.highlander ) {
  //   const highlanderEdgeClosure = getFeatureSetClosure( rule.inputFeatureSet, true, false, false, true );
  //   addPaddedNode( new PatternNode( patternBoard, highlanderEdgeClosure!, planarPatternMap ) );
  // }

  const directSolutions = PatternBoardSolver.getSolutions( patternBoard, rule.inputFeatureSet.getFeaturesArray() );

  const solutionToDisplayFeatureSet = ( solution: TPatternEdge[] ): FeatureSet => {
    const featureSet = FeatureSet.empty( patternBoard );

    rule.inputFeatureSet.getFeaturesArray().forEach( inputFeature => {
      if ( inputFeature instanceof FaceFeature ) {
        featureSet.addFeature( inputFeature );
      }
    } );

    patternBoard.edges.forEach( edge => {
      if ( !edge.isExit ) {
        if ( solution.includes( edge ) ) {
          featureSet.addBlackEdge( edge );
        }
        else {
          featureSet.addRedEdge( edge );
        }
      }
    } );

    return featureSet;
  };

  if ( rule.highlander ) {
    const binaryFeatureMap = new BinaryFeatureMap( patternBoard, {
      solveEdges: true,
      solveSectors: false,
      solveFaceColors: false
    } );
    const widerSolutions = PatternBoardSolver.getSolutions( patternBoard, rule.inputFeatureSet.getHighlanderFeaturesArray() );
    const widerRichSolutions = widerSolutions.map( solution => new RichSolution( patternBoard, binaryFeatureMap, solution, true ) );

    const highlanderFilteredRichSolutions = HighlanderPruner.filterWithFeatureSet( widerRichSolutions, rule.inputFeatureSet );

    const highlanderFinalRichSolutions = highlanderFilteredRichSolutions.filter( richSolution => {
      return richSolution.isCompatibleWithFeatureSet( rule.inputFeatureSet );
    } );

    const filteredSolutions = directSolutions.slice();
    highlanderFinalRichSolutions.forEach( richSolution => {
      const solution = filteredSolutions.find( solution => {
        return solution.length === richSolution.solution.length && solution.every( edge => richSolution.solutionSet.has( edge ) );
      } )!;

      assertEnabled() && assert( solution );

      // TODO: performance (if it matters)
      arrayRemove( filteredSolutions, solution );
    } );

    const highlanderMap = new Map<string, RichSolution[]>;

    widerRichSolutions.forEach( richSolution => {
      // TODO: efficiency
      const key = HighlanderPruner.getHighlanderKeyWithFeatureSet( richSolution, rule.inputFeatureSet );
      if ( highlanderMap.has( key ) ) {
        highlanderMap.get( key )!.push( richSolution );
      }
      else {
        highlanderMap.set( key, [ richSolution ] );
      }
    } );

    const highlanderArrays = _.sortBy( [ ...highlanderMap.values() ], arr => -arr.length );
    const filteredHighlanderArrays = highlanderArrays.filter( arr => arr.length > 1 );
    const singleHighlanderSolutions = highlanderArrays.filter( arr => arr.length === 1 ).map( arr => arr[ 0 ] );

    const matchingSingleHighlanderSolutions: RichSolution[] = [];
    const nonMatchingSingleHighlanderSolutions: RichSolution[] = [];

    // TODO: improve, lazy
    singleHighlanderSolutions.forEach( solution => {
      const testFeatureSet = rule.inputFeatureSet.clone();

      try {
        // TODO: omg
        solution.solution.forEach( blackEdge => {
          testFeatureSet.addBlackEdge( blackEdge );
        } );

        patternBoard.edges.forEach( edge => {
          if ( !solution.solutionSet.has( edge ) ) {
            testFeatureSet.addRedEdge( edge );
          }
        } );

        matchingSingleHighlanderSolutions.push( solution );
      }
      catch ( e ) {
        if ( e instanceof IncompatibleFeatureError ) {
          nonMatchingSingleHighlanderSolutions.push( solution );
        }
        else {
          throw e;
        }
      }
    } );

    container.addChild( new AlignBox( new Text( 'Valid Solutions', { font: '16px Arial', fill: '#ccc' } ), { topMargin: 10 } ) );

    container.addChild( new AlignBox( new HBox( {
      spacing: 10,
      children: [
        ...matchingSingleHighlanderSolutions.map( solution => new PatternNode( patternBoard, solutionToDisplayFeatureSet( solution.solution ), planarPatternMap ) ),

      ]
    } ), { margin: 5 } ) );

    container.addChild( new AlignBox( new Text( 'Highlander Duplicates (Invalid)', { font: '16px Arial', fill: '#ccc' } ), { topMargin: 10 } ) );

    filteredHighlanderArrays.forEach( richSolutions => {
      container.addChild( new AlignBox( new HBox( {
        spacing: 10,
        children: [
          ...richSolutions.map( solution => new PatternNode( patternBoard, solutionToDisplayFeatureSet( solution.solution ), planarPatternMap ) ),

        ]
      } ), { margin: 5 } ) );
    } );

    // container.addChild( new AlignBox( new Text( 'Invalid Solutions', { font: '16px Arial', fill: '#ccc' } ) ) );
    //
    // container.addChild( new AlignBox( new HBox( {
    //   spacing: 10,
    //   children: [
    //     ...matchingSingleHighlanderSolutions.map( solution => new PatternNode( patternBoard, solutionToDisplayFeatureSet( solution.solution ), planarPatternMap ) ),
    //
    //   ]
    // } ), { margin: 5 } ) );

    //
    // container.addChild( new AlignBox( new HBox( {
    //   spacing: 10,
    //   children: widerSolutions.map( solution => new PatternNode( patternBoard, FeatureSet.fromSolution( patternBoard, solution ), planarPatternMap ) )
    // } ), { margin: 5 } ) );
    //


  }
  else {
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
