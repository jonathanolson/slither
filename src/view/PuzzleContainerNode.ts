import { AnimatedPanZoomListener, Node, Rectangle, Sizable } from 'phet-lib/scenery';
import PuzzleModelNode from './PuzzleModelNode.ts';
import { Bounds2, Vector2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import { playAreaBackgroundColorProperty } from './Theme';
import { TReadOnlyProperty } from 'phet-lib/axon';
import PuzzleModel from '../model/puzzle/PuzzleModel.ts';

export default class PuzzleContainerNode extends Sizable( Node ) {

  private backgroundRect: Rectangle;
  private puzzleWrapper: Node;
  private puzzleNode: PuzzleModelNode | null = null;
  private zoomListener: AnimatedPanZoomListener;

  public constructor(
    public readonly puzzleModelProperty: TReadOnlyProperty<PuzzleModel | null>
  ) {
    // TODO: isolate out these options
    super( {
      layoutOptions: {
        stretch: true,
        grow: 1
      }
    } );

    this.backgroundRect = new Rectangle( {
      fill: playAreaBackgroundColorProperty
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

    puzzleModelProperty.link( puzzleModel => {
      if ( this.puzzleNode ) {
        this.puzzleNode.dispose();
      }

      if ( puzzleModel ) {
        this.puzzleNode = new PuzzleModelNode( puzzleModel );

        // Update before children, so we don't mess with layout
        this.updatePuzzleNodeLayout( this.puzzleNode );
        this.puzzleWrapper.children = [ this.backgroundRect, this.puzzleNode ];
      }

      this.zoomListener.resetTransform();

      this.updateLayout();
    } );
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

  private updatePuzzleNodeLayout( puzzleNode: PuzzleModelNode ): void {
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
}
