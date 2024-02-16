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

class PuzzleContainer extends Sizable( Node ) {

  private backgroundRect: Rectangle;
  private puzzleWrapper: Node;
  private puzzleNode: PuzzleNode | null = null;
  private zoomListener: AnimatedPanZoomListener;

  public constructor() {
    // TODO: isolate out these options
    super( {
      layoutOptions: {
        stretch: true,
        grow: 1
      }
    } );

    this.backgroundRect = new Rectangle( {
      fill: '#ccc'
    } );
    this.addChild( this.backgroundRect );

    this.puzzleWrapper = new Node();
    this.zoomListener = new AnimatedPanZoomListener( this.puzzleWrapper, {
      maxScale: 10
    } );
    // display.addInputListener( this.zoomListener );
    this.addInputListener( this.zoomListener );

    this.addChild( this.puzzleWrapper );

    const layoutListener = this.updateLayout.bind( this );
    this.localPreferredWidthProperty.lazyLink( layoutListener );
    this.localPreferredHeightProperty.lazyLink( layoutListener );

    this.updateLayout();
  }

  public step( dt: number ): void {
    this.zoomListener.step( dt );
  }

  private updateLayout(): void {
    const width = this.localPreferredWidth;
    const height = this.localPreferredHeight;

    if ( width !== null ) {
      this.backgroundRect.rectWidth = width;
    }
    if ( height !== null ) {
      this.backgroundRect.rectHeight = height;
    }

    if ( this.puzzleNode ) {
      this.updatePuzzleNodeLayout( this.puzzleNode );
    }

    if ( width !== null && height !== null && width > 0 && height > 0 ) {
      const bounds = new Bounds2( 0, 0, width, height );

      this.clipArea = Shape.bounds( bounds );

      // zoomListener.setTargetScale( scale );
      // TODO: we're getting weird oscillation with this, but figure it out
      // this.zoomListener.setTargetBounds( this.puzzleNode ? this.puzzleNode.bounds : bounds );
      this.zoomListener.setTargetBounds( bounds );
      this.zoomListener.setPanBounds( bounds );
    }
  }

  private updatePuzzleNodeLayout( puzzleNode: PuzzleNode ): void {
    const width = this.localPreferredWidth;
    const height = this.localPreferredHeight;

    if ( width !== null && height !== null && width > 0 && height > 0 ) {
      const padding = 20;

      const availableWidth = width - padding * 2;
      const availableHeight = height - padding * 2;

      const puzzleWidth = puzzleNode.localBounds.width;
      const puzzleHeight = puzzleNode.localBounds.height;

      const scale = Math.min( availableWidth / puzzleWidth, availableHeight / puzzleHeight );

      puzzleNode.setScaleMagnitude( scale );
      puzzleNode.center = new Vector2( width / 2, height / 2 );
    }
  }

  public setPuzzleNode( puzzleNode: PuzzleNode ): void {
    this.puzzleNode = puzzleNode;
    // Update before children, so we don't mess with layout
    this.updatePuzzleNodeLayout( puzzleNode );
    this.puzzleWrapper.children = [ puzzleNode ];
  }
}

const puzzleNodeContainer = new PuzzleContainer();

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

            puzzleNodeContainer.setPuzzleNode( new PuzzleNode( puzzle ) );
          }
        }
        input.click();
      }
    } ),
    puzzleNodeContainer
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

  puzzleNodeContainer.step( dt );
} );
