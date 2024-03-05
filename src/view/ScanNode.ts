import { TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { HBox, Image, Node, Path, Rectangle, Text } from 'phet-lib/scenery';
import { PopupNode } from './PopupNode.ts';
import { uiFont, uiForegroundColorProperty } from './Theme.ts';
import { ScanOptions } from '../scan/scanURL.ts';
import { Contour } from '../scan/Contour.ts';
import { TPuzzle } from '../model/puzzle/TPuzzle.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { TState } from '../model/data/core/TState.ts';
import { TEdge } from '../model/board/core/TEdge.ts';

// TODO: culori?
const undecidedStroke = '#444';
const widestContourStroke = '#fa0';
const dotStroke = '#888';
const lineStroke = '#fff';
const xStroke = '#f00';
const zeroOuterStroke = '#ff0';
const zeroInnerStroke = '#ff0';
const oneStroke = '#0f0';
const twoStroke = '#0ff';
const threeStroke = '#0af';
const unknownStroke = '#f0f';

export class ScanNode extends PopupNode {

  private readonly scanContentNode: Node;
  private readonly imageContainer: Node;
  private readonly blackImageLayer: Node;
  private readonly originalImageLayer: Node;
  private readonly thresholdImageLayer: Node;
  private readonly contourLayer: Node;

  // @ts-expect-error
  private rootContour: Contour | null = null;
  private contours: Contour[] = [];
  private contourNodeMap: Map<Contour, ContourNode> = new Map();

  public constructor(
    public readonly glassPane: Node,
    public readonly layoutBoundsProperty: TReadOnlyProperty<Bounds2>,
  ) {
    const loadingNode = new HBox( {
      children: [
        new Text( 'Loading image...', {
          font: uiFont,
          fill: uiForegroundColorProperty
        } )
      ]
    } );

    const scanContentNode = new Node( {
      children: [
        loadingNode
      ]
    } );

    super( scanContentNode, glassPane, layoutBoundsProperty );

    this.scanContentNode = scanContentNode;

    this.blackImageLayer = new Node();
    this.originalImageLayer = new Node( {
      // TODO: make this configurable
      visible: false
    } );
    this.thresholdImageLayer = new Node( {
      // TODO: make this configurable
      visible: false
    } );
    this.contourLayer = new Node();

    this.imageContainer = new Node( {
      children: [
        this.blackImageLayer,
        this.originalImageLayer,
        this.thresholdImageLayer,
        this.contourLayer
      ]
    } );
  }

  public getScanOptions(): ScanOptions {
    return {
      originalImageCallback: originalImage => this.onOriginalImage( originalImage ),
      thresholdedImageCallback: thresholdedImage => this.onThresholdedImage( thresholdedImage ),

      rootContourCallback: ( rootContour: Contour ) => this.onRootContour( rootContour ),
      widestSubtreeCallback: ( widestSubtree: Contour ) => this.contourNodeMap.get( widestSubtree )?.makeWidestContour(),

      dotContourCallback: ( contour: Contour ) => this.contourNodeMap.get( contour )?.makeDotContour(),
      lineContourCallback: ( contour: Contour ) => this.contourNodeMap.get( contour )?.makeLineContour(),
      zeroOuterContourCallback: ( contour: Contour ) => this.contourNodeMap.get( contour )?.makeZeroOuterContour(),
      zeroInnerContourCallback: ( contour: Contour ) => this.contourNodeMap.get( contour )?.makeZeroInnerContour(),
      oneContourCallback: ( contour: Contour ) => this.contourNodeMap.get( contour )?.makeOneContour(),
      twoContourCallback: ( contour: Contour ) => this.contourNodeMap.get( contour )?.makeTwoContour(),
      threeContourCallback: ( contour: Contour ) => this.contourNodeMap.get( contour )?.makeThreeContour(),
      xContourCallback: ( contour: Contour ) => this.contourNodeMap.get( contour )?.makeXContour(),
      unknownContourCallback: ( contour: Contour ) => this.contourNodeMap.get( contour )?.makeUnknownContour(),

      debugImageCallback: debugImage => {},

      puzzleCallback: ( puzzle: TPuzzle<TStructure, TState<TCompleteData>> ) => {},
      solutionsCallback: ( solutions: TEdge[][] ) => this.onSolutions( solutions ),
    };
  }

  public onOriginalImage( originalImage: HTMLCanvasElement ): void {
    this.originalImageLayer.addChild( new Image( originalImage ) );
    this.blackImageLayer.addChild( Rectangle.bounds( this.originalImageLayer.bounds, {
      fill: 'black'
    } ) );
    this.scanContentNode.children = [
      this.imageContainer
    ];
  }

  public onThresholdedImage( thresholdedImage: HTMLCanvasElement ): void {
    this.thresholdImageLayer.addChild( new Image( thresholdedImage ) );
  }

  public onRootContour( rootContour: Contour ): void {
    this.rootContour = rootContour;
    this.contours = rootContour.getDescendantContours();

    for ( const contour of this.contours ) {
      const contourNode = new ContourNode( contour );
      this.contourNodeMap.set( contour, contourNode );
      this.contourLayer.addChild( contourNode );
    }
  }

  public onSolutions( solutions: TEdge[][] ): void {
    if ( solutions.length === 1 ) {
      this.hide();
    }
  }
}

class ContourNode extends Node {

  public readonly path: Path;

  public constructor(
    public readonly contour: Contour
  ) {
    // TODO: improve the color
    const path = new Path( contour.shape, {
      stroke: undecidedStroke
    } );

    super( {
      children: [ path ]
    } );

    this.path = path;
  }

  public makeWidestContour(): void {
    this.path.stroke = widestContourStroke;
  }

  public makeDotContour(): void {
    this.path.stroke = dotStroke;
  }

  public makeLineContour(): void {
    this.path.stroke = lineStroke;
  }

  public makeXContour(): void {
    this.path.stroke = xStroke;
  }

  public makeZeroOuterContour(): void {
    this.path.stroke = zeroOuterStroke;
  }

  public makeZeroInnerContour(): void {
    this.path.stroke = zeroInnerStroke;
  }

  public makeOneContour(): void {
    this.path.stroke = oneStroke;
  }

  public makeTwoContour(): void {
    this.path.stroke = twoStroke;
  }

  public makeThreeContour(): void {
    this.path.stroke = threeStroke;
  }

  public makeUnknownContour(): void {
    this.path.stroke = unknownStroke;
  }
}
