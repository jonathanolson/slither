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
      children: ruleSet.rules.map( rule => {
        console.log( JSON.stringify( rule.serialize() ) );
        return new PatternRuleNode( rule, ruleSet.mapping );
      } )
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
  // showRuleSet( squareEdgeHighlanderOnlyImplied1RuleSets[ 0 ] );
  showRuleSet( PatternBoardRuleSet.deserialize( JSON.parse( `{"patternBoard":"[0,7,\\"faces\\",[[0,1,2,3],[4,5,0,6]]]","mapping":"[[[9,9],[10,9],[10,10],[9,10],[8,8],[9,8],[8,9]],[[0,1],[1,2],[2,3],[0,3],[4,5],[0,5],[0,6],[4,6]],[[[9,9],[10,9],[10,10]],[[10,9],[10,10],[9,10]],[[10,10],[9,10],[9,9]],[[9,10],[9,9],[10,9]],[[8,8],[9,8],[9,9]],[[9,8],[9,9],[8,9]],[[9,9],[8,9],[8,8]],[[8,9],[8,8],[9,8]]],[[[9,9],[10,9],[10,10],[9,10]],[[8,8],[9,8],[9,9],[8,9]],[[9,9],[10,9],[9.5,8.75]],[[10,9],[10,10],[10.25,9.5]],[[10,10],[9,10],[9.5,10.25]],[[9,9],[9,10],[8.75,9.5]],[[8,8],[9,8],[8.5,7.75]],[[9,9],[9,8],[9.25,8.5]],[[9,9],[8,9],[8.5,9.25]],[[8,8],[8,9],[7.75,8.5]]]]","rules":[{"input":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,12]},"output":{"faceValues":[{"face":1,"value":2},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,4,7],"redEdges":[8,5,6,12]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[5],"redEdges":[8,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[5],"redEdges":[8,6,12]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[5],"redEdges":[8,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,5],"redEdges":[8,6,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[6],"redEdges":[8,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[6],"redEdges":[8,4,5,13]}},{"input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,13]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,1,2,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,0,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[3,7],"redEdges":[8,0,13]}},{"input":{"faceValues":[{"face":0,"value":1},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,12]},"output":{"faceValues":[{"face":0,"value":1},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,1,2,12]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,7],"redEdges":[8,13]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,7],"redEdges":[8,2,13]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,10,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,5,6,10,12]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,10,13]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,4,5,6,10,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,0,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[3,4,7],"redEdges":[8,0,12]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,4,7],"redEdges":[8,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,4,7],"redEdges":[8,2,12]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,6,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,4,7],"redEdges":[8,5,6,12]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,4,5,6,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,3,7],"redEdges":[8,4,5,6,13]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"redEdges":[8,10,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":2},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,7],"redEdges":[8,0,3,5,6,10,12]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,7],"redEdges":[8,6,9,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,4,5,7],"redEdges":[8,6,9,12,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,4,7],"redEdges":[8,5,9,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,4,6,7],"redEdges":[8,5,9,12,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,7],"redEdges":[8,6,10,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,5,7],"redEdges":[8,6,10,12,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,7],"redEdges":[8,4,5,9,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,6,7],"redEdges":[8,4,5,9,13,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,6,9,10,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,5,7],"redEdges":[8,6,9,10,12,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,6,9,11,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,5,7],"redEdges":[8,6,9,11,12,13]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,3,9,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,1,2],"redEdges":[8,3,9,10,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,3,9,13]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[0,1,2],"redEdges":[8,3,9,10,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,7],"redEdges":[8,5,10,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,6,7],"redEdges":[8,5,10,12,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,7],"redEdges":[8,4,5,10,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,6,7],"redEdges":[8,4,5,10,13,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,9,10,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,6,7],"redEdges":[8,5,9,10,12,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,9,11,12]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,6,7],"redEdges":[8,5,9,11,12,14]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,9,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,6,7],"redEdges":[8,5,9,12,14]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2],"redEdges":[8,0,10,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,3],"redEdges":[8,0,10,11,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,9,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,3],"redEdges":[8,0,1,9,11,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,9,13]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2,3],"redEdges":[8,0,1,9,11,13]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,4,5,9,10,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[6,7],"redEdges":[8,4,5,9,10,13,14]}},{"input":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,4,5,9,11,13]},"output":{"faceValues":[{"face":1,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[6,7],"redEdges":[8,4,5,9,11,13,14]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,6,10,12]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,4,7],"redEdges":[8,0,3,5,6,10,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,5,6,9,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[4,7],"redEdges":[8,0,1,3,5,6,9,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2],"redEdges":[8,0,3,10,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2],"redEdges":[8,0,3,5,6,10,12]}},{"input":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[7],"redEdges":[8,4,5,6,10,13]},"output":{"faceValues":[{"face":0,"value":2},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[1,2,7],"redEdges":[8,0,3,4,5,6,10,13]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,3,9,12]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,3,5,6,9,12]}},{"input":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,3,9,13]},"output":{"faceValues":[{"face":0,"value":null},{"face":1,"value":null},{"face":2,"value":null},{"face":3,"value":null},{"face":4,"value":null},{"face":5,"value":null},{"face":6,"value":null},{"face":7,"value":null},{"face":8,"value":null},{"face":9,"value":null}],"blackEdges":[2],"redEdges":[8,0,1,3,4,5,6,9,13]}}]}` ) ) );

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
