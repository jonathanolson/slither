
import './main.css';

import { platform } from 'phet-lib/phet-core';
import { Bounds2, dotRandom } from 'phet-lib/dot';
import { Property, NumberProperty, PatternStringProperty, StringProperty } from 'phet-lib/axon';
import { Node, Display, Text, VBox, Font, AlignBox, AnimatedPanZoomListener } from 'phet-lib/scenery';
import { TextPushButton } from 'phet-lib/sun';
import scanURL from './scan/scanURL.ts';
import { BasicSquarePuzzle, CompositeFaceEdgeData, GeneralEdgeData, GeneralFaceData, SquareBoard } from './model/structure.ts';
import EdgeState from './model/EdgeState.ts';
import BasicPuzzleNode from './view/BasicPuzzleNode.ts';

// @ts-ignore
window.assertions.enableAssert();

const board = new SquareBoard( 10, 14 );
const startingData = new CompositeFaceEdgeData(
  new GeneralFaceData( board, face => {
    return dotRandom.sample( [ null, 0, 1, 2, 3 ] );
    // return [ null, 0, 1, 2, 3 ][ ( face.logicalCoordinates.x + face.logicalCoordinates.y ) % 4 ];
  } ),
  new GeneralEdgeData( board, edge => dotRandom.sample( [
    EdgeState.WHITE,
    EdgeState.BLACK,
    EdgeState.RED
  ] ) )
);

const puzzle = new BasicSquarePuzzle( board, startingData );

console.log( board );
console.log( startingData );
console.log( puzzle );

const scene = new Node();

const rootNode = new Node( {
  renderer: 'svg',
  children: [ scene ]
} );

const buttonPressPatternString = new StringProperty( 'Button presses: {{count}}' );

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

  // assumeFullWindow: true,
  // listenToOnlyElement: false

  assumeFullWindow: false,
  listenToOnlyElement: true
} );
document.body.appendChild( display.domElement );

const zoomListener = new AnimatedPanZoomListener( scene );
display.addInputListener( zoomListener );

const layoutBoundsProperty = new Property( new Bounds2( 0, 0, window.innerWidth, window.innerHeight ) );

const countProperty = new NumberProperty( 0 );

const mainBox = new VBox( {
  spacing: 10,
  children: [
    new TextPushButton( 'Test', {
      font: font,
      listener: () => { countProperty.value++; }
    } ),
    new Text( new PatternStringProperty( buttonPressPatternString, { count: countProperty } ), {
      font: font
    } ),
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

          reader.onloadend = () => {
            const url = reader.result as string;
            scanURL( url );

            document.body.removeChild( display.domElement );
          }
        }
        input.click();
      }
    } ),
    new BasicPuzzleNode( puzzle, {
      scale: 40,
      textOptions: {
        font: font,
        maxWidth: 0.9,
        maxHeight: 0.9
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
