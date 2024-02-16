import './main.css';

import { platform } from 'phet-lib/phet-core';
import { Bounds2 } from 'phet-lib/dot';
import { Property } from 'phet-lib/axon';
import { AlignBox, AnimatedPanZoomListener, Display, Font, Node, VBox } from 'phet-lib/scenery';
import { TextPushButton } from 'phet-lib/sun';
import scanURL from './scan/scanURL.ts';
import BasicPuzzleNode from './view/BasicPuzzleNode.ts';
import { EdgeStateCycleAction, EdgeStateSetAction } from './model/structure.ts';
import SlitherQueryParameters from './SlitherQueryParameters.ts';
import { getPressStyle } from './config.ts';

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

const zoomListener = new AnimatedPanZoomListener( scene, {
  maxScale: 10
} );
display.addInputListener( zoomListener );

const layoutBoundsProperty = new Property( new Bounds2( 0, 0, window.innerWidth, window.innerHeight ) );

const mainBox = new VBox( {
  spacing: 10,
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

            const puzzle = await scanURL( url );

            // TODO: add debugging output as Scenery nodes.

            const stateStack = [ puzzle.stateProperty.value ];

            mainBox.addChild( new BasicPuzzleNode( puzzle, {
              scale: 40,
              textOptions: {
                font: font,
                maxWidth: 0.9,
                maxHeight: 0.9
              },
              edgePressListener: ( edge, button ) => {
                const oldEdgeState = puzzle.stateProperty.value.getEdgeState( edge );
                const style = getPressStyle( button );
                const newEdgeState = style.apply( oldEdgeState );

                if ( oldEdgeState !== newEdgeState ) {
                  const newState = puzzle.stateProperty.value.clone();

                  new EdgeStateSetAction( edge, newEdgeState ).apply( newState );

                  stateStack.push( newState );
                  puzzle.stateProperty.value = newState;
                }
              }
            } ) );

            // document.body.removeChild( display.domElement );
          }
        }
        input.click();
      }
    } )
  ]
} );

scene.addChild( new AlignBox( mainBox, {
  alignBoundsProperty: layoutBoundsProperty,
  xAlign: 'center',
  yAlign: 'top',
  margin: 20
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

  // zoomListener.setTargetScale( scale );
  zoomListener.setTargetBounds( layoutBounds );
  zoomListener.setPanBounds( layoutBounds );
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

  zoomListener.step( dt );
} );
