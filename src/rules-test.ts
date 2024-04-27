import { AlignBox, Display, Node, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { basicPatternBoards, edgePatternBoard, standardSquareBoardGenerations } from './model/pattern/patternBoards.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import { BasePatternBoard } from './model/pattern/BasePatternBoard.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { PlanarMappedPatternBoardNode } from './view/pattern/PlanarMappedPatternBoardNode.ts';

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

  // const ruleSets = PatternBoardRuleSet.createChained( vertexNonExitPatternBoards, vertexNonExitPatternBoards.map( patternBoard => patternBoardMappings.get( patternBoard )! ), [], {
  //   solveEdges: false,
  //   solveFaceColors: true
  // } );

  const ruleSets = [ PatternBoardRuleSet.createEnumerated( edgePatternBoard, planarPatternMaps.get( edgePatternBoard )!, [], {
    solveEdges: true,
    solveFaceColors: true
  } ) ];

  const rules = ruleSets.flatMap( ruleSet => ruleSet.rules );

  for ( const ruleSet of ruleSets ) {
    console.log( JSON.stringify( ruleSet.serialize() ) );
  }

  addPaddedNode( new VBox( {
    spacing: 10,
    children: rules.map( rule => {
      // TODO: omg, associate boards with planar pattern maps
      const planarPatternMap = planarPatternMaps.get( rule.patternBoard as BasePatternBoard )!;

      return new PatternRuleNode( rule, planarPatternMap );
    } )
  } ) );

  // Sector initial chained
  // PatternBoardRuleSet.createImpliedChained( basicPatternBoards, [], {
  //   solveEdges: true,
  //   solveSectors: true
  // } ).forEach( ruleSet => {
  //   console.log( JSON.stringify( ruleSet.serialize() ) );
  // } );

  const testBoard = standardSquareBoardGenerations[ 4 ][ 7 ];
  addPaddedNode( new PlanarMappedPatternBoardNode( {
    patternBoard: testBoard,
    planarPatternMap: planarPatternMaps.get( testBoard )!,
  }, ) );


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
