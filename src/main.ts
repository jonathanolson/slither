import './main.css';

import { platform } from 'phet-lib/phet-core';
import { Bounds2 } from 'phet-lib/dot';
import { Property, TinyProperty } from 'phet-lib/axon';
import { Display, Node, VBox } from 'phet-lib/scenery';
import scanURL from './scan/scanURL.ts';
import SlitherQueryParameters from './SlitherQueryParameters.ts';
import PuzzleNode from './view/PuzzleNode.ts';
import PuzzleContainerNode from './view/PuzzleContainerNode.ts';
import PuzzleModel from './model/PuzzleModel.ts';
import ControlBarNode from './view/ControlBarNode.ts';

// @ts-ignore
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
  backgroundColor: '#eee',

  assumeFullWindow: true,
  listenToOnlyElement: false
} );
document.body.appendChild( display.domElement );

display.setPointerAreaDisplayVisible( SlitherQueryParameters.showPointerAreas );

window.oncontextmenu = e => e.preventDefault();

const layoutBoundsProperty = new Property( new Bounds2( 0, 0, window.innerWidth, window.innerHeight ) );

const puzzleContainerNode = new PuzzleContainerNode();

const puzzleModelProperty = new TinyProperty<PuzzleModel | null>( null );
puzzleModelProperty.lazyLink( puzzleModel => {
  if ( puzzleModel ) {
    puzzleContainerNode.setPuzzleNode( new PuzzleNode( puzzleModel ) );
  }
} );

const mainBox = new VBox( {
  children: [
    new ControlBarNode( puzzleModelProperty, {
      userActionLoadPuzzle: () => {
        const input = document.createElement( 'input' );
        input.type = 'file';
        input.onchange = event => {
          // @ts-ignore
          const file = event.target!.files[ 0 ];

          var reader = new FileReader();
          reader.readAsDataURL( file );

          reader.onloadend = async () => {
            const url = reader.result as string;

            // TODO: UI change while working?
            const puzzle = await scanURL( url );

            puzzleModelProperty.value = new PuzzleModel( puzzle );
          }
        }
        input.click();
      }
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
