import { TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { HBox, Node, Image, Text, VBox } from 'phet-lib/scenery';
import { PopupNode } from './PopupNode.ts';
import { uiFont, uiForegroundColorProperty } from './Theme.ts';
import { UIText } from './UIText.ts';
import { ScanOptions } from '../scan/scanURL.ts';

export class ScanNode extends PopupNode {

  private readonly box: HBox;

  public constructor(
    public readonly glassPane: Node,
    public readonly layoutBoundsProperty: TReadOnlyProperty<Bounds2>,
  ) {
    const box = new HBox( {
      children: [
        new Text( 'Loading image...', {
          font: uiFont,
          fill: uiForegroundColorProperty
        } )
      ]
    } );

    super( box, glassPane, layoutBoundsProperty );

    this.box = box;
  }

  public getScanOptions(): ScanOptions {
    return {
      originalImageCallback: originalImage => this.onOriginalImage( originalImage ),
      thresholdedImageCallback: thresholdedImage => this.onThresholdedImage( thresholdedImage ),
      debugImageCallback: debugImage => this.onDebugImage( debugImage )
    };
  }

  public onOriginalImage( originalImage: HTMLCanvasElement ): void {
    this.box.children = [
      new VBox( {
        children: [
          new UIText( 'Original Image' ),
          new Image( originalImage )
        ]
      } )
    ];
  }

  public onThresholdedImage( thresholdedImage: HTMLCanvasElement ): void {
    this.box.addChild(
      new VBox( {
        children: [
          new UIText( 'Thresholded Image' ),
          new Image( thresholdedImage )
        ]
      } )
    );
  }

  public onDebugImage( debugImage: HTMLCanvasElement ): void {
    this.box.addChild(
      new VBox( {
        children: [
          new UIText( 'Debug Image' ),
          new Image( debugImage )
        ]
      } )
    );
  }
}
