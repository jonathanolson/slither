import './main.css';

import { platform } from 'phet-lib/phet-core';
import { Bounds2 } from 'phet-lib/dot';
import { BooleanProperty, DynamicProperty, Multilink, Property, TinyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { AlignBox, Display, Node, VBox } from 'phet-lib/scenery';
import SlitherQueryParameters from './SlitherQueryParameters.ts';
import PuzzleContainerNode from './view/PuzzleContainerNode.ts';
import PuzzleModel from './model/puzzle/PuzzleModel.ts';
import ControlBarNode from './view/ControlBarNode.ts';
import { navbarBackgroundColorProperty, navbarErrorBackgroundColorProperty } from './view/Theme.ts';
import { TState } from './model/data/core/TState.ts';
import { TStructure } from './model/board/core/TStructure.ts';
import { deserializePuzzle, serializePuzzle, TPuzzle } from './model/puzzle/TPuzzle.ts';
import { TCompleteData } from './model/data/combined/TCompleteData.ts';
import { BasicSquarePuzzle } from './model/puzzle/BasicSquarePuzzle.ts';
import { scene } from './view/scene.ts';
import { glassPane } from './view/glassPane.ts';
import { compressString } from './util/compression.ts';

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
  listenToOnlyElement: false
} );
document.body.appendChild( display.domElement );

display.setPointerAreaDisplayVisible( SlitherQueryParameters.showPointerAreas );

window.oncontextmenu = e => e.preventDefault();

export const layoutBoundsProperty = new Property( new Bounds2( 0, 0, window.innerWidth, window.innerHeight ) );

const startingPuzzleCopy = BasicSquarePuzzle.loadFromSimpleString(
  '10x18 .3.1....1..032....0......3.1....02.3...02....3.1...........2011.01..01.......3...2302..........1102...3.......22..03.0322...........3.2....13...2.30....2.2......1....103..2....1.3.'
);

// TODO: remove demo serialization
const serializedPuzzle = serializePuzzle( startingPuzzleCopy );

const puzzleString = compressString( JSON.stringify( serializedPuzzle ) );
console.log( JSON.stringify( serializedPuzzle, null, 2 ) );
console.log( puzzleString );

const startingPuzzle = deserializePuzzle( serializedPuzzle );

const startingPuzzleModel = new PuzzleModel( startingPuzzle );

const puzzleModelProperty = new TinyProperty<PuzzleModel | null>( startingPuzzleModel );

const puzzleContainerNode = new PuzzleContainerNode( puzzleModelProperty );

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
  children: [
    new AlignBox( new ControlBarNode( puzzleModelProperty, {
      glassPane: glassPane,
      layoutBoundsProperty: layoutBoundsProperty,

      // Require the complete data for now
      loadPuzzle: ( puzzle: TPuzzle<TStructure, TState<TCompleteData>> ): void => {
        puzzleModelProperty.value = new PuzzleModel( puzzle );
      }
    } ), {
      margin: 5
    } ),
    puzzleContainerNode
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
  if ( resizePending ) {
    resize();
  }

  puzzleContainerNode.step( dt );
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