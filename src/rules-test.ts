import { AlignBox, Display, Node, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { basicPatternBoards } from './model/pattern/patternBoards.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
import { patternBoardMappings } from './model/pattern/patternBoardMappings.ts';
import { BasePatternBoard } from './model/pattern/BasePatternBoard.ts';

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

  const basicGenerations = basicPatternBoards.map( patternBoard => [ patternBoard ] );

  const rules = PatternRule.getRulesForGenerations( basicGenerations, {
    solveEdges: false,
    solveFaceColors: true
  } );

  addPaddedNode( new VBox( {
    spacing: 10,
    children: rules.map( rule => {
      // TODO: omg, associate boards with planar pattern maps
      const planarPatternMap = patternBoardMappings.get( rule.patternBoard as BasePatternBoard )!;

      return new PatternRuleNode( rule, planarPatternMap );
    } )
  } ) );



  // const getSolutionCount = ( patternBoard: TPatternBoard ) => {
  //   return PatternBoardSolver.getSolutions( patternBoard, [] ).length;
  // };
  //
  // console.log( 'square', getSolutionCount( squarePatternBoard ) );
  // console.log( 'diagonal', getSolutionCount( squareBoardGenerations[ 1 ][ 0 ] ) );
  // console.log( '3rd gen', getSolutionCount( squareBoardGenerations[ 2 ][ 0 ] ) );
  // console.log( '4th gen', getSolutionCount( squareBoardGenerations[ 3 ][ 0 ] ) );
  // console.log( '5th gen', getSolutionCount( squareBoardGenerations[ 4 ][ 0 ] ) );

  if ( scene.bounds.isValid() ) {
    display.setWidthHeight(
      Math.ceil( scene.right + 10 ),
      Math.ceil( scene.bottom + 10 )
    );
    display.updateDisplay();
  }

} )();
