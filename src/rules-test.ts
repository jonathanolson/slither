import { AlignBox, Display, Node, VBox } from 'phet-lib/scenery';
import { edgePatternBoard, standardSquareBoardGenerations, standardTriangularBoardGenerations, vertexNonExitPatternBoards } from './model/pattern/patternBoards.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import { PlanarMappedPatternBoardNode } from './view/pattern/PlanarMappedPatternBoardNode.ts';
import { PatternBoardSolver } from './model/pattern/PatternBoardSolver.ts';
import { getStructuralFeatures } from './model/pattern/feature/getStructuralFeatures.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';

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

  const testBoard = standardSquareBoardGenerations[ 0 ][ 0 ];
  addPaddedNode( new PlanarMappedPatternBoardNode( {
    patternBoard: testBoard,
    planarPatternMap: planarPatternMaps.get( testBoard )!,
  }, {
    labels: true
  } ) );

  {
    const patternBoard = standardTriangularBoardGenerations[ 0 ][ 0 ];

    console.log( PatternBoardSolver.getSolutions( patternBoard, [] ) );

    console.log( getStructuralFeatures( patternBoard ) );

    // debugger;
  }

  const allChained = PatternBoardRuleSet.createImpliedChained( [ edgePatternBoard, ...vertexNonExitPatternBoards ], [], {
    solveEdges: true,
    solveFaceColors: true,
    solveSectors: true,
    highlander: false,
  } );

  allChained.forEach( ruleSet => {
    console.log( JSON.stringify( ruleSet.serialize() ) );
  } );

  // const generations = FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 5 );
  //
  // const patternBoard = generations[ 1 ][ 1 ];
  // const ruleSet = PatternBoardRuleSet.create( patternBoard, patternBoard.planarPatternMap, [
  //   ...basicColorRuleSets,
  //   ...squareColorGeneration0RuleSets,
  // ], {
  //   solveEdges: false,
  //   solveFaceColors: true
  // } );
  // console.log( JSON.stringify( ruleSet.serialize() ) );


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
