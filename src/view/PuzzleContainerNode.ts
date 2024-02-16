import { AnimatedPanZoomListener, Node, Rectangle, Sizable } from "phet-lib/scenery";
import PuzzleNode from "./PuzzleNode";
import { Bounds2, Vector2 } from "phet-lib/dot";
import { Shape } from "phet-lib/kite";

export default class PuzzleContainerNode extends Sizable( Node ) {

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

    this.puzzleWrapper = new Node( {
      children: [ this.backgroundRect ]
    } );
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
    this.puzzleWrapper.children = [ this.backgroundRect, puzzleNode ];
  }
}
