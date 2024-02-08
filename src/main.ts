
import './main.css';
import { Node, Display, Text, VBox, Font, AlignBox } from '../../scenery/js/imports.ts';
import TextPushButton from '../../sun/js/buttons/TextPushButton.ts';
import platform from '../../phet-core/js/platform.ts';
import NumberProperty from '../../axon/js/NumberProperty.ts';
import PatternStringProperty from '../../axon/js/PatternStringProperty.ts';
import StringProperty from '../../axon/js/StringProperty.ts';
import Property from '../../axon/js/Property.ts';
import Bounds2 from '../../dot/js/Bounds2.ts';

const scene = new Node( {
  renderer: 'svg'
} );

const buttonPressPatternString = new StringProperty( 'Button presses: {{count}}' );

const font = new Font( {
  family: 'sans-serif',
  size: 25
} );

const display = new Display( scene, {
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

  display.setWidthHeight( window.innerWidth, window.innerHeight );
  layoutBoundsProperty.value = new Bounds2( 0, 0, window.innerWidth, window.innerHeight );

  if ( platform.mobileSafari ) {
    window.scrollTo( 0, 0 );
  }

  // TODO: animatedPanZoomListener(!)
};

const resizeListener = () => { resizePending = true; }
$( window ).resize( resizeListener );
window.addEventListener( 'resize', resizeListener );
window.addEventListener( 'orientationchange', resizeListener );
window.visualViewport && window.visualViewport.addEventListener( 'resize', resizeListener );
resize();

display.updateOnRequestAnimationFrame( _dt => {
  if ( resizePending ) {
    resize();
  }
} );
