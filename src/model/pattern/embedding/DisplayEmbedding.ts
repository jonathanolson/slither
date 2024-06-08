import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { BoardPatternBoard } from '../pattern-board/BoardPatternBoard.ts';
import { TBoard } from '../../board/core/TBoard.ts';
import { Embedding } from './Embedding.ts';
import { TFace } from '../../board/core/TFace.ts';
import { TEdge } from '../../board/core/TEdge.ts';
import { TSector } from '../../data/sector-state/TSector.ts';
import { TPatternFace } from '../pattern-board/TPatternFace.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import { TPatternEdge } from '../pattern-board/TPatternEdge.ts';
import { TPatternSector } from '../pattern-board/TPatternSector.ts';
import { FeatureSet } from '../feature/FeatureSet.ts';
import { CompleteData } from '../../data/combined/CompleteData.ts';
import { FaceFeature } from '../feature/FaceFeature.ts';
import { BlackEdgeFeature } from '../feature/BlackEdgeFeature.ts';
import EdgeState from '../../data/edge-state/EdgeState.ts';
import { RedEdgeFeature } from '../feature/RedEdgeFeature.ts';
import { SectorNotZeroFeature } from '../feature/SectorNotZeroFeature.ts';
import SectorState from '../../data/sector-state/SectorState.ts';
import { SectorNotOneFeature } from '../feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from '../feature/SectorNotTwoFeature.ts';
import { SectorOnlyOneFeature } from '../feature/SectorOnlyOneFeature.ts';
import { FaceColorDualFeature } from '../feature/FaceColorDualFeature.ts';
import { FaceColorMakeSameAction } from '../../data/face-color/FaceColorMakeSameAction.ts';
import { FaceColorMakeOppositeAction } from '../../data/face-color/FaceColorMakeOppositeAction.ts';
import { safeSolve } from '../../solver/safeSolve.ts';
import { computeEmbeddings } from './computeEmbeddings.ts';
import { Bounds2 } from 'phet-lib/dot';
import { TPatternVertex } from '../pattern-board/TPatternVertex.ts';
import { createBoardDescriptor } from '../../board/core/createBoardDescriptor.ts';
import { BaseBoard } from '../../board/core/BaseBoard.ts';
import { getFaceColorPointer } from '../../data/face-color/getFaceColorPointer.ts';

export class DisplayEmbedding {

  public constructor(
    public readonly sourcePatternBoard: TPatternBoard,
    public readonly boardPatternBoard: BoardPatternBoard,
    public readonly largeBoard: TBoard,
    public readonly embedding: Embedding,
    public readonly smallBoard: TBoard,
    public readonly toSmallFaceMap: Map<TFace, TFace>,
    public readonly toSmallEdgeMap: Map<TEdge, TEdge>,
    public readonly toSmallSectorMap: Map<TSector, TSector>,
    public readonly tightBounds: Bounds2,
    public readonly expandedBounds: Bounds2,
  ) {}

  public mapFace( face: TPatternFace ): TFace | null {
    const embeddedFace = this.embedding.mapFace( face );
    const largeFace = this.boardPatternBoard.getFace( embeddedFace );
    if ( largeFace ) {
      const smallFace = this.toSmallFaceMap.get( largeFace )!;
      assertEnabled() && assert( smallFace );

      return smallFace;
    }
    else {
      return null;
    }
  }

  public mapEdge( edge: TPatternEdge ): TEdge[] {
    const embeddedEdges = edge.isExit ? this.embedding.mapExitEdges( edge ) : [ this.embedding.mapNonExitEdge( edge ) ];
    const largeEdges = embeddedEdges.map( embeddedEdge => this.boardPatternBoard.getEdge( embeddedEdge ) );
    return largeEdges.map( largeEdge => {
      const smallEdge = this.toSmallEdgeMap.get( largeEdge )!;
      assertEnabled() && assert( smallEdge );

      return smallEdge;
    } );
  }

  public mapSector( sector: TPatternSector ): TSector {
    const embeddedSector = this.embedding.mapSector( sector );
    const largeSector = this.boardPatternBoard.getSector( embeddedSector );
    const smallSector = this.toSmallSectorMap.get( largeSector )!;
    assertEnabled() && assert( smallSector );

    return smallSector;
  }

  public getEmbeddedQuestionFaces( featureSet: FeatureSet ): TFace[] {
    const definedSmallFaces = new Set<TFace>();

    for ( const patternFace of featureSet.patternBoard.faces ) {
      if ( featureSet.getFaceValue( patternFace ) !== undefined ) {
        const face = this.mapFace( patternFace );
        if ( face ) {
          definedSmallFaces.add( face );
        }
      }
    }

    return this.smallBoard.faces.filter( face => !definedSmallFaces.has( face ) );
  }

  // TODO: how to better handle "question" mark features
  public getEmbeddedCompleteData( featureSet: FeatureSet ): CompleteData {
    const state = CompleteData.empty( this.smallBoard );

    for ( const feature of featureSet.getFeaturesArray() ) {
      if ( feature instanceof FaceFeature ) {
        if ( feature.value !== null ) {
          state.setFaceValue( this.mapFace( feature.face )!, feature.value );
        }
      }
      else if ( feature instanceof BlackEdgeFeature ) {
        this.mapEdge( feature.edge ).forEach( edge => state.setEdgeState( edge, EdgeState.BLACK ) );
      }
      else if ( feature instanceof RedEdgeFeature ) {
        this.mapEdge( feature.edge ).forEach( edge => state.setEdgeState( edge, EdgeState.RED ) );
      }
      else if ( feature instanceof SectorNotZeroFeature ) {
        state.setSectorState( this.mapSector( feature.sector ), SectorState.NOT_ZERO );
      }
      else if ( feature instanceof SectorNotOneFeature ) {
        state.setSectorState( this.mapSector( feature.sector ), SectorState.NOT_ONE );
      }
      else if ( feature instanceof SectorNotTwoFeature ) {
        state.setSectorState( this.mapSector( feature.sector ), SectorState.NOT_TWO );
      }
      else if ( feature instanceof SectorOnlyOneFeature ) {
        state.setSectorState( this.mapSector( feature.sector ), SectorState.ONLY_ONE );
      }
      else if ( feature instanceof FaceColorDualFeature ) {
        const makeSame = ( a: TPatternFace, b: TPatternFace ) => {
          const mappedA = this.mapFace( a );
          const mappedB = this.mapFace( b );

          const aColor = mappedA ? state.getFaceColor( mappedA ) : state.getOutsideColor();
          const bColor = mappedB ? state.getFaceColor( mappedB ) : state.getOutsideColor();

          new FaceColorMakeSameAction( getFaceColorPointer( state, aColor ), getFaceColorPointer( state, bColor ) ).apply( state );
        };
        const makeOpposite = ( a: TPatternFace, b: TPatternFace ) => {
          const mappedA = this.mapFace( a );
          const mappedB = this.mapFace( b );

          const aColor = mappedA ? state.getFaceColor( mappedA ) : state.getOutsideColor();
          const bColor = mappedB ? state.getFaceColor( mappedB ) : state.getOutsideColor();

          new FaceColorMakeOppositeAction( getFaceColorPointer( state, aColor ), getFaceColorPointer( state, bColor ) ).apply( state );
        };
        for ( let i = 1; i < feature.primaryFaces.length; i++ ) {
          makeSame( feature.primaryFaces[ i - 1 ], feature.primaryFaces[ i ] );
        }
        for ( let j = 1; j < feature.secondaryFaces.length; j++ ) {
          makeSame( feature.secondaryFaces[ j - 1 ], feature.secondaryFaces[ j ] );
        }
        if ( feature.secondaryFaces.length ) {
          makeOpposite( feature.primaryFaces[ 0 ], feature.secondaryFaces[ 0 ] );
        }
      }
      else {
        throw new Error( `unhandled feature: ${feature}` );
      }
    }

    safeSolve( this.smallBoard, state );

    return state;
  }

  public static getEmbeddingBounds(
    sourcePatternBoard: TPatternBoard,
    boardPatternBoard: BoardPatternBoard,
    embedding: Embedding
  ): Bounds2 {
    const embeddingBounds = Bounds2.NOTHING.copy();

    const addPatternVertex = ( vertex: TPatternVertex ) => {
      embeddingBounds.addPoint( boardPatternBoard.getVertex( embedding.mapVertex( vertex ) ).viewCoordinates );
    };
    sourcePatternBoard.vertices.forEach( addPatternVertex );

    const addPatternFace = ( face: TPatternFace ) => {
      const mappedFace = boardPatternBoard.getFace( embedding.mapFace( face ) );
      if ( mappedFace ) {
        mappedFace.vertices.forEach( vertex => embeddingBounds.addPoint( vertex.viewCoordinates ) );
      }
    };
    sourcePatternBoard.faces.forEach( addPatternFace );

    sourcePatternBoard.edges.forEach( edge => {
      let edges: TEdge[];
      if ( edge.isExit ) {
        edges = embedding.mapExitEdges( edge ).map( exitEdge => boardPatternBoard.getEdge( exitEdge ) );
      }
      else {
        edges = [ boardPatternBoard.getEdge( embedding.mapNonExitEdge( edge ) ) ];
      }
      edges.forEach( mappedEdge => {
        embeddingBounds.addPoint( mappedEdge.start.viewCoordinates );
        embeddingBounds.addPoint( mappedEdge.end.viewCoordinates );
      } );
    } );

    return embeddingBounds;
  }

  public static findBestEmbedding(
    sourcePatternBoard: TPatternBoard,
    boardPatternBoard: BoardPatternBoard,
    largeBoard: TBoard,
  ): Embedding | null {
    const embeddings = computeEmbeddings( sourcePatternBoard, boardPatternBoard );

    if ( embeddings.length === 0 ) {
      return null;
    }

    const displayTilingBounds = Bounds2.NOTHING.copy();
    largeBoard.vertices.forEach( vertex => displayTilingBounds.addPoint( vertex.viewCoordinates ) );

    const displayTilingCenter = displayTilingBounds.center;

    let bestEmbedding: Embedding | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for ( let i = 0; i < embeddings.length; i++ ) {
      const embedding = embeddings[ i ];

      const embeddingBounds = DisplayEmbedding.getEmbeddingBounds( sourcePatternBoard, boardPatternBoard, embedding );

      const embeddingCenter = embeddingBounds.center;

      const distance = displayTilingCenter.distance( embeddingCenter );

      if ( distance < bestDistance ) {
        bestDistance = distance;
        bestEmbedding = embedding;
      }
    }

    return bestEmbedding;
  }

  public static getDisplayEmbedding(
    sourcePatternBoard: TPatternBoard,
    boardPatternBoard: BoardPatternBoard,
    largeBoard: TBoard,
    embedding: Embedding,
  ): DisplayEmbedding {

    const tightBounds = DisplayEmbedding.getEmbeddingBounds( sourcePatternBoard, boardPatternBoard, embedding );

    // TODO: do this improved TBoard handling for AnnotationNode(!), then get rid of the face filtering stuff

    const expandedBoardBounds = tightBounds.dilated( 0.5 ); // TODO: we might want to update this to be larger

    const includedBoardFaces = largeBoard.faces.filter( face => {
      const faceBounds = Bounds2.NOTHING.copy();
      face.vertices.forEach( vertex => faceBounds.addPoint( vertex.viewCoordinates ) );
      return expandedBoardBounds.intersectsBounds( faceBounds );
    } );
    const includedBoardVertices = largeBoard.vertices.filter( vertex => vertex.faces.some( face => includedBoardFaces.includes( face ) ) );

    const boardDescriptor = createBoardDescriptor( {
      vertices: includedBoardVertices.map( vertex => {
        return {
          logicalCoordinates: vertex.logicalCoordinates,
          viewCoordinates: vertex.viewCoordinates
        };
      } ),
      faces: includedBoardFaces.map( face => {
        return {
          logicalCoordinates: face.logicalCoordinates,
          vertices: face.vertices.map( vertex => {
            return {
              logicalCoordinates: vertex.logicalCoordinates,
              viewCoordinates: vertex.viewCoordinates
            };
          } )
        };
      } )
    } );

    const smallBoard = new BaseBoard( boardDescriptor );

    const epsilon = 1e-6;

    const toSmallFaceMap = new Map<TFace, TFace>( includedBoardFaces.map( ( face, index ) => {
      const smallFace = smallBoard.faces.find( f => f.viewCoordinates.equalsEpsilon( face.viewCoordinates, epsilon ) )!;
      assertEnabled() && assert( smallFace );

      return [ face, smallFace ];
    } ) );

    const toSmallEdgeMap = new Map<TEdge, TEdge>( largeBoard.edges.map( edge => {
      const smallEdge = smallBoard.edges.find( e => {
        return ( e.start.viewCoordinates.equalsEpsilon( edge.start.viewCoordinates, epsilon ) && e.end.viewCoordinates.equalsEpsilon( edge.end.viewCoordinates, epsilon ) ) ||
               ( e.start.viewCoordinates.equalsEpsilon( edge.end.viewCoordinates, epsilon ) && e.end.viewCoordinates.equalsEpsilon( edge.start.viewCoordinates, epsilon ) );
      } ) ?? null;

      return smallEdge ? [ edge, smallEdge ] : null;
    } ).filter( e => e !== null ) as [ TEdge, TEdge ][] );

    const toSmallSectorMap = new Map<TSector, TSector>( largeBoard.halfEdges.map( sector => {
      const smallSector = smallBoard.halfEdges.find( s => {
        return s.start.viewCoordinates.equalsEpsilon( sector.start.viewCoordinates, epsilon ) && s.end.viewCoordinates.equalsEpsilon( sector.end.viewCoordinates, epsilon );
      } ) ?? null;

      return smallSector ? [ sector, smallSector ] : null;
    } ).filter( e => e !== null ) as [ TSector, TSector ][] );

    assertEnabled() && assert( embedding );

    return new DisplayEmbedding(
      sourcePatternBoard,
      boardPatternBoard,
      largeBoard,
      embedding,
      smallBoard,
      toSmallFaceMap,
      toSmallEdgeMap,
      toSmallSectorMap,
      tightBounds,
      expandedBoardBounds,
    );
  }
}