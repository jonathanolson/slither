import { AlignBox, Display, Node, VBox } from 'phet-lib/scenery';
import { edgePatternBoard, standardSquareBoardGenerations, standardTriangularBoardGenerations, vertexNonExitPatternBoards } from './model/pattern/patternBoards.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import { PlanarMappedPatternBoardNode } from './view/pattern/PlanarMappedPatternBoardNode.ts';
import { PatternBoardSolver } from './model/pattern/PatternBoardSolver.ts';
import { getStructuralFeatures } from './model/pattern/feature/getStructuralFeatures.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { Solver } from './model/logic/minisat/core/Solver.ts';

// import squareOnlyEdge from '../data-sequences/square-only-edge.json';
// import squareOnlyEdgeUnrestricted from '../data-sequences/square-only-edge-unrestricted.json';
// import squareOnlyColor from '../data-sequences/square-only-color.json';
// import squareOnlyColorUnrestricted from '../data-sequences/square-only-color-unrestricted.json';
// import { BinaryRuleCollection } from './model/pattern/BinaryRuleCollection.ts';

// @ts-expect-error
window.assertions.enableAssert();

// const squareOnlyEdgeCollection = BinaryRuleCollection.deserialize( squareOnlyEdge.collection );
// const squareOnlyEdgeUnrestrictedCollection = BinaryRuleCollection.deserialize( squareOnlyEdgeUnrestricted.collection );
// const squareOnlyColorCollection = BinaryRuleCollection.deserialize( squareOnlyColor.collection );
// const squareOnlyColorUnrestrictedCollection = BinaryRuleCollection.deserialize( squareOnlyColorUnrestricted.collection );
//
// const a = squareOnlyEdgeCollection.withCollectionNonredundant( squareOnlyEdgeUnrestrictedCollection );
// const b = squareOnlyColorCollection.withCollectionNonredundant( squareOnlyColorUnrestrictedCollection );

debugger;

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

  const solver = new Solver();

  const clauses = [
    [ 1, 2, 3 ],
    [ -1, -2 ],
    [ -1, -3 ],
    [ -2, -3 ],
    [ 4, 5, 6 ],
    [ -4, -5 ],
    [ -4, -6 ],
    [ -5, -6 ],
    [ 7, 8, 9 ],
    [ -7, -8 ],
    [ -7, -9 ],
    [ -8, -9 ],
    [ 10, 11, 12 ],
    [ -10, -11 ],
    [ -10, -12 ],
    [ -11, -12 ],
    [ -1, -7 ],
    [ -2, -8 ],
    [ -3, -9 ],
    [ -4, -10 ],
    [ -5, -11 ],
    [ -6, -12 ],
    [ -4, -7 ],
    [ -5, -8 ],
    [ -6, -9 ],
    [ -7, -10 ],
    [ -8, -11 ],
    [ -9, -12 ],
    [ -1, -4 ],
    [ -2, -5 ],
    [ -3, -6 ],
  ];

  clauses.forEach( clauseArray => solver.addClauseFromArray( clauseArray ) );

//   Solver.parse_DIMACS_main( `c  quinn.cnf
// c
// p cnf 16 18
//   1    2  0
//  -2   -4  0
//   3    4  0
//  -4   -5  0
//   5   -6  0
//   6   -7  0
//   6    7  0
//   7  -16  0
//   8   -9  0
//  -8  -14  0
//   9   10  0
//   9  -10  0
// -10  -11  0
//  10   12  0
//  11   12  0
//  13   14  0
//  14  -15  0
//  15   16  0`, solver );
  const isSat = solver.solve();
  console.log( 'isSat', isSat );
  console.log( solver.model.data );

  debugger;

  if ( scene.bounds.isValid() ) {
    display.setWidthHeight(
      Math.ceil( scene.right + 10 ),
      Math.ceil( scene.bottom + 10 )
    );
    display.updateDisplay();
  }

} )();
