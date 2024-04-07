import { Display, HBox, Line, Node, Path, Rectangle, Text, VBox } from 'phet-lib/scenery';
import { FormulaSolver } from './model/logic/FormulaSolver.ts';
import { logicOr } from './model/logic/operations.ts';
import { Term } from './model/logic/Term.ts';
import { BasePatternBoard } from './model/pattern/BasePatternBoard.ts';
import { serializePatternBoardDescriptor } from './model/pattern/TPatternBoardDescriptor.ts';
import { BasicPuzzle } from './model/puzzle/BasicPuzzle.ts';
import { BoardPatternBoard } from './model/pattern/BoardPatternBoard.ts';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { TPatternBoard } from './model/pattern/TPatternBoard.ts';
import { Embedding } from './model/pattern/Embedding.ts';
import { computeEmbeddings } from './model/pattern/computeEmbeddings.ts';
import { Shape } from 'phet-lib/kite';
import { puzzleFont } from './view/Theme.ts';

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

class EmbeddingNode extends Node {
  public constructor(
    public readonly pattern: TPatternBoard,
    public readonly targetBoard: BoardPatternBoard,
    public readonly embedding: Embedding
  ) {
    super();

    const boardNode = new Node( {
      scale: 30
    } );
    this.addChild( boardNode );

    targetBoard.board.faces.forEach( face => {
      boardNode.addChild( new Path( Shape.polygon( face.vertices.map( vertex => vertex.viewCoordinates ) ), {
        stroke: '#888',
        lineWidth: 0.02
      } ) );
    } );

    const outsideBounds = boardNode.localBounds;

    // Add a transparent expansion, so our labels and expanded strokes don't throw off layout
    this.addChild( Rectangle.bounds( boardNode.bounds.dilated( 5 ) ) );

    // Exit edges
    for ( const [ patternEdge, targetEdges ] of embedding.exitEdgeMap ) {
      const index = patternEdge.index;
      for ( const targetEdge of targetEdges ) {
        const edge = targetBoard.getEdge( targetEdge );

        const path = new Line( edge.vertices[ 0 ].viewCoordinates, edge.vertices[ 1 ].viewCoordinates, {
          stroke: '#066',
          lineWidth: 0.03
        } );
        boardNode.addChild( path );

        const label = new Text( index, {
          font: puzzleFont,
          maxWidth: 0.4,
          maxHeight: 0.4,
          center: edge.vertices[ 0 ].viewCoordinates.average( edge.vertices[ 1 ].viewCoordinates ),
          fill: 'rgba(128,255,255,0.5)'
        } );
        boardNode.addChild( label );
      }
    }

    // Non-exit edges
    for ( const [ patternEdge, targetEdge ] of embedding.nonExitEdgeMap ) {
      const edge = targetBoard.getEdge( targetEdge );
      const index = patternEdge.index;

      const path = new Line( edge.vertices[ 0 ].viewCoordinates, edge.vertices[ 1 ].viewCoordinates, {
        stroke: '#f00',
        lineWidth: 0.03
      } );
      boardNode.addChild( path );

      const label = new Text( index, {
        font: puzzleFont,
        maxWidth: 0.4,
        maxHeight: 0.4,
        center: edge.vertices[ 0 ].viewCoordinates.average( edge.vertices[ 1 ].viewCoordinates ),
        fill: '#fff'
      } );
      boardNode.addChild( label );
    }

    for ( const [ patternFace, targetFace ] of embedding.faceMap ) {
      const face = targetBoard.getFace( targetFace );
      const index = patternFace.index;
      const isExit = patternFace.isExit;

      const shape = face ? Shape.polygon( face.vertices.map( vertex => vertex.viewCoordinates ) ) : Shape.bounds( outsideBounds.dilated( 0.13 ) ).shapeDifference( Shape.bounds( outsideBounds ) );

      const path = new Path( shape, {
        fill: isExit ? 'rgba(0,0,0,0.2)' : 'rgba(50,0,0,0.5)'
      } );

      boardNode.addChild( path );

      if ( face ) {
        const getExitLocation = () => {
          const vertexPositions = targetBoard.getEdge( embedding.nonExitEdgeMap.get( patternFace.edges[ 0 ] )! ).vertices.map( v => v.viewCoordinates );
          return face.viewCoordinates.average( vertexPositions[ 0 ].average( vertexPositions[ 1 ] ) );
        };

        const label = new Text( index, {
          font: puzzleFont,
          maxWidth: 0.4,
          maxHeight: 0.4,
          center: isExit ? getExitLocation() : face.viewCoordinates,
          fill: isExit ? '#f88' : '#8f8'
        } );
        boardNode.addChild( label );
      }
    }

    for ( const [ patternVertex, targetVertex ] of embedding.vertexMap ) {
      const vertex = targetBoard.getVertex( targetVertex );
      const index = patternVertex.index;
      const isExit = patternVertex.isExit;

      const label = new Text( index, {
        font: puzzleFont,
        maxWidth: 0.4,
        maxHeight: 0.4,
        center: vertex.viewCoordinates,
        fill: isExit ? '#0ff' : '#88f'
      } );
      boardNode.addChild( label );
    }
  }
}

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

  /*
  testPattern( '2-count exit-vertex (one span)', new BasePatternBoard( {
    numNonExitVertices: 0,
    numExitVertices: 1,
    type: 'exit-vertex',
    edgeCount: 2,
    spans: [ 1 ]
  } ) );
*/
  display.setWidthHeight(
    Math.ceil( scene.right + 10 ),
    Math.ceil( scene.bottom + 10 )
  );
  display.updateDisplay();

} )();
