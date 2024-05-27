import { Bounds2, Range } from 'phet-lib/dot';
import { AlignBox, Display, FireListener, GridBox, HBox, Node, Text, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { BooleanProperty, DerivedProperty, Multilink, Property } from 'phet-lib/axon';
import _ from './workarounds/_.ts';
import { planarPatternMaps } from './model/pattern/pattern-board/planar-map/planarPatternMaps.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import { Enumeration, EnumerationValue, Orientation, platform } from 'phet-lib/phet-core';
import { LocalStorageEnumerationProperty, LocalStorageNullableEnumerationProperty, LocalStorageNumberProperty } from './util/localStorage.ts';
import { UIText } from './view/UIText.ts';
import { UILabeledVerticalAquaRadioButtonGroup } from './view/UILabeledVerticalAquaRadioButtonGroup.ts';
import { ArrowButton, Panel, Slider } from 'phet-lib/sun';
import { DisplayEmbedding } from './model/pattern/embedding/DisplayEmbedding.ts';
import { EmbeddedPatternRuleNode } from './view/pattern/EmbeddedPatternRuleNode.ts';
import { basicSectorsPuzzleStyle, classicPuzzleStyle, currentPuzzleStyle, puzzleStyleFromProperty, sectorsWithColorsPuzzleStyle } from './view/puzzle/puzzleStyles.ts';
import { TPuzzleStyle } from './view/puzzle/TPuzzleStyle.ts';
import { availableThemes, currentTheme, themeProperty, uiFont } from './view/Theme.ts';
import { FaceFeature } from './model/pattern/feature/FaceFeature.ts';
import { RedEdgeFeature } from './model/pattern/feature/RedEdgeFeature.ts';
import { generalEdgeMixedGroup } from './model/pattern/collection/generalEdgeMixedGroup.ts';
import { generalEdgeColorMixedGroup } from './model/pattern/collection/generalEdgeColorMixedGroup.ts';
import { generalColorMixedGroup } from './model/pattern/collection/generalColorMixedGroup.ts';
import { generalEdgeSectorMixedGroup } from './model/pattern/collection/generalEdgeSectorMixedGroup.ts';
import { generalAllMixedGroup } from './model/pattern/collection/generalAllMixedGroup.ts';
import { DisplayTiling } from './view/pattern/DisplayTiling.ts';
import { getBestDisplayEmbedding } from './view/pattern/getBestDisplayEmbedding.ts';

// Load with `http://localhost:5173/rule-explorer?debugger`

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

currentPuzzleStyle.theme.uiBackgroundColorProperty.link( backgroundColor => {
  display.backgroundColor = backgroundColor;
} );

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

class FilterMode extends EnumerationValue {

  public static readonly NONE = new FilterMode();
  public static readonly ONLY_NUMBERS_AND_EXIT_RED = new FilterMode();

  public static readonly enumeration = new Enumeration( FilterMode );
}

class ViewStyleMode extends EnumerationValue {

  public static readonly CLASSIC = new ViewStyleMode();
  public static readonly GENERIC = new ViewStyleMode();
  public static readonly LINES = new ViewStyleMode();
  public static readonly COLORS = new ViewStyleMode();

  public static readonly enumeration = new Enumeration( ViewStyleMode );
}

// TODO: add reset on fail conditions
( async () => {

  const viewStyleModeProperty = new LocalStorageEnumerationProperty( 'viewStyleModeProperty', ViewStyleMode.CLASSIC );

  const explorerCurrentPuzzleStyle: TPuzzleStyle = puzzleStyleFromProperty( new DerivedProperty( [ viewStyleModeProperty ], viewStyle => {
    if ( viewStyle === ViewStyleMode.CLASSIC || viewStyle === ViewStyleMode.GENERIC ) {
      return classicPuzzleStyle;
    }
    else if ( viewStyle === ViewStyleMode.LINES ) {
      return basicSectorsPuzzleStyle;
    }
    else if ( viewStyle === ViewStyleMode.COLORS ) {
      return sectorsWithColorsPuzzleStyle;
    }
    else {
      throw new Error( `unhandled view style: ${viewStyle}` );
    }
  } ) );

  const collectionModeProperty = new LocalStorageEnumerationProperty( 'collectionModeProperty', CollectionMode.EDGE );
  const highlanderModeProperty = new LocalStorageEnumerationProperty( 'highlanderModeProperty', HighlanderMode.ALL );
  const filterModeProperty = new LocalStorageEnumerationProperty( 'filterModeProperty', FilterMode.NONE );
  const displayTilingProperty = new LocalStorageNullableEnumerationProperty<DisplayTiling>( 'displayTilingProperty', DisplayTiling.enumeration, null );

  const baseGroupProperty = new DerivedProperty( [ collectionModeProperty ], collectionMode => {
    switch ( collectionMode ) {
      case CollectionMode.EDGE:
        return generalEdgeMixedGroup;
      case CollectionMode.COLOR:
        return generalColorMixedGroup;
      case CollectionMode.EDGE_COLOR:
        return generalEdgeColorMixedGroup;
      case CollectionMode.EDGE_SECTOR:
        return generalEdgeSectorMixedGroup;
      case CollectionMode.ALL:
        return generalAllMixedGroup;
      default:
        throw new Error( `unhandled collection mode: ${collectionMode}` );
    }
  } );

  const groupProperty = new DerivedProperty( [
    baseGroupProperty,
    highlanderModeProperty,
    filterModeProperty,
    displayTilingProperty,
  ], (
    baseGroup,
    highlanderMode,
    filterMode,
    displayTiling,
  ) => {
    let group = baseGroup;

    const withoutHighlander = highlanderMode === HighlanderMode.REGULAR;
    const onlyHighlander = highlanderMode === HighlanderMode.HIGHLANDER;
    const filterTiling = !!displayTiling;
    const filterGeneral = filterMode !== FilterMode.NONE;

    if (
      withoutHighlander ||
      onlyHighlander ||
      filterTiling ||
      filterGeneral
    ) {
      group = group.filterIndex( ruleIndex => {
        if ( withoutHighlander && group.isRuleIndexHighlander( ruleIndex ) ) {
          return false;
        }
        if ( onlyHighlander && !group.isRuleIndexHighlander( ruleIndex ) ) {
          return false;
        }

        const rule = group.getRule( ruleIndex );

        if ( displayTiling && getBestDisplayEmbedding( rule.patternBoard, displayTiling ) === null ) {
          return false;
        }

        if ( filterMode === FilterMode.ONLY_NUMBERS_AND_EXIT_RED ) {
          const features = rule.inputFeatureSet.getFeaturesArray();
          if ( !features.every( feature => feature instanceof FaceFeature || ( feature instanceof RedEdgeFeature && feature.edge.isExit ) ) ) {
            return false;
          }
        }

        return true;
      } );
    }

    return group;
  } );

  // Don't allow showing collections that we can't with our current style
  Multilink.multilink( [ viewStyleModeProperty ], ( viewStyleMode ) => {
    const edgesVisible = true;
    const colorsVisible = viewStyleMode !== ViewStyleMode.CLASSIC && viewStyleMode !== ViewStyleMode.LINES;
    const sectorsVisible = viewStyleMode !== ViewStyleMode.CLASSIC;

    const currentMode = collectionModeProperty.value;

    const currentNeedsEdges = currentMode !== CollectionMode.COLOR;
    const currentNeedsColors = currentMode === CollectionMode.COLOR || currentMode === CollectionMode.EDGE_COLOR || currentMode === CollectionMode.ALL;
    const currentNeedsSectors = currentMode === CollectionMode.EDGE_SECTOR || currentMode === CollectionMode.ALL;

    if ( currentNeedsEdges && !edgesVisible ) {
      collectionModeProperty.value = CollectionMode.COLOR;
    }
    else {
      if ( currentNeedsColors && !colorsVisible ) {
        collectionModeProperty.value = currentMode === CollectionMode.ALL ? CollectionMode.EDGE_SECTOR : CollectionMode.EDGE;
      }
      if ( currentNeedsSectors && !sectorsVisible ) {
        collectionModeProperty.value = currentMode === CollectionMode.ALL ? CollectionMode.EDGE_COLOR : CollectionMode.EDGE;
      }
    }
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

    return _.range( minIndex, maxIndex ).map( i => group.getRule( i ) );
  } );

  const viewStyleNode = new UILabeledVerticalAquaRadioButtonGroup(
    'View Style',
    viewStyleModeProperty,
    [
      {
        value: ViewStyleMode.CLASSIC,
        createNode: () => new UIText( 'Classic' ),
        labelContent: 'Classic'
      },
      {
        value: ViewStyleMode.GENERIC,
        createNode: () => new UIText( 'Generic' ),
        labelContent: 'Generic'
      },
      {
        value: ViewStyleMode.LINES,
        createNode: () => new UIText( 'Lines' ),
        labelContent: 'Lines',
      },
      {
        value: ViewStyleMode.COLORS,
        createNode: () => new UIText( 'Colors' ),
        labelContent: 'Colors',
      },
    ]
  );

  const themeNode = new UILabeledVerticalAquaRadioButtonGroup(
    'Theme',
    themeProperty,
    availableThemes.slice( 0, 3 ).map( theme => {
      return {
        value: theme,
        createNode: () => new Text( theme.name, {
          font: uiFont,
          fill: currentTheme.uiForegroundColorProperty
        } ),
        a11yName: theme.name
      };
    } )
  );

  const collectionRadioButtonGroup = new UILabeledVerticalAquaRadioButtonGroup( 'Collection', collectionModeProperty, [
    {
      value: CollectionMode.EDGE,
      labelContent: 'Edge',
      createNode: () => new UIText( 'Edge' ),
      options: {
        enabledProperty: new BooleanProperty( true ),
      },
    },
    {
      value: CollectionMode.COLOR,
      labelContent: 'Color',
      createNode: () => new UIText( 'Color' ),
      options: {
        enabledProperty: new DerivedProperty( [ viewStyleModeProperty ], viewStyleMode => viewStyleMode !== ViewStyleMode.CLASSIC && viewStyleMode !== ViewStyleMode.LINES ),
      },
    },
    {
      value: CollectionMode.EDGE_COLOR,
      labelContent: 'Edge + Color',
      createNode: () => new UIText( 'Edge + Color' ),
      options: {
        enabledProperty: new DerivedProperty( [ viewStyleModeProperty ], viewStyleMode => viewStyleMode !== ViewStyleMode.CLASSIC && viewStyleMode !== ViewStyleMode.LINES ),
      },
    },
    {
      value: CollectionMode.EDGE_SECTOR,
      labelContent: 'Edge + Sector',
      createNode: () => new UIText( 'Edge + Sector' ),
      options: {
        enabledProperty: new DerivedProperty( [ viewStyleModeProperty ], viewStyleMode => viewStyleMode !== ViewStyleMode.CLASSIC ),
      },
    },
    {
      value: CollectionMode.ALL,
      labelContent: 'Edge + Color + Sector',
      createNode: () => new UIText( 'Edge + Color + Sector' ),
      options: {
        enabledProperty: new DerivedProperty( [ viewStyleModeProperty ], viewStyleMode => viewStyleMode !== ViewStyleMode.CLASSIC && viewStyleMode !== ViewStyleMode.LINES ),
      },
    },
  ] );

  const highlanderRadioButtonGroup = new UILabeledVerticalAquaRadioButtonGroup( 'Highlander', highlanderModeProperty, [
    {
      value: HighlanderMode.ALL,
      labelContent: 'All',
      createNode: () => new UIText( 'All' ),
    },
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
  ] );

  const filterRadioButtonGroup = new UILabeledVerticalAquaRadioButtonGroup( 'Filter', filterModeProperty, [
    {
      value: FilterMode.NONE,
      labelContent: 'None',
      createNode: () => new UIText( 'None' ),
    },
    {
      value: FilterMode.ONLY_NUMBERS_AND_EXIT_RED,
      labelContent: 'Only Numbers and Red',
      createNode: () => new UIText( 'Only Numbers and Red' ),
    },
  ] );

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

  const pageNumberText = new UIText( new DerivedProperty( [ pageIndexProperty, pageIndexRangeProperty ], ( pageIndex, pageIndexRange ) => `Page ${pageIndex} of ${pageIndexRange.max + 1}` ), {
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

  const leftBox = new Node( {
    children: [
      new VBox( {
        align: 'left',
        spacing: 20,
        children: [
          collectionRadioButtonGroup,
          highlanderRadioButtonGroup,
          filterRadioButtonGroup,
          tilingRadioButtonGroup,
          viewStyleNode,
          themeNode,
        ]
      } )
    ]
  } );

  const bottomBox = pageNumberBox;

  const MARGIN = 10;
  const HORIZONTAL_GAP = 30;
  const VERTICAL_GAP = 30;

  const rulesGridBox = new GridBox( {
    xSpacing: 40,
    ySpacing: 20,
    // xAlign: 'origin',
    // yAlign: 'origin',
  } );

  const rightBox = new VBox( {
    spacing: VERTICAL_GAP,
    justify: 'spaceBetween',
    layoutOptions: {
      grow: 1,
      stretch: true,
    },
    children: [
      rulesGridBox,
      bottomBox,
    ],
  } );

  const mainBox = new HBox( {
    spacing: HORIZONTAL_GAP,
    align: 'top',
    children: [
      leftBox,
      rightBox,
    ]
  } );

  Multilink.multilink( [
    rulesProperty,
    layoutBoundsProperty,
    displayTilingProperty, // TODO: it seems like our rulesProperty will ALSO change on this, so we have unnecessary performance hits
    viewStyleModeProperty,
  ], (
    rules,
    layoutBounds,
    displayTiling,
    viewStyleMode,
  ) => {
    const availableFullHeight = layoutBounds.height - 2 * MARGIN;
    const availableHeight = availableFullHeight - bottomBox.height - VERTICAL_GAP;

    leftBox.maxHeight = availableFullHeight;
    rightBox.preferredHeight = availableFullHeight;

    const availableFullWidth = layoutBounds.width - 2 * MARGIN;
    const availableWidth = availableFullWidth - leftBox.width - HORIZONTAL_GAP;

    mainBox.preferredWidth = availableFullWidth;

    const oldChildren = rulesGridBox.children.slice();

    if ( rules.length ) {
      rulesGridBox.children = rules.map( rule => {
        const planarPatternMap = planarPatternMaps.get( rule.patternBoard )!;
        assertEnabled() && assert( planarPatternMap );

        const inputListener = new FireListener( {
          fire: () => {
            // copyToClipboard( rule.getBinaryIdentifier() );
            console.log( rule.getBinaryIdentifier() );

            const popupWindow = window.open( `./rule?r=${encodeURIComponent( rule.getBinaryIdentifier() )}`, '_blank' );
            popupWindow && popupWindow.focus();
          }
        } );

        let displayEmbedding: DisplayEmbedding | null = null;
        if ( viewStyleMode !== ViewStyleMode.GENERIC && displayTiling ) {
          displayEmbedding = getBestDisplayEmbedding( rule.patternBoard, displayTiling );
        }

        if ( displayEmbedding ) {
          return new EmbeddedPatternRuleNode( rule, displayEmbedding, {
            cursor: 'pointer',
            inputListeners: [ inputListener ],
            scale: 30, // TODO: this is the scale internally in PatternNode, move it out?
            style: explorerCurrentPuzzleStyle,
          } );
          // return new Rectangle( 0, 0, 2, 2, { fill: 'red' } );
        }
        else {
          return new Panel( new PatternRuleNode( rule, planarPatternMap, {
            cursor: 'pointer',
          } ), {
            fill: '#333',
            stroke: null,
            inputListeners: [ inputListener ]
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

  scene.addChild( new AlignBox( mainBox, {
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
