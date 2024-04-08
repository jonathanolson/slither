import { AlignBox, Display, HBox, Node, VBox } from 'phet-lib/scenery';
import { FormulaSolver } from './model/logic/FormulaSolver.ts';
import { logicOr } from './model/logic/operations.ts';
import { Term } from './model/logic/Term.ts';
import { BasePatternBoard } from './model/pattern/BasePatternBoard.ts';
import { serializePatternBoardDescriptor } from './model/pattern/TPatternBoardDescriptor.ts';
import { BasicPuzzle } from './model/puzzle/BasicPuzzle.ts';
import { BoardPatternBoard } from './model/pattern/BoardPatternBoard.ts';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { computeEmbeddings } from './model/pattern/computeEmbeddings.ts';
import { EmbeddingNode } from './view/pattern/EmbeddingNode.ts';
import { PlanarMappedPatternBoardNode } from './view/pattern/PlanarMappedPatternBoardNode.ts';
import { getSingleEdgePlanarPatternMap, getVertexPlanarPatternMap } from './model/pattern/TPlanarPatternMap.ts';

// Load with `http://localhost:5173/discover-rules.html?debugger`

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
  const solver = new FormulaSolver<string>();

  const a = new Term( 'a', 'a' );
  const b = new Term( 'b', 'b' );
  const c = new Term( 'c', 'c' );

  solver.addFormula( logicOr( [ a, b, c ] ) );

  let solution: string[] | null;

  do {
    solution = solver.getNextSolution();
    console.log( solution );
  }
  while ( solution !== null );

  const edgeBoard = new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 0,
    type: 'edge'
  } );
  console.log( 'edgeBoard', edgeBoard );
  console.log( serializePatternBoardDescriptor( edgeBoard.descriptor ) );

  const nonExitVertexBoard = new BasePatternBoard( {
    numNonExitVertices: 1,
    numExitVertices: 0,
    type: 'non-exit-vertex',
    edgeCount: 3
  } );
  console.log( 'nonExitVertexBoard', nonExitVertexBoard );
  console.log( serializePatternBoardDescriptor( nonExitVertexBoard.descriptor ) );

  const exitVertexBoard = new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 1,
    type: 'exit-vertex',
    edgeCount: 4,
    spans: [ 1, 1 ]
  } );
  console.log( 'exitVertexBoard', exitVertexBoard );
  console.log( serializePatternBoardDescriptor( exitVertexBoard.descriptor ) );

  const facesBoard = new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 3,
    type: 'faces',
    vertexLists: [ [ 0, 1, 2 ] ]
  } );
  console.log( 'facesBoard', facesBoard );
  console.log( serializePatternBoardDescriptor( facesBoard.descriptor ) );

  const facesBoard2 = new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 4,
    type: 'faces',
    vertexLists: [ [ 0, 1, 2 ], [ 0, 1, 3 ] ]
  } );
  console.log( 'facesBoard2', facesBoard2 );
  console.log( serializePatternBoardDescriptor( facesBoard2.descriptor ) );

  const puzzle = BasicPuzzle.loadDefaultPuzzle();
  const boardPatternBoard = new BoardPatternBoard( puzzle.board );
  console.log( 'boardPatternBoard', boardPatternBoard );
  console.log( serializePatternBoardDescriptor( boardPatternBoard.descriptor ) );

  const simpleBoard = new SquareBoard( 2, 3 );
  const simplePatternBoard = new BoardPatternBoard( simpleBoard );
  console.log( 'simplePatternBoard', simplePatternBoard );
  console.log( serializePatternBoardDescriptor( simplePatternBoard.descriptor ) );

  const container = new VBox( {
    x: 10,
    y: 10,
    align: 'left'
  } );
  scene.addChild( container );

  const testPattern = ( name: string, pattern: BasePatternBoard ) => {
    console.log( '----------' );
    console.log( name );

    console.log( 'pattern', serializePatternBoardDescriptor( pattern.descriptor ), pattern );

    const embeddings = computeEmbeddings( pattern, simplePatternBoard );
    console.log( 'embeddings', embeddings );

    container.addChild( new HBox( {
      children: embeddings.map( embedding => new EmbeddingNode( pattern, simplePatternBoard, embedding ) )
    } ) );
  };

  testPattern( 'edge pattern', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 0,
    type: 'edge'
  } ) );

  testPattern( '2-count exit-vertex no sectors', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 1,
    type: 'exit-vertex',
    edgeCount: 2,
    spans: []
  } ) );

  testPattern( '2-count exit-vertex one sector', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 1,
    type: 'exit-vertex',
    edgeCount: 2,
    spans: [ 1 ]
  } ) );

  testPattern( '3-count exit-vertex two adjacent sectors', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 1,
    type: 'exit-vertex',
    edgeCount: 3,
    spans: [ 2 ]
  } ) );

  testPattern( '4-count exit-vertex two opposite sectors', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 1,
    type: 'exit-vertex',
    edgeCount: 4,
    spans: [ 1, 1 ]
  } ) );

  testPattern( '4-count exit-vertex three-adjacent sectors', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 1,
    type: 'exit-vertex',
    edgeCount: 4,
    spans: [ 3 ]
  } ) );

  testPattern( '2-count non-exit-vertex', new BasePatternBoard( {
    numNonExitVertices: 1,
    numExitVertices: 0,
    type: 'non-exit-vertex',
    edgeCount: 2
  } ) );

  testPattern( '3-count non-exit-vertex', new BasePatternBoard( {
    numNonExitVertices: 1,
    numExitVertices: 0,
    type: 'non-exit-vertex',
    edgeCount: 3
  } ) );

  testPattern( '4-count non-exit-vertex', new BasePatternBoard( {
    numNonExitVertices: 1,
    numExitVertices: 0,
    type: 'non-exit-vertex',
    edgeCount: 4
  } ) );

  testPattern( 'square pattern', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 4,
    type: 'faces',
    vertexLists: [ [ 0, 1, 2, 3 ] ]
  } ) );

  testPattern( '2 adjacent squares pattern', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 6,
    type: 'faces',
    vertexLists: [ [ 0, 1, 4, 3 ], [ 1, 2, 5, 4 ] ]
  } ) );

  testPattern( '2 diagonal squares pattern', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 7,
    type: 'faces',
    vertexLists: [ [ 0, 1, 2, 3 ], [ 0, 4, 5, 6 ] ]
  } ) );

  testPattern( 'L square pattern', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 8,
    type: 'faces',
    vertexLists: [ [ 0, 1, 2, 3 ], [ 0, 3, 4, 5 ], [ 0, 5, 6, 7 ] ]
  } ) );

  testPattern( '4-square pattern', new BasePatternBoard( {
    numNonExitVertices: 1,
    numExitVertices: 8,
    type: 'faces',
    vertexLists: [ [ 0, 1, 2, 3 ], [ 0, 3, 4, 5 ], [ 0, 5, 6, 7 ], [ 0, 7, 8, 1 ] ]
  } ) );

  testPattern( '3 diagonal squares pattern', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 10,
    type: 'faces',
    vertexLists: [ [ 0, 1, 2, 3 ], [ 0, 4, 5, 6 ], [ 5, 7, 8, 9 ] ]
  } ) );

  testPattern( '3 semi-diagonal squares pattern', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 10,
    type: 'faces',
    vertexLists: [ [ 0, 1, 2, 3 ], [ 0, 4, 5, 6 ], [ 4, 7, 8, 9 ] ]
  } ) );

  {
    const edgePattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 0,
      type: 'edge'
    } );

    const vertexExit2NoSectorsPattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 2,
      spans: []
    } );

    const vertexExit2OneSectorPattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 2,
      spans: [ 1 ]
    } );

    const vertexExit3TwoAdjacentSectorsPattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 3,
      spans: [ 2 ]
    } );

    const vertexExit4TwoOppositeSectorsPattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 4,
      spans: [ 1, 1 ]
    } );

    const vertexExit4ThreeAdjacentSectorsPattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 4,
      spans: [ 3 ]
    } );

    const vertexExit5TwoOnePattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 5,
      spans: [ 2, 1 ]
    } );

    const vertexExit5FourPattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 5,
      spans: [ 4 ]
    } );

    const vertexExit6TriplePattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 6,
      spans: [ 1, 1, 1 ]
    } );

    const vertexExit6TwoTwoPattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 6,
      spans: [ 2, 2 ]
    } );

    const vertexExit6ThreeOnePattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 6,
      spans: [ 3, 1 ]
    } );

    const vertexExit6FivePattern = new BasePatternBoard( {
      numNonExitVertices: 0,
      numExitVertices: 1,
      type: 'exit-vertex',
      edgeCount: 6,
      spans: [ 5 ]
    } );

    const vertexNonExit2Pattern = new BasePatternBoard( {
      numNonExitVertices: 1,
      numExitVertices: 0,
      type: 'non-exit-vertex',
      edgeCount: 2
    } );

    const vertexNonExit3Pattern = new BasePatternBoard( {
      numNonExitVertices: 1,
      numExitVertices: 0,
      type: 'non-exit-vertex',
      edgeCount: 3
    } );

    const vertexNonExit4Pattern = new BasePatternBoard( {
      numNonExitVertices: 1,
      numExitVertices: 0,
      type: 'non-exit-vertex',
      edgeCount: 4
    } );

    const vertexNonExit5Pattern = new BasePatternBoard( {
      numNonExitVertices: 1,
      numExitVertices: 0,
      type: 'non-exit-vertex',
      edgeCount: 5
    } );

    const vertexNonExit6Pattern = new BasePatternBoard( {
      numNonExitVertices: 1,
      numExitVertices: 0,
      type: 'non-exit-vertex',
      edgeCount: 6
    } );

    container.addChild( new AlignBox( new HBox( {
      spacing: 10,
      align: 'origin',
      children: [
        new PlanarMappedPatternBoardNode( {
          patternBoard: edgePattern,
          planarPatternMap: getSingleEdgePlanarPatternMap( edgePattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit2NoSectorsPattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit2NoSectorsPattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit2OneSectorPattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit2OneSectorPattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit3TwoAdjacentSectorsPattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit3TwoAdjacentSectorsPattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit4TwoOppositeSectorsPattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit4TwoOppositeSectorsPattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit4ThreeAdjacentSectorsPattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit4ThreeAdjacentSectorsPattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit5TwoOnePattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit5TwoOnePattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit5FourPattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit5FourPattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit6TriplePattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit6TriplePattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit6TwoTwoPattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit6TwoTwoPattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit6ThreeOnePattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit6ThreeOnePattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexExit6FivePattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexExit6FivePattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexNonExit2Pattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexNonExit2Pattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexNonExit3Pattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexNonExit3Pattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexNonExit4Pattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexNonExit4Pattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexNonExit5Pattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexNonExit5Pattern ),
        } ),
        new PlanarMappedPatternBoardNode( {
          patternBoard: vertexNonExit6Pattern,
          planarPatternMap: getVertexPlanarPatternMap( vertexNonExit6Pattern ),
        } )
      ]
    } ), { margin: 10 } ) );
  }

  display.setWidthHeight(
    Math.ceil( scene.right + 10 ),
    Math.ceil( scene.bottom + 10 )
  );
  display.updateDisplay();

} )();
