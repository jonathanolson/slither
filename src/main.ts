import './main.css';

import { platform } from 'phet-lib/phet-core';
import { Bounds2, Vector2 } from 'phet-lib/dot';
import { Property } from 'phet-lib/axon';
import { AnimatedPanZoomListener, Display, Font, Node, Rectangle, Sizable, VBox } from 'phet-lib/scenery';
import { TextPushButton } from 'phet-lib/sun';
import scanURL from './scan/scanURL.ts';
import SlitherQueryParameters from './SlitherQueryParameters.ts';
import PuzzleNode from './view/PuzzleNode.ts';
import { Shape } from 'phet-lib/kite';
import PuzzleContainerNode from './view/PuzzleContainerNode.ts';

// @ts-ignore
window.assertions.enableAssert();

const scene = new Node();

const rootNode = new Node( {
  renderer: 'svg',
  children: [ scene ]
} );

const font = new Font( {
  family: 'sans-serif',
  size: 25
} );

const display = new Display( rootNode, {
  allowWebGL: true,
  allowBackingScaleAntialiasing: true,
  allowSceneOverflow: false,
  accessibility: true,
  backgroundColor: '#eee',

  assumeFullWindow: true,
  listenToOnlyElement: false

  // assumeFullWindow: false,
  // listenToOnlyElement: true
} );
document.body.appendChild( display.domElement );

display.setPointerAreaDisplayVisible( SlitherQueryParameters.showPointerAreas );

window.oncontextmenu = e => e.preventDefault();

const layoutBoundsProperty = new Property( new Bounds2( 0, 0, window.innerWidth, window.innerHeight ) );

const puzzleContainerNode = new PuzzleContainerNode();

const mainBox = new VBox( {
  children: [
    new TextPushButton( 'Load image', {
      font: font,
      listener: () => {
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

            puzzleContainerNode.setPuzzleNode( new PuzzleNode( puzzle ) );
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
