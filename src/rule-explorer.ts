import { AlignBox, Display, GridBox, HBox, Node, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { DerivedProperty, NumberProperty, Property } from 'phet-lib/axon';
import { getGeneralEdgeGroup } from './model/pattern/rule-group/getGeneralEdgeGroup.ts';
import _ from './workarounds/_.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import { Bounds2 } from 'phet-lib/dot';
import { Enumeration, EnumerationValue, platform } from 'phet-lib/phet-core';
import { LocalStorageBooleanProperty, LocalStorageEnumerationProperty, LocalStorageNullableEnumerationProperty } from './util/localStorage.ts';
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

// TODO: precompute these, fix up Embedding, and serialize/deserialize them (so it loads immediately)
const embeddingMap = new Map<TPatternBoard, Map<DisplayTiling, Embedding | null>>();
const getBestEmbedding = ( patternBoard: TPatternBoard, displayTiling: DisplayTiling ): Embedding | null => {
  let patternMap = embeddingMap.get( patternBoard );

  if ( !patternMap ) {
    patternMap = new Map();
    embeddingMap.set( patternBoard, patternMap );
  }

  let embedding = patternMap.get( displayTiling );

  if ( embedding === undefined ) {
    const embeddings = computeEmbeddings( patternBoard, displayTiling.boardPatternBoard );
    embedding = embeddings.length > 0 ? embeddings[ 0 ] : null;
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

  const pageIndexProperty = new NumberProperty( 0 );

  const columns = 4;
  const rows = 7;

  const rulesPerPage = rows * columns;

  const rulesProperty = new DerivedProperty( [
    baseGroupProperty,
    highlanderModeProperty,
    includeFallbackProperty,
    displayTilingProperty,
    pageIndexProperty
  ], (
    baseGroup,
    highlanderMode,
    includeFallback,
    displayTiling,
    pageIndex,
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
        return getBestEmbedding( patternBoard, displayTiling ) !== null;
      } );
    }

    const baseIndex = pageIndex * rulesPerPage;

    const minIndex = Math.min( baseIndex, group.size );
    const maxIndex = Math.min( baseIndex + rulesPerPage, group.size );

    console.log( baseGroup.size / rulesPerPage );
    return _.range( minIndex, maxIndex ).map( i => group.getRule( i + pageIndex * rulesPerPage ) );
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
      labelContent: 'Edge Color',
      createNode: () => new UIText( 'Edge Color' ),
    },
    {
      value: CollectionMode.EDGE_SECTOR,
      labelContent: 'Edge Sector',
      createNode: () => new UIText( 'Edge Sector' ),
    },
    {
      value: CollectionMode.ALL,
      labelContent: 'All',
      createNode: () => new UIText( 'All' ),
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
      labelContent: 'Highlander',
      createNode: () => new UIText( 'Highlander' ),
    },
    {
      value: HighlanderMode.ALL,
      labelContent: 'All',
      createNode: () => new UIText( 'All' ),
    },
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

  const leftBox = new VBox( {
    align: 'left',
    spacing: 20,
    children: [
      collectionRadioButtonGroup,
      highlanderRadioButtonGroup,
      fallbackCheckbox,
      tilingRadioButtonGroup,
    ]
  } );

  // TODO: SCALE the gridbox(!)
  const rulesGridBox = new GridBox( {
    xSpacing: 40,
    ySpacing: 20,
    // xAlign: 'origin',
    // yAlign: 'origin',
    autoColumns: columns,
  } );

  rulesProperty.link( rules => {
    const oldChildren = rulesGridBox.children.slice();

    rulesGridBox.children = rules.map( rule => {
      const planarPatternMap = planarPatternMaps.get( rule.patternBoard )!;
      assertEnabled() && assert( planarPatternMap );
      return new PatternRuleNode( rule, planarPatternMap );
    } );

    // TODO: gridbox scaling!

    oldChildren.forEach( child => child.dispose() );
  } );

  scene.addChild( new AlignBox( new HBox( {
    spacing: 30,
    align: 'top',
    children: [
      leftBox,
      rulesGridBox,
    ]
  } ), {
    margin: 10,
    xAlign: 'left',
    yAlign: 'top',
    alignBoundsProperty: layoutBoundsProperty,
  } ) );

} )();
