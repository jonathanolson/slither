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
import _ from './workarounds/_.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import { TBoard } from './model/board/core/TBoard.ts';
import { TFace } from './model/board/core/TFace.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';
import { TPatternBoard } from './model/pattern/TPatternBoard.ts';
import { HexagonalBoard } from './model/board/hex/HexagonalBoard.ts';
import { getPeriodicTilingGenerator, PolygonGenerator } from './view/GenerateNode.ts';
import { cairoPentagonalTiling, PolygonalBoard, rhombilleTiling, snubSquareTiling, triangularTiling, trihexagonalTiling } from './model/board/core/TiledBoard.ts';
import { deserializePlanarMappedPatternBoard, serializePlanarMappedPatternBoard } from './model/pattern/TPlanarMappedPatternBoard.ts';
import { generateAllDisjointNonSingleSubsets, generateBinaryPartitions, getFaceFeatureCombinations } from './model/pattern/feature/getFaceFeatureCombinations.ts';

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

    {

      const getSemiAdjacentFaces = ( board: TBoard, face: TFace ): Set<TFace> => {
        const set = new Set<TFace>();
        face.vertices.forEach( vertex => {
          vertex.faces.forEach( f => {
            if ( f !== face ) {
              set.add( f );
            }
          } );
        } );
        return set;
      };

      const sketchyIsIsomorphic = ( a: TPatternBoard, b: TPatternBoard ): boolean => {
        if (
          a.vertices.length !== b.vertices.length ||
          a.edges.length !== b.edges.length ||
          a.faces.length !== b.faces.length ||
          a.sectors.length !== b.sectors.length ||
          a.vertices.filter( v => v.isExit ).length !== b.vertices.filter( v => v.isExit ).length ||
          a.edges.filter( e => e.isExit ).length !== b.edges.filter( e => e.isExit ).length ||
          a.faces.filter( f => f.isExit ).length !== b.faces.filter( f => f.isExit ).length
        ) {
          return false;
        }

        return computeEmbeddings( a, b ).length > 0 && computeEmbeddings( b, a ).length > 0;
      };

      const getNextGeneration = ( patternBoards: FacesPatternBoard[] ): FacesPatternBoard[] => {
        const nextGeneration: FacesPatternBoard[] = [];
        patternBoards.forEach( patternBoard => {
          const potentialFaces = new Set<TFace>();
          patternBoard.originalBoardFaces.forEach( face => {
            getSemiAdjacentFaces( patternBoard.originalBoard, face ).forEach( f => {
              if ( !patternBoard.originalBoardFaces.includes( f ) ) {
                potentialFaces.add( f );
              }
            } );
          } );

          potentialFaces.forEach( face => {
            const newFaces = [ ...patternBoard.originalBoardFaces, face ];
            const newPatternBoard = new FacesPatternBoard( patternBoard.originalBoard, newFaces );
            if ( !nextGeneration.some( p => sketchyIsIsomorphic( p, newPatternBoard ) ) ) {
              nextGeneration.push( newPatternBoard );
            }
          } );
        } );
        return nextGeneration;
      };

      const getGenerationNode = ( generation: FacesPatternBoard[] ): Node => {
        return new AlignBox( new HBox( {
          spacing: 10,
          children: generation.map( patternBoard => new PlanarMappedPatternBoardNode( patternBoard ) )
        } ), { margin: 5 } );
      };

      const getGenerationsNode = ( generations: FacesPatternBoard[][] ): Node => {
        return new VBox( {
          spacing: 10,
          align: 'left',
          children: generations.map( generation => getGenerationNode( generation ) )
        } );
      };

      const getFirstGeneration = ( board: TBoard ): FacesPatternBoard[] => {
        const orders = _.uniq( board.faces.map( face => face.vertices.length ) );

        const averageVertex = board.vertices.map( v => v.viewCoordinates ).reduce( ( a, b ) => a.plus( b ) ).timesScalar( 1 / board.vertices.length );

        return orders.map( order => {
          const centermostFace = _.minBy( board.faces.filter( face => face.vertices.length === order ), face => face.viewCoordinates.distanceSquared( averageVertex ) )!;
          assertEnabled() && assert( centermostFace );

          return new FacesPatternBoard( board, [ centermostFace ] );
        } );
      };

      const getFirstNGenerations = ( board: TBoard, n: number ): FacesPatternBoard[][] => {
        const firstGeneration = getFirstGeneration( board );

        const generations: FacesPatternBoard[][] = [ firstGeneration ];
        for ( let i = 0; i < n - 1; i++ ) {
          generations.push( getNextGeneration( generations[ generations.length - 1 ] ) );
        }
        return generations;
      };

      const getUniformTilingGenerations = ( generator: PolygonGenerator, n: number ): FacesPatternBoard[][] => {
        // TODO: simplify this board generation
        const polygons = generator.generate( {
          // TODO: make this variable
          width: 15,
          height: 15
        } );

        const board = new PolygonalBoard( polygons, generator.scale ?? 1 );

        return getFirstNGenerations( board, n );
      };

      console.log( '---- square ----' );

      // TODO: terminology omg!
      const a = deserializePlanarMappedPatternBoard( "{\"patternBoard\":\"[0,9,\\\"faces\\\",[[0,1,2,3],[4,5,0,6],[1,7,8,2]]]\",\"planarPatternMap\":\"[[[9,9],[10,9],[10,10],[9,10],[8,8],[9,8],[8,9],[11,9],[11,10]],[[0,1],[1,2],[2,3],[0,3],[4,5],[0,5],[0,6],[4,6],[1,7],[7,8],[2,8]],[[[9,9],[10,9],[10,10]],[[10,9],[10,10],[9,10]],[[10,10],[9,10],[9,9]],[[9,10],[9,9],[10,9]],[[8,8],[9,8],[9,9]],[[9,8],[9,9],[8,9]],[[9,9],[8,9],[8,8]],[[8,9],[8,8],[9,8]],[[10,9],[11,9],[11,10]],[[11,9],[11,10],[10,10]],[[11,10],[10,10],[10,9]],[[10,10],[10,9],[11,9]]],[[[9,9],[10,9],[10,10],[9,10]],[[8,8],[9,8],[9,9],[8,9]],[[10,9],[11,9],[11,10],[10,10]],[[9,9],[10,9],[9.5,8.75]],[[10,10],[9,10],[9.5,10.25]],[[9,9],[9,10],[8.75,9.5]],[[8,8],[9,8],[8.5,7.75]],[[9,9],[9,8],[9.25,8.5]],[[9,9],[8,9],[8.5,9.25]],[[8,8],[8,9],[7.75,8.5]],[[10,9],[11,9],[10.5,8.75]],[[11,9],[11,10],[11.25,9.5]],[[10,10],[11,10],[10.5,10.25]]]]\"}" );
      const b = deserializePlanarMappedPatternBoard( "{\"patternBoard\":\"[0,9,\\\"faces\\\",[[0,1,2,3],[4,5,0,6],[3,2,7,8]]]\",\"planarPatternMap\":\"[[[9,9],[10,9],[10,10],[9,10],[8,8],[9,8],[8,9],[10,11],[9,11]],[[0,1],[1,2],[2,3],[0,3],[4,5],[0,5],[0,6],[4,6],[2,7],[7,8],[3,8]],[[[9,9],[10,9],[10,10]],[[10,9],[10,10],[9,10]],[[10,10],[9,10],[9,9]],[[9,10],[9,9],[10,9]],[[8,8],[9,8],[9,9]],[[9,8],[9,9],[8,9]],[[9,9],[8,9],[8,8]],[[8,9],[8,8],[9,8]],[[9,10],[10,10],[10,11]],[[10,10],[10,11],[9,11]],[[10,11],[9,11],[9,10]],[[9,11],[9,10],[10,10]]],[[[9,9],[10,9],[10,10],[9,10]],[[8,8],[9,8],[9,9],[8,9]],[[9,10],[10,10],[10,11],[9,11]],[[9,9],[10,9],[9.5,8.75]],[[10,9],[10,10],[10.25,9.5]],[[9,9],[9,10],[8.75,9.5]],[[8,8],[9,8],[8.5,7.75]],[[9,9],[9,8],[9.25,8.5]],[[9,9],[8,9],[8.5,9.25]],[[8,8],[8,9],[7.75,8.5]],[[10,10],[10,11],[10.25,10.5]],[[10,11],[9,11],[9.5,11.25]],[[9,10],[9,11],[8.75,10.5]]]]\"}" );

      container.addChild( new HBox( {
        spacing: 10,
        children: [
          new PlanarMappedPatternBoardNode( a, { labels: true } ),
          new PlanarMappedPatternBoardNode( b, { labels: true } )
        ]
      } ) );

      console.log( sketchyIsIsomorphic( a.patternBoard, b.patternBoard ) );

      const squareGenerations = getFirstNGenerations( new SquareBoard( 20, 20 ), 4 );
      container.addChild( getGenerationsNode( squareGenerations ) );
      squareGenerations.forEach( ( generation, index ) => {
        console.log( `-- ${index} --` );
        generation.forEach( patternBoard => {
          console.log( JSON.stringify( serializePlanarMappedPatternBoard( patternBoard ) ) );
        } );
      } );

      console.log( '---- hex ----' );

      const hexGenerations = getFirstNGenerations( new HexagonalBoard( 5, 1, true ), 4 );
      container.addChild( getGenerationsNode( hexGenerations ) );

      console.log( '---- rhombille ----' );

      const rhombilleGenerations = getUniformTilingGenerations( getPeriodicTilingGenerator( rhombilleTiling, {
        width: 8,
        height: 8
      } ), 4 );
      container.addChild( getGenerationsNode( rhombilleGenerations ) );

      console.log( '---- cairo ----' );

      const cairoGenerations = getUniformTilingGenerations( getPeriodicTilingGenerator( cairoPentagonalTiling, {
        width: 8,
        height: 8,
        squareRegion: true
      } ), 4 );
      container.addChild( getGenerationsNode( cairoGenerations ) );

      console.log( '---- triangular ----' );

      const triangularGenerations = getUniformTilingGenerations( getPeriodicTilingGenerator( triangularTiling, {
        width: 6,
        height: 5
      } ), 4 );
      container.addChild( getGenerationsNode( triangularGenerations ) );

      console.log( '---- snub square ----' );

      const snubSquareGenerations = getUniformTilingGenerations( getPeriodicTilingGenerator( snubSquareTiling, {
        width: 5,
        height: 6,
        squareRegion: true
      } ), 4 );
      container.addChild( getGenerationsNode( snubSquareGenerations ) );

      console.log( '---- trihexagonal ----' );

      const trihexagonalGenerations = getUniformTilingGenerations( getPeriodicTilingGenerator( trihexagonalTiling, {
        width: 9,
        height: 9
      } ), 4 );
      container.addChild( getGenerationsNode( trihexagonalGenerations ) );

      console.log( generateAllDisjointNonSingleSubsets( 5 ).map( arr => JSON.stringify( arr ) ) );
      console.log( generateBinaryPartitions( 5 ).map( arr => JSON.stringify( arr ) ) );

      console.log( getFaceFeatureCombinations( new BasePatternBoard( {
        numNonExitVertices: 0,
        numExitVertices: 4,
        type: 'faces',
        vertexLists: [ [ 0, 1, 2, 3 ] ]
      } ) ).map( arr => arr.map( f => f.getCanonicalString() ) ) );
    }
  }

  display.setWidthHeight(
    Math.ceil( scene.right + 10 ),
    Math.ceil( scene.bottom + 10 )
  );
  display.updateDisplay();

} )();
