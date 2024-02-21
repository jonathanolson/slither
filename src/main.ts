import './main.css';

import { platform } from 'phet-lib/phet-core';
import { Bounds2 } from 'phet-lib/dot';
import { BooleanProperty, DynamicProperty, Multilink, Property, TinyProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { AlignBox, Display, Node, VBox } from 'phet-lib/scenery';
import SlitherQueryParameters from './SlitherQueryParameters.ts';
import PuzzleNode from './view/PuzzleNode.ts';
import PuzzleContainerNode from './view/PuzzleContainerNode.ts';
import PuzzleModel from './model/PuzzleModel.ts';
import ControlBarNode from './view/ControlBarNode.ts';
import { BasicSquarePuzzle, HexagonalBoard, TCompleteData, TPuzzle, TState, TStructure } from './model/structure.ts';
import { navbarBackgroundColorProperty, navbarErrorBackgroundColorProperty } from './view/Theme.ts';

// @ts-ignore
if ( window.assertions && import.meta?.env?.MODE !== 'production' ) {
  // TODO: We should actually... have stripped these, something is going wrong
  console.log( 'enabling assertions' );
  // @ts-ignore
  window.assertions.enableAssert();
}

console.log( new HexagonalBoard( 1, 2, true ) );

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
  backgroundColor: '#eee',

  assumeFullWindow: true,
  listenToOnlyElement: false
} );
document.body.appendChild( display.domElement );

display.setPointerAreaDisplayVisible( SlitherQueryParameters.showPointerAreas );

window.oncontextmenu = e => e.preventDefault();

const glassPane = new Node();

const layoutBoundsProperty = new Property( new Bounds2( 0, 0, window.innerWidth, window.innerHeight ) );

const puzzleContainerNode = new PuzzleContainerNode();

const startingPuzzleModel = new PuzzleModel( BasicSquarePuzzle.loadFromSimpleString(
  '10x18 .3.1....1..032....0......3.1....02.3...02....3.1...........2011.01..01.......3...2302..........1102...3.......22..03.0322...........3.2....13...2.30....2.2......1....103..2....1.3.'
) );

const puzzleModelProperty = new TinyProperty<PuzzleModel | null>( startingPuzzleModel );
puzzleModelProperty.link( puzzleModel => {
  if ( puzzleModel ) {
    puzzleContainerNode.setPuzzleNode( new PuzzleNode( puzzleModel ) );
  }
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

// @ts-ignore
window.loadDeprecated = ( puzzleString: string ) => {
  puzzleModelProperty.value = new PuzzleModel( BasicSquarePuzzle.loadDeprecatedScalaString( puzzleString ) );
};

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

const resizeListener = () => { resizePending = true; }
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