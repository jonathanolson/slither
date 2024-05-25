import { Bounds2, Range } from 'phet-lib/dot';
import { AlignBox, Display, FireListener, GridBox, HBox, Node, Rectangle, VBox } from 'phet-lib/scenery';
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
import { ArrowButton, Slider } from 'phet-lib/sun';
import { copyToClipboard } from './util/copyToClipboard.ts';
import { DisplayEmbedding } from './model/pattern/DisplayEmbedding.ts';
import { EmbeddedPatternRuleNode } from './view/pattern/EmbeddedPatternRuleNode.ts';

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
    embedding = DisplayEmbedding.getBest( patternBoard, displayTiling.boardPatternBoard, displayTiling.board );

    patternMap.set( displayTiling, embedding );
  }

  return embedding;
};

( async () => {

  const collectionModeProperty = new LocalStorageEnumerationProperty( 'collectionModeProperty', CollectionMode.EDGE );
  const highlanderModeProperty = new LocalStorageEnumerationProperty( 'highlanderModeProperty', HighlanderMode.REGULAR );
  const includeFallbackProperty = new LocalStorageBooleanProperty( 'includeFallbackProperty', false );
  const displayTilingProperty = new LocalStorageNullableEnumerationProperty<DisplayTiling>( 'displayTilingProperty', DisplayTiling.enumeration, null );
  const showEmbeddedProperty = new LocalStorageBooleanProperty( 'showEmbeddedProperty', false );

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


  // TODO: boo, can we change this?
  const rulesPerPage = 6;

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

  const showEmbeddedCheckbox = new UITextCheckbox( 'Show Embedded', showEmbeddedProperty );

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

  const pageNumberBox = new VBox( {
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
  } );

  const leftBox = new VBox( {
    align: 'left',
    spacing: 20,
    children: [
      collectionRadioButtonGroup,
      highlanderRadioButtonGroup,
      fallbackCheckbox,
      tilingRadioButtonGroup,
      showEmbeddedCheckbox,
      pageNumberBox,
    ]
  } );

  const MARGIN = 10;
  const HORIZONTAL_GAP = 30;

  const rulesGridBox = new GridBox( {
    xSpacing: 40,
    ySpacing: 20,
    // xAlign: 'origin',
    // yAlign: 'origin',
  } );

  Multilink.multilink( [
    rulesProperty,
    layoutBoundsProperty,
    displayTilingProperty, // TODO: it seems like our rulesProperty will ALSO change on this, so we have unnecessary performance hits
    showEmbeddedProperty,
  ], (
    rules,
    layoutBounds,
    displayTiling,
    showEmbedded,
  ) => {
    const availableHeight = layoutBounds.height - 2 * MARGIN;

    leftBox.maxHeight = availableHeight;

    const availableWidth = layoutBounds.width - 2 * MARGIN - leftBox.width - HORIZONTAL_GAP;

    const oldChildren = rulesGridBox.children.slice();

    if ( rules.length ) {
      rulesGridBox.children = rules.map( rule => {
        const planarPatternMap = planarPatternMaps.get( rule.patternBoard )!;
        assertEnabled() && assert( planarPatternMap );

        const inputListener = new FireListener( {
          fire: () => {
            copyToClipboard( rule.getBinaryIdentifier() );
            console.log( rule.getBinaryIdentifier() );

            // TODO: GO TO the link bit
          }
        } );

        let displayEmbedding: DisplayEmbedding | null = null;
        if ( showEmbedded && displayTiling ) {
          displayEmbedding = getBestDisplayEmbedding( rule.patternBoard, displayTiling );
        }

        if ( displayEmbedding ) {
          return new EmbeddedPatternRuleNode( rule, displayEmbedding, {
            cursor: 'pointer',
            inputListeners: [ inputListener ],
            scale: 30, // TODO: this is the scale internally in PatternNode, move it out?
          } );
          // return new Rectangle( 0, 0, 2, 2, { fill: 'red' } );
        }
        else {
          return new PatternRuleNode( rule, planarPatternMap, {
            cursor: 'pointer',
            inputListeners: [ inputListener ],
          } );
        }
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
      _.range( 1, 11 ).forEach( columns => {
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
