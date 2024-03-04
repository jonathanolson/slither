import { AnimatedPanZoomListener, Node, NodeOptions, Rectangle, Sizable, SizableOptions } from 'phet-lib/scenery';
import PuzzleModelNode from './PuzzleModelNode.ts';
import { Bounds2, Vector2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import { playAreaBackgroundColorProperty } from './Theme';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import PuzzleModel from '../model/puzzle/PuzzleModel.ts';
import { optionize } from 'phet-lib/phet-core';
import { showLayoutTestProperty } from '../model/board/layout/layout.ts';
import TopologicalPuzzleNode from './TopologicalPuzzleNode.ts';

type SelfOptions = {
  topological?: boolean;
};

type ParentOptions = SizableOptions & NodeOptions;

export type PuzzleContainerNodeOptions = SelfOptions & ParentOptions;

export default class PuzzleContainerNode extends Sizable( Node ) {

  private backgroundRect: Rectangle;
  private puzzleWrapper: Node;
  private puzzleNode: PuzzleModelNode | null = null;
  private zoomListener: AnimatedPanZoomListener;

  public constructor(
    public readonly puzzleModelProperty: TReadOnlyProperty<PuzzleModel | null>,
    providedOptions?: PuzzleContainerNodeOptions
  ) {

    const options = optionize<PuzzleContainerNodeOptions, SelfOptions, ParentOptions>()( {
      topological: false
    }, providedOptions );

    // TODO: isolate out these options
    super( options );

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

    if ( options.topological ) {
      // TODO: layout still not working great?
      this.puzzleWrapper.localBoundsProperty.lazyLink( layoutListener );
    }

    // TODO: generalize this just as a container node, without this specialization for creating the type?
    Multilink.multilink( [
      puzzleModelProperty,
      showLayoutTestProperty // TODO: rename?
    ], ( puzzleModel, showLayout ) => {
      if ( this.puzzleNode ) {
        this.puzzleNode.dispose();
        this.puzzleNode = null;
      }

      if ( puzzleModel ) {
        if ( options.topological ) {
          if ( showLayout ) {
            this.puzzleNode = new TopologicalPuzzleNode( puzzleModel );
          }
        }
        else {
          this.puzzleNode = new PuzzleModelNode( puzzleModel );
        }

        if ( this.puzzleNode ) {
          // Update before children, so we don't mess with layout
          this.updatePuzzleNodeLayout( this.puzzleNode );
          this.puzzleWrapper.children = [ this.backgroundRect, this.puzzleNode ];
        }
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
    else {
      const workaroundBounds = new Bounds2( 0, 0, 5, 5 );
      this.zoomListener.setTargetBounds( workaroundBounds );
      this.zoomListener.setPanBounds( workaroundBounds );
    }
  }

  private updatePuzzleNodeLayout( puzzleNode: PuzzleModelNode ): void {
    const width = this.localPreferredWidth;
    const height = this.localPreferredHeight;

    if ( width !== null && height !== null && width > 0 && height > 0 ) {
      const padding = 20;

      const availableWidth = width - padding * 2;
      const availableHeight = height - padding * 2;

      if ( puzzleNode.localBounds.isValid() ) {
        const puzzleWidth = puzzleNode.localBounds.width;
        const puzzleHeight = puzzleNode.localBounds.height;

        const scale = Math.min( availableWidth / puzzleWidth, availableHeight / puzzleHeight );

        puzzleNode.setScaleMagnitude( scale );
        puzzleNode.center = new Vector2( width / 2, height / 2 );
      }
    }
  }
}
