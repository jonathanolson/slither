import './main.css';

import { platform } from 'phet-lib/phet-core';
import { Bounds2 } from 'phet-lib/dot';
import { BooleanProperty, DynamicProperty, Multilink, Property, TinyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { AlignBox, Display, HBox, ManualConstraint, Node, VBox } from 'phet-lib/scenery';
import SlitherQueryParameters from './SlitherQueryParameters.ts';
import PuzzleContainerNode from './view/PuzzleContainerNode.ts';
import PuzzleModel from './model/puzzle/PuzzleModel.ts';
import ControlBarNode from './view/ControlBarNode.ts';
import { controlBarMargin, currentTheme } from './view/Theme.ts';
import { TStructure } from './model/board/core/TStructure.ts';
import { TPropertyPuzzle } from './model/puzzle/TPuzzle.ts';
import { TCompleteData } from './model/data/combined/TCompleteData.ts';
import { scene } from './view/scene.ts';
import { glassPane } from './view/glassPane.ts';
import { workaroundResolveStep } from './util/sleep.ts';
import { showLayoutTestProperty } from './model/board/layout/layout.ts';
import { getSolvablePropertyPuzzle } from './model/solver/SATSolver.ts';
import { getStartupPuzzleModel } from './model/puzzle/getStartupPuzzleModel.ts';
import { TAnnotation } from './model/data/core/TAnnotation.ts';
import { HintTipNode } from './view/HintTipNode.ts';
import EditMode, { tryToSetEditMode } from './model/puzzle/EditMode.ts';
import EditModeBarNode from './view/EditModeBarNode.ts';
import ViewStyleBarNode from './view/ViewStyleBarNode.ts';
import { currentPuzzleStyle, showPuzzleStyleProperty } from './view/puzzle/puzzleStyles.ts';

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

// TODO: properly support null (it isn't right now)
const puzzleModelProperty = new TinyProperty<PuzzleModel | null>( getStartupPuzzleModel() );

const puzzleContainerNode = new PuzzleContainerNode( puzzleModelProperty, currentPuzzleStyle, {
  layoutOptions: {
    stretch: true,
    grow: 1
  }
} );

const topologicalContainerNode = new PuzzleContainerNode( puzzleModelProperty, currentPuzzleStyle, {
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
const displayedAnnotationProperty = new DynamicProperty( puzzleModelProperty, {
  derive: ( puzzleModel: PuzzleModel | null ): TReadOnlyProperty<TAnnotation | null> => {
    return puzzleModel ? puzzleModel.displayedAnnotationProperty : new Property( null );
  }
} ) as TReadOnlyProperty<TAnnotation | null>; // Why, TS?

// TODO: better place to handle this type of logic...
Multilink.multilink( [
  hasErrorProperty,
  currentTheme.navbarBackgroundColorProperty,
  currentTheme.navbarErrorBackgroundColorProperty
], ( hasError, color, errorColor ) => {
  display.backgroundColor = hasError ? errorColor : color;
} );

const controlBarNode = new ControlBarNode( puzzleModelProperty, {
  glassPane: glassPane,
  layoutBoundsProperty: layoutBoundsProperty,

  // Require the complete data for now
  loadPuzzle: ( puzzle: TPropertyPuzzle<TStructure, TCompleteData> ): void => {
    const solvablePropertyPuzzle = getSolvablePropertyPuzzle( puzzle.board, puzzle.stateProperty.value );
    if ( solvablePropertyPuzzle ) {
      puzzleModelProperty.value = new PuzzleModel( solvablePropertyPuzzle );
    }
  }
} );

const editModeBarNode = new EditModeBarNode( {
  layoutBoundsProperty: layoutBoundsProperty
} );

const viewStyleBarNode = new ViewStyleBarNode( {
  layoutBoundsProperty: layoutBoundsProperty
} );

const hintTip = new HintTipNode( displayedAnnotationProperty );

const mainBox = new VBox( {
  stretch: true,
  children: [
    new AlignBox( controlBarNode, {
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
    } ),
    new AlignBox( viewStyleBarNode, {
      margin: controlBarMargin,
      visibleProperty: showPuzzleStyleProperty
    } ),
    new AlignBox( editModeBarNode, {
      margin: controlBarMargin
    } ),
  ]
} );
layoutBoundsProperty.lazyLink( bounds => {
  mainBox.preferredWidth = bounds.width;
  mainBox.preferredHeight = bounds.height;
  mainBox.x = bounds.left;
  mainBox.y = bounds.top;
} );
scene.addChild( mainBox );
scene.addChild( hintTip );
scene.addChild( glassPane );

ManualConstraint.create( scene, [ controlBarNode, hintTip ], ( controlBarProxy, hintTipProxy ) => {
  hintTipProxy.centerTop = controlBarProxy.centerBottom.plusXY( 0, 10 );
} );

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
  // TODO: check whether the given type is... enabled(!)
  else if ( event.key === '1' ) {
    tryToSetEditMode( EditMode.EDGE_STATE );
  }
  else if ( event.key === '2' ) {
    tryToSetEditMode( EditMode.EDGE_STATE_REVERSED );
  }
  else if ( event.key === '3' ) {
    tryToSetEditMode( EditMode.FACE_COLOR_MATCH );
  }
  else if ( event.key === '4' ) {
    tryToSetEditMode( EditMode.FACE_COLOR_OPPOSITE );
  }
  else if ( event.key === '5' ) {
    tryToSetEditMode( EditMode.SECTOR_STATE );
  }
  else if ( event.key === '6' ) {
    tryToSetEditMode( EditMode.VERTEX_STATE );
  }
  else if ( event.key === '7' ) {
    tryToSetEditMode( EditMode.FACE_STATE );
  }
  else if ( event.key === '8' ) {
    tryToSetEditMode( EditMode.FACE_VALUE );
  }
  else if ( event.key === '9' ) {
    tryToSetEditMode( EditMode.DELETE_FACE );
  }
  else if ( event.key === 'Escape' ) {
    puzzleModelProperty.value?.onUserEscape();
  }
} );

// Clean up old puzzle models
puzzleModelProperty.lazyLink( ( puzzleModel, oldPuzzleModel ) => {
  if ( oldPuzzleModel ) {
    oldPuzzleModel.dispose();
  }
} );