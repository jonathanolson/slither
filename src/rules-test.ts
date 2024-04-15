import { AlignBox, Display, HBox, Node, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { basicEdgeRuleSets, cairoEdgeGeneration0RuleSets, hexEdgeGeneration0RuleSets, squareEdgeGeneration0RuleSets, squareEdgeGeneration1RuleSets, squareEdgeGeneration2RuleSets, triangularEdgeGeneration0RuleSets } from './model/pattern/rules.ts';

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

  // TODO: omg, associate boards with planar pattern maps

  // const addRuleNodes = ( rules: PatternRule[], planarPatternMap: TPlanarPatternMap ) => {
  //   addPaddedNode( new VBox( {
  //     spacing: 10,
  //     children: rules.map( rule => new PatternRuleNode( rule, planarPatternMap ) )
  //   } ) );
  // };

  // const basicGenerations = basicPatternBoards.map( patternBoard => [ patternBoard ] );
  // const faceGenerations = [
  //   ...FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 2 )
  //   // ...FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 3 )
  // ];
  //
  // faceGenerations.forEach( generation => generation.forEach( board => {
  //   patternBoardMappings.set( board, board.planarPatternMap );
  // } ) );
  //
  // console.log( patternBoardMappings.get( faceGenerations[ 1 ][ 0 ] ) );
  //
  // const testGenerations = [
  //   ...basicGenerations,
  //   ...faceGenerations
  // ];
  //
  // console.log( testGenerations );
  //
  // const rules = PatternRule.getRulesForGenerations( testGenerations );
  //
  // addPaddedNode( new VBox( {
  //   spacing: 10,
  //   children: rules.map( rule => {
  //     const planarPatternMap = patternBoardMappings.get( rule.patternBoard as BasePatternBoard )!;
  //
  //     return new PatternRuleNode( rule, planarPatternMap );
  //   } )
  // } ) );

  const ruleSets = [
    ...basicEdgeRuleSets,

    ...triangularEdgeGeneration0RuleSets,
    ...squareEdgeGeneration0RuleSets,
    ...cairoEdgeGeneration0RuleSets,
    ...hexEdgeGeneration0RuleSets,

    ...squareEdgeGeneration1RuleSets,
    ...squareEdgeGeneration2RuleSets,
  ];
  addPaddedNode( new HBox( {
    spacing: 20,
    align: 'top',
    children: ruleSets.map( ruleSet => {
      return new VBox( {
        spacing: 10,
        children: ruleSet.rules.map( rule => new PatternRuleNode( rule, ruleSet.mapping ) )
      } );
    } )
  } ) );

  // const squareBoardGenerations = FacesPatternBoard.getFirstNGenerations( new SquareBoard( 20, 20 ), 5 );
  //
  //
  // // console.log( 'vertex' );
  // // console.log( PatternRule.getRules( vertexExit4TwoOppositeSectorsPatternBoard ) );
  //
  // const squarePatternBoard = squareBoardGenerations[ 0 ][ 0 ];
  //
  // const newFilteredSquareRules = PatternRule.filterAndSortRules( PatternRule.getSolutionEnumeratedRules( squarePatternBoard ), [] );
  // console.log( newFilteredSquareRules );
  //
  // addPaddedNode( new HBox( {
  //   spacing: 50,
  //   align: 'top',
  //   children: [
  //     new VBox( {
  //       spacing: 10,
  //       children: newFilteredSquareRules.map( rule => new PatternRuleNode( rule, squarePatternBoard.planarPatternMap ) )
  //     } )
  //   ]
  // } ) );
  //
  // const diagonalPatternBoard = squareBoardGenerations[ 1 ][ 0 ];
  // const rawDiagonalRules = PatternRule.getSolutionEnumeratedRules( diagonalPatternBoard, {
  //   prefilterRules: newFilteredSquareRules
  // } );
  // console.log( `rawDiagonalRules.length=${rawDiagonalRules.length}` );
  //
  // const filteredDiagonalRules = PatternRule.filterAndSortRules( rawDiagonalRules, newFilteredSquareRules );
  // console.log( filteredDiagonalRules );
  // addRuleNodes( filteredDiagonalRules, diagonalPatternBoard.planarPatternMap );
  //
  // const getSolutionCount = ( patternBoard: TPatternBoard ) => {
  //   return PatternBoardSolver.getSolutions( patternBoard, [] ).length;
  // };
  //
  // console.log( 'square', getSolutionCount( squarePatternBoard ) );
  // console.log( 'diagonal', getSolutionCount( squareBoardGenerations[ 1 ][ 0 ] ) );
  // console.log( '3rd gen', getSolutionCount( squareBoardGenerations[ 2 ][ 0 ] ) );
  // console.log( '4th gen', getSolutionCount( squareBoardGenerations[ 3 ][ 0 ] ) );
  // console.log( '5th gen', getSolutionCount( squareBoardGenerations[ 4 ][ 0 ] ) );




  // TODO: OMG also avoid the double-logic-solver

  // addPaddedNode( new Rectangle( 0, 0, 100, 100, { fill: 'red' } ) );
  // addRuleNodes( squareRules, squarePatternBoard.planarPatternMap );

  // console.log( 'diagonal' );
  // console.log( PatternRule.getRules( diagonalPatternBoard ) );

  if ( scene.bounds.isValid() ) {
    display.setWidthHeight(
      Math.ceil( scene.right + 10 ),
      Math.ceil( scene.bottom + 10 )
    );
    display.updateDisplay();
  }

} )();
