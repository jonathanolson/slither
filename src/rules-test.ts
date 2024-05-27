import { AlignBox, Display, Node, VBox } from 'phet-lib/scenery';
import { edgePatternBoard, standardSquareBoardGenerations, standardTriangularBoardGenerations, vertexNonExitPatternBoards } from './model/pattern/pattern-board/patternBoards.ts';
import { planarPatternMaps } from './model/pattern/pattern-board/planar-map/planarPatternMaps.ts';
import { PlanarMappedPatternBoardNode } from './view/pattern/PlanarMappedPatternBoardNode.ts';
import { PatternBoardSolver } from './model/pattern/solve/PatternBoardSolver.ts';
import { getStructuralFeatures } from './model/pattern/feature/getStructuralFeatures.ts';
import { PatternBoardRuleSet } from './model/pattern/PatternBoardRuleSet.ts';
import { Solver } from './model/logic/minisat/core/Solver.ts';
import { BinaryRuleCollection } from './model/pattern/collection/BinaryRuleCollection.ts';

import generalEdgeSequence from '../data-sequences/general-edge.json';
import generalEdgeUnrestrictedSequence from '../data-sequences/general-edge-unrestricted.json';
import generalColorUnrestrictedSequence from '../data-sequences/general-color-unrestricted.json';
import generalEdgeSectorSequence from '../data-sequences/general-edge-sector.json';
import generalEdgeSectorUnrestrictedSequence from '../data-sequences/general-edge-sector-unrestricted.json';
import generalAllSequence from '../data-sequences/general-all.json';
import generalAllUnrestrictedSequence from '../data-sequences/general-all-unrestricted.json';
import squareOnlyEdgeSequence from '../data-sequences/square-only-edge.json';
import squareOnlyEdgeUnrestrictedSequence from '../data-sequences/square-only-edge-unrestricted.json';
import squareOnlyColorUnrestrictedSequence from '../data-sequences/square-only-color-unrestricted.json';
import squareOnlyEdgeSectorSequence from '../data-sequences/square-only-edge-sector.json';
import squareOnlyEdgeSectorUnrestrictedSequence from '../data-sequences/square-only-edge-sector-unrestricted.json';
import squareOnlyAllSequence from '../data-sequences/square-only-all.json';
import squareOnlyAllUnrestrictedSequence from '../data-sequences/square-only-all-unrestricted.json';

// @ts-expect-error
window.assertions.enableAssert();

const combine = ( name: string, a: BinaryRuleCollection, b: BinaryRuleCollection ) => {
  console.log( name );

  return a.withCollectionNonredundant( b );
};

const combineArray = ( name: string, collections: BinaryRuleCollection[] ) => {
  console.log( name, 'composite' );

  let result = collections[ 0 ];

  for ( let i = 1; i < collections.length; i++ ) {
    result = combine( `${name} ${i}`, result, collections[ i ] );
  }

  return result;
};

const writeCollection = ( name: string, collection: BinaryRuleCollection ) => {
  console.log( 'DONE WITH', name, collection );
};

/*
        'square-only-all-unrestricted',
        'square-only-color-unrestricted',
        'square-only-edge-sector-unrestricted',
        'square-only-edge-unrestricted',
 */

const collectionarino = combineArray( 'foo', [
  BinaryRuleCollection.deserialize( squareOnlyAllUnrestrictedSequence.collection ),
  BinaryRuleCollection.deserialize( squareOnlyColorUnrestrictedSequence.collection ),
  BinaryRuleCollection.deserialize( squareOnlyEdgeSectorUnrestrictedSequence.collection ),
  BinaryRuleCollection.deserialize( squareOnlyEdgeUnrestrictedSequence.collection ),
] );

debugger;

const squareOnlyEdge = combine( 'squareOnlyEdge', BinaryRuleCollection.deserialize( squareOnlyEdgeSequence.collection ), BinaryRuleCollection.deserialize( squareOnlyEdgeUnrestrictedSequence.collection ) );
writeCollection( 'square-only-edge', squareOnlyEdge );

const squareOnlyColor = BinaryRuleCollection.deserialize( squareOnlyColorUnrestrictedSequence.collection );
writeCollection( 'square-only-color', squareOnlyColor );

const squareOnlyEdgeSector = combineArray( 'squareOnlyEdgeSector', [
  BinaryRuleCollection.deserialize( squareOnlyEdgeSectorSequence.collection ),
  BinaryRuleCollection.deserialize( squareOnlyEdgeSectorUnrestrictedSequence.collection ),
  squareOnlyEdge,
] );
writeCollection( 'square-only-edge-sector', squareOnlyEdgeSector );

const squareOnlyAll = combineArray( 'squareOnlyAll', [
  BinaryRuleCollection.deserialize( squareOnlyAllSequence.collection ),
  BinaryRuleCollection.deserialize( squareOnlyAllUnrestrictedSequence.collection ),
  squareOnlyColor,
  squareOnlyEdgeSector,
] );
writeCollection( 'square-only-all', squareOnlyAll );

const generalEdge = combineArray( 'generalEdge', [
  BinaryRuleCollection.deserialize( generalEdgeSequence.collection ),
  BinaryRuleCollection.deserialize( generalEdgeUnrestrictedSequence.collection ),
  squareOnlyEdge
] );
writeCollection( 'general-edge', generalEdge );

const generalColor = combineArray( 'generalColor', [
  BinaryRuleCollection.deserialize( generalColorUnrestrictedSequence.collection ),
  squareOnlyColor
] );
writeCollection( 'general-color', generalColor );

const generalEdgeSector = combineArray( 'generalEdgeSector', [
  BinaryRuleCollection.deserialize( generalEdgeSectorSequence.collection ),
  BinaryRuleCollection.deserialize( generalEdgeSectorUnrestrictedSequence.collection ),
  generalEdge,
  squareOnlyEdgeSector,
] );
writeCollection( 'general-edge-sector', generalEdgeSector );

const generalAll = combineArray( 'generalAll', [
  BinaryRuleCollection.deserialize( generalAllSequence.collection ),
  BinaryRuleCollection.deserialize( generalAllUnrestrictedSequence.collection ),
  generalColor,
  generalEdgeSector,
  squareOnlyAll,
] );
writeCollection( 'general-all', generalAll );

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
