import { AlignBox, Display, GridBox, HBox, Node, VBox } from 'phet-lib/scenery';
import { PatternRuleNode } from './view/pattern/PatternRuleNode.ts';
import { DerivedProperty, NumberProperty, Property } from 'phet-lib/axon';
import { getGeneralEdgeGroup } from './model/pattern/rule-group/getGeneralEdgeGroup.ts';
import _ from './workarounds/_.ts';
import { planarPatternMaps } from './model/pattern/planarPatternMaps.ts';
import assert, { assertEnabled } from './workarounds/assert.ts';
import { Bounds2 } from 'phet-lib/dot';
import { Enumeration, EnumerationValue, platform } from 'phet-lib/phet-core';
import { LocalStorageBooleanProperty, LocalStorageEnumerationProperty } from './util/localStorage.ts';
import { getGeneralColorGroup } from './model/pattern/rule-group/getGeneralColorGroup.ts';
import { getGeneralEdgeColorGroup } from './model/pattern/rule-group/getGeneralEdgeColorGroup.ts';
import { getGeneralEdgeSectorGroup } from './model/pattern/rule-group/getGeneralEdgeSectorGroup.ts';
import { getGeneralAllGroup } from './model/pattern/rule-group/getGeneralAllGroup.ts';
import { UIText } from './view/UIText.ts';
import { UILabeledVerticalAquaRadioButtonGroup } from './view/UILabeledVerticalAquaRadioButtonGroup.ts';
import { UITextCheckbox } from './view/UITextCheckbox.ts';

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

( async () => {

  const collectionModeProperty = new LocalStorageEnumerationProperty( 'collectionModeProperty', CollectionMode.EDGE );
  const highlanderModeProperty = new LocalStorageEnumerationProperty( 'highlanderModeProperty', HighlanderMode.REGULAR );
  const includeFallbackProperty = new LocalStorageBooleanProperty( 'includeFallbackProperty', false );

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
    pageIndexProperty
  ], (
    baseGroup,
    highlanderMode,
    includeFallback,
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

    console.log( baseGroup.size / rulesPerPage );
    return _.range( 0, rulesPerPage ).map( i => group.getRule( i + pageIndex * rulesPerPage ) );
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

  const leftBox = new VBox( {
    align: 'left',
    spacing: 20,
    children: [
      collectionRadioButtonGroup,
      highlanderRadioButtonGroup,
      fallbackCheckbox,
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
