import { AnimatedPanZoomListener, LinearGradient, Node, NodeOptions, RadialGradient, Rectangle, Sizable, SizableOptions } from 'phet-lib/scenery';
import PuzzleModelNode from './PuzzleModelNode.ts';
import { Bounds2, Vector2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import PuzzleModel from '../model/puzzle/PuzzleModel.ts';
import { optionize } from 'phet-lib/phet-core';
import { showLayoutTestProperty } from '../model/board/layout/layout.ts';
import TopologicalPuzzleNode from './TopologicalPuzzleNode.ts';
import { TPuzzleStyle } from './puzzle/TPuzzleStyle.ts';
import { currentPuzzleStyle } from './puzzle/puzzleStyles.ts';
import { hookPuzzleListeners } from './puzzle/hookPuzzleListeners.ts';
import { isFaceEditModeProperty } from '../model/puzzle/EditMode.ts';
import { ExtendedPanZoomListener } from './ExtendedPanZoomListener.ts';

type SelfOptions = {
  topological?: boolean;
};

type ParentOptions = SizableOptions & NodeOptions;

export type PuzzleContainerNodeOptions = SelfOptions & ParentOptions;

export default class PuzzleContainerNode extends Sizable( Node ) {

  private backgroundRect: Rectangle;
  private rectangularGradientRect: Rectangle;
  private circularGradientRect: Rectangle;
  private puzzleWrapper: Node;
  private puzzleNode: PuzzleModelNode | null = null;
  private zoomListener: AnimatedPanZoomListener;

  public constructor(
    public readonly puzzleModelProperty: TReadOnlyProperty<PuzzleModel | null>,
    public readonly style: TPuzzleStyle = currentPuzzleStyle,
    providedOptions?: PuzzleContainerNodeOptions
  ) {

    const options = optionize<PuzzleContainerNodeOptions, SelfOptions, ParentOptions>()( {
      topological: false
    }, providedOptions );

    // TODO: isolate out these options
    super( options );

    this.backgroundRect = new Rectangle( {
      fill: style.theme.playAreaBackgroundColorProperty,
      pickableProperty: isFaceEditModeProperty,
    } );

    // TODO: adjust pickable based on edit mode

    hookPuzzleListeners( null, this.backgroundRect, ( face, button ) => {
      puzzleModelProperty.value?.onUserFacePress( face, button );
    } );

    this.rectangularGradientRect = new Rectangle( {
      pickable: false,
    } );
    this.circularGradientRect = new Rectangle( {
      pickable: false,
    } );

    this.puzzleWrapper = new Node( {
      children: [ this.backgroundRect, this.rectangularGradientRect, this.circularGradientRect ]
    } );
    this.zoomListener = new ExtendedPanZoomListener( this.puzzleWrapper, {
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
          this.puzzleNode = new PuzzleModelNode( puzzleModel, {
            focusNodeCallback: ( node: Node ) => {
              this.zoomListener.panToNode( node, true );
            }
          } );
        }

        if ( this.puzzleNode ) {
          // Update before children, so we don't mess with layout
          this.updatePuzzleNodeLayout( this.puzzleNode );
          this.puzzleWrapper.children = [ this.backgroundRect, this.rectangularGradientRect, this.circularGradientRect, this.puzzleNode ];
        }
      }

      this.zoomListener.resetTransform();

      this.updateLayout();
    } );
  }

  public step( dt: number ): void {
    this.zoomListener.step( 2 * dt );
  }

  private updateLayout(): void {
    const width = this.localPreferredWidth;
    const height = this.localPreferredHeight;

    if ( width !== null ) {
      this.backgroundRect.rectWidth = width;
      this.rectangularGradientRect.rectWidth = width;
      this.circularGradientRect.rectWidth = width;
    }
    if ( height !== null ) {
      this.backgroundRect.rectHeight = height;
      this.rectangularGradientRect.rectHeight = height;
      this.circularGradientRect.rectHeight = height;
    }

    if ( this.puzzleNode ) {
      this.updatePuzzleNodeLayout( this.puzzleNode );
    }

    if ( width !== null && height !== null && width > 0 && height > 0 ) {
      const bounds = new Bounds2( 0, 0, width, height );

      const center = bounds.center;
      const distanceToCorner = center.getMagnitude();

      this.rectangularGradientRect.fill = new LinearGradient( 0, 0, 0, height )
        .addColorStop( 0, this.style.theme.playAreaLinearTopColorProperty )
        .addColorStop( 0.5, this.style.theme.playAreaLinearMiddleColorProperty )
        .addColorStop( 1, this.style.theme.playAreaLinearBottomColorProperty );

      this.circularGradientRect.fill = new RadialGradient(
        center.x, center.y, distanceToCorner,
        center.x, center.y, 0
      ).addColorStop( 0, this.style.theme.playAreaRadialOutsideColorProperty ).addColorStop( 1, this.style.theme.playAreaRadialInsideColorProperty );

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
