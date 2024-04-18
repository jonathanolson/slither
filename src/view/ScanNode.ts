import { TReadOnlyProperty } from 'phet-lib/axon';
import { Bounds2 } from 'phet-lib/dot';
import { HBox, Image, Node, Path, Rectangle, Text, VBox } from 'phet-lib/scenery';
import { PopupNode } from './PopupNode.ts';
import { currentTheme, uiFont } from './Theme.ts';
import { ScanOptions } from '../scan/scanURL.ts';
import { Contour } from '../scan/Contour.ts';
import { TPropertyPuzzle } from '../model/puzzle/TPuzzle.ts';
import { TStructure } from '../model/board/core/TStructure.ts';
import { TCompleteData } from '../model/data/combined/TCompleteData.ts';
import { TEdge } from '../model/board/core/TEdge.ts';
import assert, { assertEnabled } from '../workarounds/assert.ts';
import { BasicPuzzle } from '../model/puzzle/BasicPuzzle.ts';
import EdgeState from '../model/data/edge-state/EdgeState.ts';
import PuzzleNode from './puzzle/PuzzleNode.ts';
import { UIText } from './UIText.ts';
import { safeSolve } from '../model/solver/safeSolve.ts';

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
  private readonly solutionContainer: Node;
  private readonly blackImageLayer: Node;
  private readonly originalImageLayer: Node;
  private readonly thresholdImageLayer: Node;
  private readonly contourLayer: Node;

  private puzzle: TPropertyPuzzle<TStructure, TCompleteData> | null = null;

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
          fill: currentTheme.uiForegroundColorProperty
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
    this.solutionContainer = new Node();
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

      puzzleCallback: ( puzzle: TPropertyPuzzle<TStructure, TCompleteData> ) => this.onPuzzle( puzzle ),
      solutionsCallback: ( solutions: TEdge[][] ) => this.onSolutions( solutions ),
    };
  }

  public onOriginalImage( originalImage: HTMLCanvasElement ): void {
    this.originalImageLayer.addChild( new Image( originalImage ) );
    this.blackImageLayer.addChild( Rectangle.bounds( this.originalImageLayer.bounds, {
      fill: 'black'
    } ) );
    this.scanContentNode.children = [
      new VBox( {
        spacing: 10,
        children: [
          this.imageContainer,
          this.solutionContainer
        ]
      } )
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

  public onPuzzle( puzzle: TPropertyPuzzle<TStructure, TCompleteData> ): void {
    this.puzzle = puzzle;
  }

  public onSolutions( solutions: TEdge[][] ): void {
    if ( solutions.length === 1 ) {
      this.hide();
    }
    else {
      const puzzle = this.puzzle!;
      assertEnabled() && assert( puzzle );

      const board = puzzle.board;

      if ( solutions.length === 0 ) {
        safeSolve( board, puzzle.stateProperty.value );

        const puzzleNode = new PuzzleNode( puzzle, {
          scale: 20
        } );

        this.solutionContainer.children = [
          new VBox( {
            spacing: 10,
            children: [
              new UIText( 'No Solutions Found' ),
              puzzleNode
            ]
          } )
        ];
      }
      else {
        const puzzleA = new BasicPuzzle( board, puzzle.stateProperty.value.clone() );
        const puzzleB = new BasicPuzzle( board, puzzle.stateProperty.value.clone() );
        const puzzleC = new BasicPuzzle( board, puzzle.stateProperty.value.clone() );

        solutions[ 0 ].forEach( edge => puzzleA.stateProperty.value.setEdgeState( edge, EdgeState.BLACK ) );
        solutions[ 1 ].forEach( edge => puzzleB.stateProperty.value.setEdgeState( edge, EdgeState.BLACK ) );
        board.edges.forEach( edge => {
          if ( puzzleA.stateProperty.value.getEdgeState( edge ) !== puzzleB.stateProperty.value.getEdgeState( edge ) ) {
            puzzleC.stateProperty.value.setEdgeState( edge, EdgeState.BLACK );
          }
        } );

        safeSolve( board, puzzleA.stateProperty.value );
        safeSolve( board, puzzleB.stateProperty.value );
        safeSolve( board, puzzleC.stateProperty.value );

        const puzzleANode = new PuzzleNode( puzzleA, { scale: 10 } );
        const puzzleBNode = new PuzzleNode( puzzleB, { scale: 10 } );
        const puzzleCNode = new PuzzleNode( puzzleC, { scale: 10 } );

        this.solutionContainer.children = [
          new VBox( {
            spacing: 10,
            children: [
              new UIText( 'Multiple Solutions Found' ),
              new HBox( {
                spacing: 10,
                children: [
                  new VBox( {
                    spacing: 10,
                    children: [
                      puzzleANode,
                      new UIText( 'Solution A' )
                    ]
                  } ),
                  new VBox( {
                    spacing: 10,
                    children: [
                      puzzleBNode,
                      new UIText( 'Solution B' )
                    ]
                  } ),
                  new VBox( {
                    spacing: 10,
                    children: [
                      puzzleCNode,
                      new UIText( 'Difference' )
                    ]
                  } )
                ]
              } )
            ]
          } )
        ];
      }
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
