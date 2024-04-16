import { AlignBox, Display, HBox, Node, VBox } from 'phet-lib/scenery';
import { FormulaSolver } from './model/logic/FormulaSolver.ts';
import { logicOr } from './model/logic/operations.ts';
import { Term } from './model/logic/Term.ts';
import { BasePatternBoard } from './model/pattern/BasePatternBoard.ts';
import { serializePatternBoardDescriptor } from './model/pattern/TPatternBoardDescriptor.ts';
import { BasicPuzzle } from './model/puzzle/BasicPuzzle.ts';
import { BoardPatternBoard } from './model/pattern/BoardPatternBoard.ts';
import { SquareBoard } from './model/board/square/SquareBoard.ts';
import { EmbeddingNode } from './view/pattern/EmbeddingNode.ts';
import { PlanarMappedPatternBoardNode } from './view/pattern/PlanarMappedPatternBoardNode.ts';
import _ from './workarounds/_.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import { TBoard } from './model/board/core/TBoard.ts';
import { FacesPatternBoard } from './model/pattern/FacesPatternBoard.ts';
import { HexagonalBoard } from './model/board/hex/HexagonalBoard.ts';
import { getPeriodicTilingGenerator, PolygonGenerator } from './view/GenerateNode.ts';
import { cairoPentagonalTiling, PolygonalBoard, rhombilleTiling, snubSquareTiling, triangularTiling, trihexagonalTiling } from './model/board/core/TiledBoard.ts';
import { deserializePlanarMappedPatternBoard, serializePlanarMappedPatternBoard } from './model/pattern/TPlanarMappedPatternBoard.ts';
import { generateAllDisjointNonSingleSubsets, generateBinaryPartitions, getFaceFeatureCombinations } from './model/pattern/feature/getFaceFeatureCombinations.ts';
import { PatternNode } from './view/pattern/PatternNode.ts';
import { FaceFeature } from './model/pattern/feature/FaceFeature.ts';
import { BlackEdgeFeature } from './model/pattern/feature/BlackEdgeFeature.ts';
import { RedEdgeFeature } from './model/pattern/feature/RedEdgeFeature.ts';
import { FaceColorDualFeature } from './model/pattern/feature/FaceColorDualFeature.ts';
import { SectorNotZeroFeature } from './model/pattern/feature/SectorNotZeroFeature.ts';
import { SectorOnlyOneFeature } from './model/pattern/feature/SectorOnlyOneFeature.ts';
import { PatternBoardSolver } from './model/pattern/PatternBoardSolver.ts';
import { TEmbeddableFeature } from './model/pattern/feature/TEmbeddableFeature.ts';
import { FeatureSet } from './model/pattern/feature/FeatureSet.ts';
import { arePatternBoardsIsomorphic } from './model/pattern/arePatternBoardsIsomorphic.ts';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { PatternRule } from './model/pattern/PatternRule.ts';
import { basicPatternBoards } from './model/pattern/patternBoards.ts';
import { patternBoardMappings } from './model/pattern/patternBoardMappings.ts';
import { getEmbeddings } from './model/pattern/getEmbeddings.ts';
import { filterHighlanderSolutions } from './model/pattern/filterHighlanderSolutions.ts';
import { getIndeterminateEdges } from './model/pattern/getIndeterminateEdges.ts';
import { rhombilleEdgeGeneration2RuleSets, squareEdgeGeneration2RuleSets } from './model/pattern/rules.ts';

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

  const addPaddedNode = ( node: Node ) => {
    container.addChild( new AlignBox( node, { margin: 5 } ) );
  };

  const testPattern = ( name: string, pattern: BasePatternBoard ) => {
    console.log( '----------' );
    console.log( name );

    console.log( 'pattern', serializePatternBoardDescriptor( pattern.descriptor ), pattern );

    const embeddings = getEmbeddings( pattern, simplePatternBoard );
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
    addPaddedNode( new HBox( {
      spacing: 10,
      align: 'origin',
      children: basicPatternBoards.map( patternBoard => new PlanarMappedPatternBoardNode( {
        patternBoard: patternBoard,
        planarPatternMap: patternBoardMappings.get( patternBoard )!
      } ) )
    } ) );

    {
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
          generations.push( FacesPatternBoard.getNextGeneration( generations[ generations.length - 1 ] ) );
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

      console.log( arePatternBoardsIsomorphic( a.patternBoard, b.patternBoard ) );

      const squareGenerations = getFirstNGenerations( new SquareBoard( 20, 20 ), 5 );
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

      // quantity: 257
      console.log( getFaceFeatureCombinations( new BasePatternBoard( {
        numNonExitVertices: 0,
        numExitVertices: 4,
        type: 'faces',
        vertexLists: [ [ 0, 1, 2, 3 ] ]
      } ) ).map( arr => arr.map( f => f.toCanonicalString() ) ) );

      // quantity: 257
      console.log( getFaceFeatureCombinations( new BasePatternBoard( {
        numNonExitVertices: 0,
        numExitVertices: 4,
        type: 'faces',
        vertexLists: [ [ 0, 1, 2, 3 ] ]
      } ) ) );

      // quantity: 66049
      console.log( getFaceFeatureCombinations( new BasePatternBoard( {
        numNonExitVertices: 0,
        numExitVertices: 7,
        type: 'faces',
        vertexLists: [ [ 0, 1, 2, 3 ], [ 0, 4, 5, 6 ] ]
      } ) ) );

      const itsyBoard = new BasePatternBoard( {
        numNonExitVertices: 0,
        numExitVertices: 7,
        type: 'faces',
        vertexLists: [ [ 0, 1, 2, 3 ], [ 0, 4, 5, 6 ] ]
      } );
      const itsyAutmorphisms = getEmbeddings( itsyBoard, itsyBoard );
      console.log( getFaceFeatureCombinations( itsyBoard ).filter( features => {
        return FaceColorDualFeature.areCanonicalWith( features, itsyAutmorphisms );
      } ) );

      {
        const squarePatternBoard = getFirstGeneration( new SquareBoard( 20, 20 ) )[ 0 ];
        const diagonalPatternBoard = FacesPatternBoard.getNextGeneration( getFirstGeneration( new SquareBoard( 20, 20 ) ) )[ 0 ];
        const doubleSquarePatternBoard = FacesPatternBoard.getNextGeneration( FacesPatternBoard.getNextGeneration( FacesPatternBoard.getNextGeneration( getFirstGeneration( new SquareBoard( 20, 20 ) ) ) ) )[ 0 ];

        container.addChild( new PatternNode(
          squarePatternBoard,
          FeatureSet.fromSolution( squarePatternBoard, [ squarePatternBoard.edges[ 0 ], squarePatternBoard.edges[ 1 ], squarePatternBoard.edges[ 4 ] ] ),
          squarePatternBoard.planarPatternMap
        ) );

        [
          [],
          [ new FaceFeature( squarePatternBoard.faces[ 0 ], 2 ) ],
          [ new BlackEdgeFeature( squarePatternBoard.edges[ 0 ] )],
          [ new RedEdgeFeature( squarePatternBoard.edges[ 0 ] )],
          [ FaceColorDualFeature.fromPrimarySecondaryFaces( [
              squarePatternBoard.faces[ 0 ],
              squarePatternBoard.faces[ 1 ],
            ], [
              squarePatternBoard.faces[ 2 ],
            ] ) ],
          [ new SectorOnlyOneFeature( squarePatternBoard.sectors[ 3 ] ) ],
        ].forEach( features => {
          const solver = new PatternBoardSolver( squarePatternBoard );
          features.forEach( feature => solver.addFeature( feature ) );
          const solutions = solver.getRemainingSolutions();
          console.log( solutions );

          container.addChild( new AlignBox( new HBox( {
            spacing: 10,
            children: solutions.map( solution => new PatternNode( squarePatternBoard, FeatureSet.fromSolution( squarePatternBoard, solution ), squarePatternBoard.planarPatternMap ) )
          } ), { margin: 5 } ) );
        } );

        // TODO: other features
        const getRuleNode = ( board: FacesPatternBoard, inputFeatures: TEmbeddableFeature[], solveEdges: boolean, solveFaceColors = false, solveSectors = false, highlander = false ): Node => {
          const rule = PatternRule.getBasicRule( board, FeatureSet.fromFeatures( board, inputFeatures ), {
            solveEdges,
            solveFaceColors,
            solveSectors,
            highlander
          } )!;
          assertEnabled() && assert( rule );

          return new PatternRuleNode( rule, board.planarPatternMap, {
            // TODO
            patternNodeOptions: {
              // labels: true
            }
          } );
        };

        addPaddedNode( getRuleNode( squarePatternBoard, [
          new FaceFeature( squarePatternBoard.faces[ 0 ], 3 ),
          new RedEdgeFeature( squarePatternBoard.edges[ 0 ] ),
        ], true, false, false ) );

        addPaddedNode( getRuleNode( squarePatternBoard, [
          new FaceFeature( squarePatternBoard.faces[ 0 ], 3 ),
          FaceColorDualFeature.fromPrimarySecondaryFaces( [ squarePatternBoard.faces[ 0 ], squarePatternBoard.faces[ 1 ] ], [] ),
        ], false, true, false ) );

        addPaddedNode( getRuleNode( squarePatternBoard, [
          new FaceFeature( squarePatternBoard.faces[ 0 ], 3 ),
          new RedEdgeFeature( squarePatternBoard.vertices[ 0 ].exitEdge! )
        ], true, false, true ) );

        addPaddedNode( getRuleNode( squarePatternBoard, [
          new FaceFeature( squarePatternBoard.faces[ 0 ], 2 ),
          new SectorNotZeroFeature( squarePatternBoard.sectors[ 0 ] ),
        ], false, false, true ) );

        addPaddedNode( getRuleNode( squarePatternBoard, [
          new FaceFeature( squarePatternBoard.faces[ 0 ], 2 ),
          new SectorOnlyOneFeature( squarePatternBoard.sectors[ 0 ] ),
        ], false, false, true ) );

        addPaddedNode( getRuleNode( squarePatternBoard, [
          new BlackEdgeFeature( squarePatternBoard.edges[ 0 ] ),
          new RedEdgeFeature( squarePatternBoard.edges[ 4 ] ),
        ], true, false, false ) );

        addPaddedNode( getRuleNode( diagonalPatternBoard, [
          new FaceFeature( diagonalPatternBoard.faces[ 0 ], 3 ),
          new FaceFeature( diagonalPatternBoard.faces[ 1 ], 3 ),
        ], true, true, true ) );

        addPaddedNode( getRuleNode( doubleSquarePatternBoard, [
          new FaceFeature( doubleSquarePatternBoard.faces[ 0 ], 3 ),
          new FaceFeature( doubleSquarePatternBoard.faces[ 1 ], 3 ),
        ], true, true, true ) );

        addPaddedNode( getRuleNode( doubleSquarePatternBoard, [
          new FaceFeature( doubleSquarePatternBoard.faces[ 0 ], 3 ),
          new FaceFeature( doubleSquarePatternBoard.faces[ 1 ], 3 ),
          new RedEdgeFeature( doubleSquarePatternBoard.edges.filter( edge => edge.isExit )[ 7 ] ),
        ], true, true, true ) );

        addPaddedNode( new PatternNode( doubleSquarePatternBoard, FeatureSet.fromFeatures( doubleSquarePatternBoard, [
          new FaceFeature( doubleSquarePatternBoard.faces[ 0 ], 3 ),
          new FaceFeature( doubleSquarePatternBoard.faces[ 1 ], 3 ),
          new RedEdgeFeature( doubleSquarePatternBoard.edges.filter( edge => edge.isExit )[ 1 ] ),
          new RedEdgeFeature( doubleSquarePatternBoard.edges.filter( edge => edge.isExit )[ 3 ] ),
        ] ), doubleSquarePatternBoard.planarPatternMap ) );

        const crossBoard = squareGenerations[ 4 ][ 7 ];

        const crossBoardHighlanderFeatures = [
          new FaceFeature( crossBoard.faces[ 0 ], null ),
          new FaceFeature( crossBoard.faces[ 1 ], null ),
          new FaceFeature( crossBoard.faces[ 2 ], 2 ),
          new FaceFeature( crossBoard.faces[ 3 ], null ),
          new FaceFeature( crossBoard.faces[ 4 ], null ),
          new RedEdgeFeature( crossBoard.edges[ 1 ] ),
          new RedEdgeFeature( crossBoard.edges[ 12 ] ),
          new RedEdgeFeature( crossBoard.edges[ 17 ] ),
          new RedEdgeFeature( crossBoard.edges[ 21 ] ),
        ];

        addPaddedNode( new PatternNode( crossBoard, FeatureSet.fromFeatures( crossBoard, crossBoardHighlanderFeatures ), crossBoard.planarPatternMap, {
          labels: true
        } ) );

        {
          const solver = new PatternBoardSolver( crossBoard );
          const features = crossBoardHighlanderFeatures;
          features.forEach( feature => solver.addFeature( feature ) );
          const solutions = solver.getRemainingSolutions();
          console.log( solutions );

          const indeterminateEdges = getIndeterminateEdges( crossBoard, features );
          console.log( indeterminateEdges );

          const highlander = filterHighlanderSolutions( solutions, indeterminateEdges, crossBoard.vertices.filter( v => v.isExit ) );
          console.log( highlander );

          // container.addChild( new AlignBox( new HBox( {
          //   spacing: 10,
          //   children: highlander.highlanderSolutions.map( solution => new PatternNode( crossBoard, FeatureSet.fromSolution( crossBoard, solution ), crossBoard.planarPatternMap ) )
          // } ), { margin: 5 } ) );
        }

        addPaddedNode( getRuleNode( crossBoard, crossBoardHighlanderFeatures, true, false, true ) );

        addPaddedNode( getRuleNode( crossBoard, crossBoardHighlanderFeatures, true, false, true, true ) );

        const aRule = PatternRule.getBasicRule( squarePatternBoard, FeatureSet.fromFeatures( squarePatternBoard, [
          new FaceFeature( squarePatternBoard.faces[ 0 ], 3 ),
          new RedEdgeFeature( squarePatternBoard.vertices[ 0 ].exitEdge! )
        ] ), {
          solveEdges: true,
          solveFaceColors: false,
          solveSectors: false,
          highlander: false
        } )!;

        // TODO: filter by not null
        const aEmbeddedRules = getEmbeddings( squarePatternBoard, doubleSquarePatternBoard ).map( embedding => aRule.embedded( doubleSquarePatternBoard, embedding )! );

        addPaddedNode( new HBox( {
          spacing: 10,
          children: aEmbeddedRules.map( rule => new PatternRuleNode( rule, doubleSquarePatternBoard.planarPatternMap ) )
        } ) );

        const aUniqueEmbeddedRules: PatternRule[] = [];
        aEmbeddedRules.forEach( rule => {
          if ( !aUniqueEmbeddedRules.some( uniqueRule => rule.isIsomorphicTo( uniqueRule ) ) ) {
            aUniqueEmbeddedRules.push( rule );
          }
        } );

        addPaddedNode( new HBox( {
          spacing: 10,
          children: aUniqueEmbeddedRules.map( rule => new PatternRuleNode( rule, doubleSquarePatternBoard.planarPatternMap ) )
        } ) );

        const aFeatures = FeatureSet.fromFeatures( doubleSquarePatternBoard, [
          new FaceFeature( doubleSquarePatternBoard.faces[ 0 ], 3 ),
          new FaceFeature( doubleSquarePatternBoard.faces[ 1 ], 3 ),
          new RedEdgeFeature( doubleSquarePatternBoard.edges.filter( edge => edge.isExit )[ 1 ] ),
          new RedEdgeFeature( doubleSquarePatternBoard.edges.filter( edge => edge.isExit )[ 3 ] ),
        ] );

        const aNewFeatures = PatternRule.withRulesApplied( doubleSquarePatternBoard, aFeatures, aEmbeddedRules );

        addPaddedNode( new PatternNode( doubleSquarePatternBoard, aNewFeatures, doubleSquarePatternBoard.planarPatternMap ) );

        // addPaddedNode( getRuleNode( doubleSquarePatternBoard, [
        //   new FaceFeature( doubleSquarePatternBoard.faces[ 0 ], 3 ),
        //   new FaceFeature( doubleSquarePatternBoard.faces[ 1 ], 3 ),
        //   new RedEdgeFeature( doubleSquarePatternBoard.edges.filter( edge => edge.isExit )[ 1 ] ),
        //   new RedEdgeFeature( doubleSquarePatternBoard.edges.filter( edge => edge.isExit )[ 3 ] ),
        // ], true, true, true ) );

        // console.log( PatternRule.getRules( squarePatternBoard ) );
        // console.log( PatternRule.getRules( vertexExit4TwoOppositeSectorsPatternBoard ) );

        const square2Rules = squareEdgeGeneration2RuleSets.flatMap( ruleSet => ruleSet.rules );
        console.log( _.sum( square2Rules.map( rule => rule.inputFeatureSet.getInputDifficultyScoreA() ) ) / square2Rules.length );
        console.log( '<12', square2Rules.filter( rule => rule.inputFeatureSet.getInputDifficultyScoreA() < 12 ).length / square2Rules.length );
        console.log( '<14', square2Rules.filter( rule => rule.inputFeatureSet.getInputDifficultyScoreA() < 14 ).length / square2Rules.length );
        console.log( '<16', square2Rules.filter( rule => rule.inputFeatureSet.getInputDifficultyScoreA() < 16 ).length / square2Rules.length );
        console.log( '<18', square2Rules.filter( rule => rule.inputFeatureSet.getInputDifficultyScoreA() < 18 ).length / square2Rules.length );
        console.log( '<20', square2Rules.filter( rule => rule.inputFeatureSet.getInputDifficultyScoreA() < 20 ).length / square2Rules.length );

        console.log( _.sum( square2Rules.map( rule => rule.inputFeatureSet.getFeaturesArray().length ) ) / square2Rules.length );
        console.log( '<4', square2Rules.filter( rule => rule.inputFeatureSet.getFeaturesArray().length < 4 ).length / square2Rules.length );
        console.log( '<6', square2Rules.filter( rule => rule.inputFeatureSet.getFeaturesArray().length < 6 ).length / square2Rules.length );
        console.log( '<8', square2Rules.filter( rule => rule.inputFeatureSet.getFeaturesArray().length < 8 ).length / square2Rules.length );
        console.log( '<9', square2Rules.filter( rule => rule.inputFeatureSet.getFeaturesArray().length < 9 ).length / square2Rules.length );
        console.log( '<10', square2Rules.filter( rule => rule.inputFeatureSet.getFeaturesArray().length < 10 ).length / square2Rules.length );
        console.log( '<12', square2Rules.filter( rule => rule.inputFeatureSet.getFeaturesArray().length < 12 ).length / square2Rules.length );
        console.log( '<14', square2Rules.filter( rule => rule.inputFeatureSet.getFeaturesArray().length < 14 ).length / square2Rules.length );
        console.log( '<16', square2Rules.filter( rule => rule.inputFeatureSet.getFeaturesArray().length < 16 ).length / square2Rules.length );
        console.log( '<18', square2Rules.filter( rule => rule.inputFeatureSet.getFeaturesArray().length < 18 ).length / square2Rules.length );
        console.log( '<20', square2Rules.filter( rule => rule.inputFeatureSet.getFeaturesArray().length < 20 ).length / square2Rules.length );

        // console.log( arePatternBoardsIsomorphic( rhombilleEdgeGeneration2RuleSets[ 3 ].patternBoard, squareEdgeGeneration2RuleSets[ 3 ].patternBoard ) );
      }
    }
  }

  display.setWidthHeight(
    Math.ceil( scene.right + 10 ),
    Math.ceil( scene.bottom + 10 )
  );
  display.updateDisplay();

} )();
