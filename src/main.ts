import './main.css';

import { platform } from 'phet-lib/phet-core';
import { Bounds2 } from 'phet-lib/dot';
import { BooleanProperty, DynamicProperty, Multilink, Property, TinyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { AlignBox, Display, HBox, Node, VBox } from 'phet-lib/scenery';
import SlitherQueryParameters from './SlitherQueryParameters.ts';
import PuzzleContainerNode from './view/PuzzleContainerNode.ts';
import PuzzleModel from './model/puzzle/PuzzleModel.ts';
import ControlBarNode from './view/ControlBarNode.ts';
import { controlBarMargin, navbarBackgroundColorProperty, navbarErrorBackgroundColorProperty } from './view/Theme.ts';
import { TState } from './model/data/core/TState.ts';
import { TStructure } from './model/board/core/TStructure.ts';
import { puzzleFromCompressedString, TPropertyPuzzle } from './model/puzzle/TPuzzle.ts';
import { TCompleteData } from './model/data/combined/TCompleteData.ts';
import { scene } from './view/scene.ts';
import { glassPane } from './view/glassPane.ts';
import { workaroundResolveStep } from './util/sleep.ts';
import { showLayoutTestProperty } from './model/board/layout/layout.ts';
import { BasicPuzzle } from './model/puzzle/BasicPuzzle.ts';

// @ts-expect-error
if ( window.assertions && !( import.meta.env.PROD ) ) {
  // TODO: We should actually... have stripped these, something is going wrong
  console.log( 'enabling assertions' );
  // @ts-expect-error
  window.assertions.enableAssert();
}

const rootNode = new Node( {
  renderer: 'svg',
  children: [ scene ]
} );

// Isolated for ease of refactoring
// TODO: We could move this to a single outside export, so things can add debugging popups
export const getRootNode = () => rootNode;

const display = new Display( rootNode, {
  allowWebGL: true,
  allowBackingScaleAntialiasing: true,
  allowSceneOverflow: false,
  accessibility: true,
  backgroundColor: '#eee',

  assumeFullWindow: true,
  listenToOnlyElement: SlitherQueryParameters.debugColors
} );
document.body.appendChild( display.domElement );

display.setPointerAreaDisplayVisible( SlitherQueryParameters.showPointerAreas );

window.oncontextmenu = e => e.preventDefault();

export const layoutBoundsProperty = new Property( new Bounds2( 0, 0, window.innerWidth, window.innerHeight ) );

const puzzleString = SlitherQueryParameters.p || localStorage.getItem( 'puzzleString' );
const startingPuzzle = puzzleString ? puzzleFromCompressedString( puzzleString ) ?? BasicPuzzle.loadDefaultPuzzle() : BasicPuzzle.loadDefaultPuzzle();
const startingPuzzleModel = new PuzzleModel( startingPuzzle );

// TODO: properly support null (it isn't right now)
const puzzleModelProperty = new TinyProperty<PuzzleModel | null>( startingPuzzleModel );

const puzzleContainerNode = new PuzzleContainerNode( puzzleModelProperty, {
  layoutOptions: {
    stretch: true,
    grow: 1
  }
} );

const topologicalContainerNode = new PuzzleContainerNode( puzzleModelProperty, {
  layoutOptions: {
    stretch: true,
    grow: 1
  },
  topological: true,
  visibleProperty: showLayoutTestProperty
} );

const falseProperty = new BooleanProperty( false );
const hasErrorProperty = new DynamicProperty( puzzleModelProperty, {
  derive: ( puzzleModel: PuzzleModel | null ) => {
    return puzzleModel ? puzzleModel.hasErrorProperty : falseProperty;
  }
} ) as TReadOnlyProperty<boolean>; // Why, TS?

// TODO: better place to handle this type of logic...
Multilink.multilink( [
  hasErrorProperty,
  navbarBackgroundColorProperty,
  navbarErrorBackgroundColorProperty
], ( hasError, color, errorColor ) => {
  display.backgroundColor = hasError ? errorColor : color;
} );

const mainBox = new VBox( {
  stretch: true,
  children: [
    new AlignBox( new ControlBarNode( puzzleModelProperty, {
      glassPane: glassPane,
      layoutBoundsProperty: layoutBoundsProperty,

      // Require the complete data for now
      loadPuzzle: ( puzzle: TPropertyPuzzle<TStructure, TState<TCompleteData>> ): void => {
        puzzleModelProperty.value = new PuzzleModel( puzzle );
      }
    } ), {
      margin: controlBarMargin
    } ),
    new HBox( {
      grow: 1,
      stretch: true,
      layoutOptions: {
        grow: 1
      },
      children: [
        puzzleContainerNode,
        topologicalContainerNode
      ]
    } )
  ]
} );
layoutBoundsProperty.lazyLink( bounds => {
  mainBox.preferredWidth = bounds.width;
  mainBox.preferredHeight = bounds.height;
  mainBox.x = bounds.left;
  mainBox.y = bounds.top;
} );
scene.addChild( mainBox );
scene.addChild( glassPane );

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
  // Work around iOS Safari... just not really calling setTimeout. Fun times. Hook into the animation frame if it hasn't yet.
  workaroundResolveStep();

  if ( resizePending ) {
    resize();
  }

  mainBox.validateBounds();

  puzzleContainerNode.step( dt );
  topologicalContainerNode.step( dt );
} );

document.addEventListener( 'keydown', event => {
  if ( event.ctrlKey || event.metaKey ) {
    if ( event.key === 'z' ) {
      if ( event.shiftKey ) {
        // meta-shift-z REDO
        puzzleModelProperty.value?.onUserRedo();
      }
      else {
        // meta-z UNDO
        puzzleModelProperty.value?.onUserUndo();
      }
    }
  }
} );
