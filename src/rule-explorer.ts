import { Bounds2, Range } from 'phet-lib/dot';
import { AlignBox, Display, FireListener, GridBox, HBox, Node, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { DerivedProperty, Multilink, Property } from 'phet-lib/axon';
import { getGeneralEdgeGroup } from './model/pattern/rule-group/getGeneralEdgeGroup.ts';
import _ from './workarounds/_.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import { Enumeration, EnumerationValue, Orientation, platform } from 'phet-lib/phet-core';
import { LocalStorageBooleanProperty, LocalStorageEnumerationProperty, LocalStorageNullableEnumerationProperty, LocalStorageNumberProperty } from './util/localStorage.ts';
import { getGeneralColorGroup } from './model/pattern/rule-group/getGeneralColorGroup.ts';
import { getGeneralEdgeColorGroup } from './model/pattern/rule-group/getGeneralEdgeColorGroup.ts';
import { getGeneralEdgeSectorGroup } from './model/pattern/rule-group/getGeneralEdgeSectorGroup.ts';
import { getGeneralAllGroup } from './model/pattern/rule-group/getGeneralAllGroup.ts';
import { UIText } from './view/UIText.ts';
import { UILabeledVerticalAquaRadioButtonGroup } from './view/UILabeledVerticalAquaRadioButtonGroup.ts';
import { UITextCheckbox } from './view/UITextCheckbox.ts';
import { standardCairoBoard, standardDeltoidalTrihexagonalBoard, standardElongatedTriangularBoard, standardFloretPentagonalBoard, standardHexagonalBoard, standardPortugalBoard, standardPrismaticPentagonalBoard, standardRhombilleBoard, standardRhombitrihexagonalBoard, standardSnubSquareBoard, standardSquareBoard, standardTriangularBoard, standardTrihexagonalBoard } from './model/pattern/patternBoards.ts';
import { TBoard } from './model/board/core/TBoard.ts';
import { BoardPatternBoard } from './model/pattern/BoardPatternBoard.ts';
import { TPatternBoard } from './model/pattern/TPatternBoard.ts';
import { Embedding } from './model/pattern/Embedding.ts';
import { computeEmbeddings } from './model/pattern/computeEmbeddings.ts';
import { ArrowButton, Slider } from 'phet-lib/sun';
import { copyToClipboard } from './util/copyToClipboard.ts';
import { TEdge } from './model/board/core/TEdge.ts';
import { TPatternVertex } from './model/pattern/TPatternVertex.ts';
import { TPatternFace } from './model/pattern/TPatternFace.ts';
import { createBoardDescriptor } from './model/board/core/createBoardDescriptor.ts';
import { BaseBoard } from './model/board/core/BaseBoard.ts';
import { TFace } from './model/board/core/TFace.ts';
import { TSector } from './model/data/sector-state/TSector.ts';
import { FeatureSet } from './model/pattern/feature/FeatureSet.ts';
import { CompleteData } from './model/data/combined/CompleteData.ts';
import { FaceFeature } from './model/pattern/feature/FaceFeature.ts';
import { TPatternEdge } from './model/pattern/TPatternEdge.ts';
import { TPatternSector } from './model/pattern/TPatternSector.ts';
import { BlackEdgeFeature } from './model/pattern/feature/BlackEdgeFeature.ts';
import { RedEdgeFeature } from './model/pattern/feature/RedEdgeFeature.ts';
import EdgeState from './model/data/edge-state/EdgeState.ts';
import { SectorNotZeroFeature } from './model/pattern/feature/SectorNotZeroFeature.ts';
import SectorState from './model/data/sector-state/SectorState.ts';
import { SectorNotOneFeature } from './model/pattern/feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from './model/pattern/feature/SectorNotTwoFeature.ts';
import { SectorOnlyOneFeature } from './model/pattern/feature/SectorOnlyOneFeature.ts';
import { safeSolve } from './model/solver/safeSolve.ts';
import { FaceColorDualFeature } from './model/pattern/feature/FaceColorDualFeature.ts';
import { FaceColorMakeSameAction } from './model/data/face-color/FaceColorMakeSameAction.ts';
import { getFaceColorPointer } from './model/data/face-color/FaceColorPointer.ts';
import { FaceColorMakeOppositeAction } from './model/data/face-color/FaceColorMakeOppositeAction.ts';

// Load with `http://localhost:5173/rules.html?debugger`

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
  allowSceneOverflow: false,
  accessibility: true,
  backgroundColor: '#333',

  assumeFullWindow: true,
  listenToOnlyElement: false
} );
document.body.appendChild( display.domElement );

window.oncontextmenu = e => e.preventDefault();

export const layoutBoundsProperty = new Property( new Bounds2( 0, 0, window.innerWidth, window.innerHeight ) );

class CollectionMode extends EnumerationValue {

  public static readonly EDGE = new CollectionMode();
  public static readonly COLOR = new CollectionMode();
  public static readonly EDGE_COLOR = new CollectionMode();
  public static readonly EDGE_SECTOR = new CollectionMode();
  public static readonly ALL = new CollectionMode();

  public static readonly enumeration = new Enumeration( CollectionMode );
}

class HighlanderMode extends EnumerationValue {

  public static readonly REGULAR = new HighlanderMode();
  public static readonly HIGHLANDER = new HighlanderMode();
  public static readonly ALL = new HighlanderMode();

  public static readonly enumeration = new Enumeration( HighlanderMode );
}

class DisplayTiling extends EnumerationValue {
  public constructor(
    public readonly displayName: string,
    public readonly board: TBoard,
    public readonly boardPatternBoard: BoardPatternBoard,
  ) {
    super();
  }

  public static readonly SQUARE = new DisplayTiling( 'Square', standardSquareBoard, new BoardPatternBoard( standardSquareBoard ) );
  public static readonly HEXAGONAL = new DisplayTiling( 'Hexagonal', standardHexagonalBoard, new BoardPatternBoard( standardHexagonalBoard ) );
  public static readonly CAIRO = new DisplayTiling( 'Cairo', standardCairoBoard, new BoardPatternBoard( standardCairoBoard ) );
  public static readonly TRIANGULAR = new DisplayTiling( 'Triangular', standardTriangularBoard, new BoardPatternBoard( standardTriangularBoard ) );
  public static readonly RHOMBILLE = new DisplayTiling( 'Rhombille', standardRhombilleBoard, new BoardPatternBoard( standardRhombilleBoard ) );
  public static readonly SNUB_SQUARE = new DisplayTiling( 'Snub Square', standardSnubSquareBoard, new BoardPatternBoard( standardSnubSquareBoard ) );
  public static readonly TRIHEXAGONAL = new DisplayTiling( 'Trihexagonal', standardTrihexagonalBoard, new BoardPatternBoard( standardTrihexagonalBoard ) );
  public static readonly FLORET_PENTAGONAL = new DisplayTiling( 'Floret Pentagonal', standardFloretPentagonalBoard, new BoardPatternBoard( standardFloretPentagonalBoard ) );
  public static readonly DELTOIDAL_TRIHEXAGONAL = new DisplayTiling( 'Deltoidal Trihexagonal', standardDeltoidalTrihexagonalBoard, new BoardPatternBoard( standardDeltoidalTrihexagonalBoard ) );
  public static readonly PORTUGAL = new DisplayTiling( 'Portugal', standardPortugalBoard, new BoardPatternBoard( standardPortugalBoard ) );
  public static readonly RHOMBITRIHEXAGONAL = new DisplayTiling( 'Rhombitrihexagonal', standardRhombitrihexagonalBoard, new BoardPatternBoard( standardRhombitrihexagonalBoard ) );
  public static readonly PRISMATIC_PENTAGONAL = new DisplayTiling( 'Prismatic Pentagonal', standardPrismaticPentagonalBoard, new BoardPatternBoard( standardPrismaticPentagonalBoard ) );
  public static readonly ELONGATED_TRIANGULAR = new DisplayTiling( 'Elongated Triangular', standardElongatedTriangularBoard, new BoardPatternBoard( standardElongatedTriangularBoard ) );

  public static readonly enumeration = new Enumeration( DisplayTiling );
}

class DisplayEmbedding {

  public constructor(
    public readonly patternBoard: TPatternBoard,
    public readonly displayTiling: DisplayTiling,
    public readonly embedding: Embedding,
    public readonly smallBoard: TBoard,
    public readonly toSmallFaceMap: Map<TFace, TFace>,
    public readonly toSmallEdgeMap: Map<TEdge, TEdge>,
    public readonly toSmallSectorMap: Map<TSector, TSector>,
  ) {}

  public mapFace( face: TPatternFace ): TFace | null {
    const embeddedFace = this.embedding.mapFace( face );
    const largeFace = this.displayTiling.boardPatternBoard.getFace( embeddedFace );
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
    const largeEdges = embeddedEdges.map( embeddedEdge => this.displayTiling.boardPatternBoard.getEdge( embeddedEdge ) );
    return largeEdges.map( largeEdge => {
      const smallEdge = this.toSmallEdgeMap.get( largeEdge )!;
      assertEnabled() && assert( smallEdge );

      return smallEdge;
    } );
  }

  public mapSector( sector: TPatternSector ): TSector {
    const embeddedSector = this.embedding.mapSector( sector );
    const largeSector = this.displayTiling.boardPatternBoard.getSector( embeddedSector );
    const smallSector = this.toSmallSectorMap.get( largeSector )!;
    assertEnabled() && assert( smallSector );

    return smallSector;
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

  public static getBest( patternBoard: TPatternBoard, displayTiling: DisplayTiling ): DisplayEmbedding | null {
    const embeddings = computeEmbeddings( patternBoard, displayTiling.boardPatternBoard );

    if ( embeddings.length === 0 ) {
      return null;
    }

    const displayTilingBounds = Bounds2.NOTHING.copy();
    displayTiling.board.vertices.forEach( vertex => displayTilingBounds.addPoint( vertex.viewCoordinates ) );

    const displayTilingCenter = displayTilingBounds.center;

    let bestEmbedding: Embedding | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestBounds: Bounds2 | null = null;

    for ( let i = 0; i < embeddings.length; i++ ) {
      const embedding = embeddings[ i ];

      const embeddingBounds = Bounds2.NOTHING.copy();

      const addPatternVertex = ( vertex: TPatternVertex ) => {
        embeddingBounds.addPoint( displayTiling.boardPatternBoard.getVertex( embedding.mapVertex( vertex ) ).viewCoordinates );
      };
      patternBoard.vertices.forEach( addPatternVertex );

      const addPatternFace = ( face: TPatternFace ) => {
        const mappedFace = displayTiling.boardPatternBoard.getFace( embedding.mapFace( face ) );
        if ( mappedFace ) {
          mappedFace.vertices.forEach( vertex => embeddingBounds.addPoint( vertex.viewCoordinates ) );
        }
      };
      patternBoard.faces.forEach( addPatternFace );

      patternBoard.edges.forEach( edge => {
        let edges: TEdge[];
        if ( edge.isExit ) {
          edges = embedding.mapExitEdges( edge ).map( exitEdge => displayTiling.boardPatternBoard.getEdge( exitEdge ) );
        }
        else {
          edges = [ displayTiling.boardPatternBoard.getEdge( embedding.mapNonExitEdge( edge ) ) ];
        }
        edges.forEach( mappedEdge => {
          embeddingBounds.addPoint( mappedEdge.start.viewCoordinates );
          embeddingBounds.addPoint( mappedEdge.end.viewCoordinates );
        } );
      } );

      const embeddingCenter = embeddingBounds.center;

      const distance = displayTilingCenter.distance( embeddingCenter );

      if ( distance < bestDistance ) {
        bestDistance = distance;
        bestEmbedding = embedding;
        bestBounds = embeddingBounds;
      }
    }

    // TODO: do this improved TBoard handling for AnnotationNode(!), then get rid of the face filtering stuff

    const expandedBoardBounds = bestBounds!.dilated( 0.5 ); // TODO: we might want to update this to be larger

    const includedBoardFaces = displayTiling.board.faces.filter( face => {
      const faceBounds = Bounds2.NOTHING.copy();
      face.vertices.forEach( vertex => faceBounds.addPoint( vertex.viewCoordinates ) );
      return expandedBoardBounds.intersectsBounds( faceBounds );
    } );
    const includedBoardVertices = displayTiling.board.vertices.filter( vertex => vertex.faces.some( face => includedBoardFaces.includes( face ) ) );

    const boardDescriptor = createBoardDescriptor( {
      vertices: includedBoardVertices.map( vertex => {
        return {
          logicalCoordinates: vertex.logicalCoordinates,
          viewCoordinates: vertex.viewCoordinates,
        };
      } ),
      faces: includedBoardFaces.map( face => {
        return {
          logicalCoordinates: face.logicalCoordinates,
          vertices: face.vertices.map( vertex => {
            return {
              logicalCoordinates: vertex.logicalCoordinates,
              viewCoordinates: vertex.viewCoordinates,
            };
          } ),
        };
      } ),
    } );

    const smallBoard = new BaseBoard( boardDescriptor );

    const epsilon = 1e-6;

    const toSmallFaceMap = new Map<TFace, TFace>( includedBoardFaces.map( ( face, index ) => {
      const smallFace = smallBoard.faces.find( f => f.viewCoordinates.equalsEpsilon( face.viewCoordinates, epsilon ) )!;
      assertEnabled() && assert( smallFace );

      return [ face, smallFace ];
    } ) );

    const toSmallEdgeMap = new Map<TEdge, TEdge>( displayTiling.board.edges.map( edge => {
      const smallEdge = smallBoard.edges.find( e => {
        return ( e.start.viewCoordinates.equalsEpsilon( edge.start.viewCoordinates, epsilon ) && e.end.viewCoordinates.equalsEpsilon( edge.end.viewCoordinates, epsilon ) ) ||
               ( e.start.viewCoordinates.equalsEpsilon( edge.end.viewCoordinates, epsilon ) && e.end.viewCoordinates.equalsEpsilon( edge.start.viewCoordinates, epsilon ) );
      } ) ?? null;

      return smallEdge ? [ edge, smallEdge ] : null;
    } ).filter( e => e !== null ) as [ TEdge, TEdge ][] );

    const toSmallSectorMap = new Map<TSector, TSector>( displayTiling.board.halfEdges.map( sector => {
      const smallSector = smallBoard.halfEdges.find( s => {
        return s.start.viewCoordinates.equalsEpsilon( sector.start.viewCoordinates, epsilon ) && s.end.viewCoordinates.equalsEpsilon( sector.end.viewCoordinates, epsilon );
      } ) ?? null;

      return smallSector ? [ sector, smallSector ] : null;
    } ).filter( e => e !== null ) as [ TSector, TSector ][] );

    assertEnabled() && assert( bestEmbedding );

    return new DisplayEmbedding(
      patternBoard,
      displayTiling,
      bestEmbedding!,
      smallBoard,
      toSmallFaceMap,
      toSmallEdgeMap,
      toSmallSectorMap,
    );
  }
}

// TODO: add reset on fail conditions

// TODO: precompute these, fix up Embedding, and serialize/deserialize them (so it loads immediately)
const embeddingMap = new Map<TPatternBoard, Map<DisplayTiling, DisplayEmbedding | null>>();
const getBestDisplayEmbedding = ( patternBoard: TPatternBoard, displayTiling: DisplayTiling ): DisplayEmbedding | null => {
  let patternMap = embeddingMap.get( patternBoard );

  if ( !patternMap ) {
    patternMap = new Map();
    embeddingMap.set( patternBoard, patternMap );
  }

  let embedding = patternMap.get( displayTiling );

  if ( embedding === undefined ) {
    embedding = DisplayEmbedding.getBest( patternBoard, displayTiling );

    patternMap.set( displayTiling, embedding );
  }

  return embedding;
};

( async () => {

  const collectionModeProperty = new LocalStorageEnumerationProperty( 'collectionModeProperty', CollectionMode.EDGE );
  const highlanderModeProperty = new LocalStorageEnumerationProperty( 'highlanderModeProperty', HighlanderMode.REGULAR );
  const includeFallbackProperty = new LocalStorageBooleanProperty( 'includeFallbackProperty', false );
  const displayTilingProperty = new LocalStorageNullableEnumerationProperty<DisplayTiling>( 'displayTilingProperty', DisplayTiling.enumeration, null );

  const baseGroupProperty = new DerivedProperty( [ collectionModeProperty ], collectionMode => {
    switch ( collectionMode ) {
      case CollectionMode.EDGE:
        return getGeneralEdgeGroup();
      case CollectionMode.COLOR:
        return getGeneralColorGroup();
      case CollectionMode.EDGE_COLOR:
        return getGeneralEdgeColorGroup();
      case CollectionMode.EDGE_SECTOR:
        return getGeneralEdgeSectorGroup();
      case CollectionMode.ALL:
        return getGeneralAllGroup();
      default:
        throw new Error( `unhandled collection mode: ${collectionMode}` );
    }
  } );

  const groupProperty = new DerivedProperty( [
    baseGroupProperty,
    highlanderModeProperty,
    includeFallbackProperty,
    displayTilingProperty,
  ], (
    baseGroup,
    highlanderMode,
    includeFallback,
    displayTiling,
  ) => {
    let group = baseGroup;

    if ( highlanderMode === HighlanderMode.REGULAR ) {
      group = group.withoutHighlander();
    }
    else if ( highlanderMode === HighlanderMode.HIGHLANDER ) {
      group = group.withOnlyHighlander();
    }

    if ( !includeFallback ) {
      group = group.withoutFallback();
    }

    if ( displayTiling ) {
      group = group.withPatternBoardFilter( patternBoard => {
        return getBestDisplayEmbedding( patternBoard, displayTiling ) !== null;
      } );
    }

    return group;
  } );



  const rulesPerPage = 30;

  const pageIndexRangeProperty = new DerivedProperty( [ groupProperty ], group => new Range(
    0,
    Math.max( 0, Math.ceil( group.size / rulesPerPage ) - 1 )
  ) );

  const pageIndexProperty = new LocalStorageNumberProperty( 'pageIndexProperty', 0 );

  const rulesProperty = new DerivedProperty( [
    groupProperty,
    pageIndexProperty,
  ], (
    group,
    pageIndex,
  ) => {
    const baseIndex = pageIndex * rulesPerPage;

    const minIndex = Math.min( baseIndex, group.size );
    const maxIndex = Math.min( baseIndex + rulesPerPage, group.size );

    console.log( group.size / rulesPerPage );
    return _.range( minIndex, maxIndex ).map( i => group.getRule( i ) );
  } );

  const collectionRadioButtonGroup = new UILabeledVerticalAquaRadioButtonGroup( 'Collection', collectionModeProperty, [
    {
      value: CollectionMode.EDGE,
      labelContent: 'Edge',
      createNode: () => new UIText( 'Edge' ),
    },
    {
      value: CollectionMode.COLOR,
      labelContent: 'Color',
      createNode: () => new UIText( 'Color' ),
    },
    {
      value: CollectionMode.EDGE_COLOR,
      labelContent: 'Edge + Color',
      createNode: () => new UIText( 'Edge + Color' ),
    },
    {
      value: CollectionMode.EDGE_SECTOR,
      labelContent: 'Edge + Sector',
      createNode: () => new UIText( 'Edge + Sector' ),
    },
    {
      value: CollectionMode.ALL,
      labelContent: 'Edge + Color + Sector',
      createNode: () => new UIText( 'Edge + Color + Sector' ),
    },
  ] );

  const highlanderRadioButtonGroup = new UILabeledVerticalAquaRadioButtonGroup( 'Highlander', highlanderModeProperty, [
    {
      value: HighlanderMode.REGULAR,
      labelContent: 'Regular',
      createNode: () => new UIText( 'Regular' ),
    },
    {
      value: HighlanderMode.HIGHLANDER,
      labelContent: 'Highlander Only',
      createNode: () => new UIText( 'Highlander Only' ),
    },
    // {
    //   value: HighlanderMode.ALL,
    //   labelContent: 'All',
    //   createNode: () => new UIText( 'All' ),
    // },
  ] );

  const fallbackCheckbox = new UITextCheckbox( 'Include Fallback', includeFallbackProperty );

  const tilingRadioButtonGroup = new UILabeledVerticalAquaRadioButtonGroup( 'Compatible Tiling', displayTilingProperty, [
    {
      value: null,
      labelContent: 'All',
      createNode: () => new UIText( 'All' ),
    },
    ...DisplayTiling.enumeration.values.map( displayTiling => {
      return {
        value: displayTiling,
        labelContent: displayTiling.displayName,
        createNode: () => new UIText( displayTiling.displayName ),
      };
    } )
  ] );

  const previousPageButton = new ArrowButton( 'left', () => {
    pageIndexProperty.value--;
  }, {
    touchAreaXDilation: 5,
    touchAreaYDilation: 5,
    enabledProperty: new DerivedProperty( [ pageIndexProperty, pageIndexRangeProperty ], ( pageIndex, pageIndexRange ) => {
      return pageIndex > pageIndexRange.min;
    } )
  } );

  const nextPageButton = new ArrowButton( 'right', () => {
    pageIndexProperty.value++;
  }, {
    touchAreaXDilation: 5,
    touchAreaYDilation: 5,
    enabledProperty: new DerivedProperty( [ pageIndexProperty, pageIndexRangeProperty ], ( pageIndex, pageIndexRange ) => {
      return pageIndex < pageIndexRange.max;
    } )
  } );

  const pageSlider = new Slider( pageIndexProperty, new DerivedProperty( [ pageIndexRangeProperty ], range => new Range( range.min, Math.max( 0.1, range.max ) ) ), {
    orientation: Orientation.HORIZONTAL,
    constrainValue: value => Math.round( value ),
  } );

  const pageNumberText = new UIText( new DerivedProperty( [ pageIndexProperty ], pageIndex => `Page ${pageIndex}` ), {
    fontWeight: 'bold'
  } );

  const MARGIN = 10;
  const HORIZONTAL_GAP = 30;

  const leftBox = new VBox( {
    align: 'left',
    spacing: 20,
    children: [
      collectionRadioButtonGroup,
      highlanderRadioButtonGroup,
      fallbackCheckbox,
      tilingRadioButtonGroup,
      new VBox( {
        spacing: 5,
        children: [
          pageNumberText,
          new HBox( {
            spacing: 5,
            children: [
              previousPageButton,
              pageSlider,
              nextPageButton,
            ]
          } ),
        ]
      } ),
    ]
  } );

  const rulesGridBox = new GridBox( {
    xSpacing: 40,
    ySpacing: 20,
    // xAlign: 'origin',
    // yAlign: 'origin',
  } );

  Multilink.multilink( [ rulesProperty, layoutBoundsProperty ], ( rules, layoutBounds ) => {
    const availableHeight = layoutBounds.height - 2 * MARGIN;

    leftBox.maxHeight = availableHeight;

    const availableWidth = layoutBounds.width - 2 * MARGIN - leftBox.width - HORIZONTAL_GAP;

    const oldChildren = rulesGridBox.children.slice();

    if ( rules.length ) {
      rulesGridBox.children = rules.map( rule => {
        const planarPatternMap = planarPatternMaps.get( rule.patternBoard )!;
        assertEnabled() && assert( planarPatternMap );



        return new PatternRuleNode( rule, planarPatternMap, {
          cursor: 'pointer',
          inputListeners: [
            new FireListener( {
              fire: () => {
                copyToClipboard( rule.getBinaryIdentifier() );
                console.log( rule.getBinaryIdentifier() );

                // TODO: GO TO the link bit
              }
            } )
          ]
        } );
      } );
    }
    else {
      rulesGridBox.removeAllChildren();
    }

    oldChildren.forEach( child => child.dispose() );

    if ( rules.length ) {
      // TODO: This might not be worth the CPU?
      let bestScale = 0;
      let bestColumns = 0;
      _.range( 3, 11 ).forEach( columns => {
        rulesGridBox.autoColumns = columns;

        const idealScale = Math.min(
          availableWidth / rulesGridBox.localBounds.width,
          availableHeight / rulesGridBox.localBounds.height,
        );

        if ( idealScale > bestScale ) {
          bestScale = idealScale;
          bestColumns = columns;
        }
      } );

      rulesGridBox.autoColumns = bestColumns;
      rulesGridBox.setScaleMagnitude( bestScale );
    }
  } );

  scene.addChild( new AlignBox( new HBox( {
    spacing: HORIZONTAL_GAP,
    align: 'top',
    children: [
      leftBox,
      rulesGridBox,
    ]
  } ), {
    margin: MARGIN,
    xAlign: 'left',
    yAlign: 'top',
    alignBoundsProperty: layoutBoundsProperty,
  } ) );





  display.initializeEvents();

  let resizePending = true;
  const resize = () => {
    resizePending = false;

    const layoutBounds = new Bounds2( 0, 0, window.innerWidth, window.innerHeight );
    display.setWidthHeight( layoutBounds.width, layoutBounds.height );
    layoutBoundsProperty.value = layoutBounds;

    if ( platform.mobileSafari ) {
      window.scrollTo( 0, 0 );
    }
  };

  const resizeListener = () => { resizePending = true; };
  $( window ).resize( resizeListener );
  window.addEventListener( 'resize', resizeListener );
  window.addEventListener( 'orientationchange', resizeListener );
  window.visualViewport && window.visualViewport.addEventListener( 'resize', resizeListener );
  resize();

  display.updateOnRequestAnimationFrame( dt => {
    if ( resizePending ) {
      resize();
    }

    // TODO: step?
  } );

} )();
