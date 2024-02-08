
import './main.css';
import { Node, Display, Text, VBox, Font, AlignBox, AnimatedPanZoomListener } from '../../scenery/js/imports.ts';
import TextPushButton from '../../sun/js/buttons/TextPushButton.ts';
import platform from '../../phet-core/js/platform.ts';
import NumberProperty from '../../axon/js/NumberProperty.ts';
import PatternStringProperty from '../../axon/js/PatternStringProperty.ts';
import StringProperty from '../../axon/js/StringProperty.ts';
import Property from '../../axon/js/Property.ts';
import Bounds2 from '../../dot/js/Bounds2.ts';

const rootNode = new Node( {
  renderer: 'svg'
} );

const scene = new Node();
rootNode.addChild( scene );

const buttonPressPatternString = new StringProperty( 'Button presses: {{count}}' );

const font = new Font( {
  family: 'sans-serif',
  size: 25
} );

const display = new Display( rootNode, {
  width: 400,
  height: 100,
  allowWebGL: true,
  allowBackingScaleAntialiasing: true,
  allowSceneOverflow: false,
  accessibility: true,
  backgroundColor: '#eee',

  assumeFullWindow: true,
  listenToOnlyElement: false
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
