import { HBox, Node, NodeOptions, Text } from 'phet-lib/scenery';
import { PatternRule } from '../../model/pattern/pattern-rule/PatternRule.ts';
import { DisplayEmbedding } from '../../model/pattern/embedding/DisplayEmbedding.ts';
import { BasicPuzzle } from '../../model/puzzle/BasicPuzzle.ts';
import PuzzleNode from '../puzzle/PuzzleNode.ts';
import { currentTheme, puzzleFont } from '../Theme.ts';
import { currentPuzzleStyle } from '../puzzle/puzzleStyles.ts';
import { Shape } from 'phet-lib/kite';
import { Panel } from 'phet-lib/sun';
import { optionize } from 'phet-lib/phet-core';
import { TPuzzleStyle } from '../puzzle/TPuzzleStyle.ts';
import { ArrowNode } from 'phet-lib/scenery-phet';

type SelfOptions = {
  style?: TPuzzleStyle;
};

export type EmbeddedPatternRuleNodeOptions = NodeOptions & SelfOptions;

export class EmbeddedPatternRuleNode extends Node {
  public constructor(
    public readonly rule: PatternRule,
    public readonly displayEmbedding: DisplayEmbedding,
    providedOptions?: EmbeddedPatternRuleNodeOptions
  ) {

    const options = optionize<EmbeddedPatternRuleNodeOptions, SelfOptions, NodeOptions>()( {
      style: currentPuzzleStyle,
    }, providedOptions );

    const inputState = displayEmbedding.getEmbeddedCompleteData( rule.inputFeatureSet );
    const outputState = displayEmbedding.getEmbeddedCompleteData( rule.outputFeatureSet );

    const inputNode = new PuzzleNode( new BasicPuzzle( displayEmbedding.smallBoard, inputState ), {
      noninteractive: true,
      style: options.style,
    } );
    const outputNode = new PuzzleNode( new BasicPuzzle( displayEmbedding.smallBoard, outputState ), {
      noninteractive: true,
      style: options.style,
    } );

    const questionFacesNode = rule.highlander ? new Node( {
      children: displayEmbedding.getEmbeddedQuestionFaces( rule.inputFeatureSet ).map( face => {
        return new Text( '?', {
          font: puzzleFont,
          maxWidth: 0.9,
          maxHeight: 0.9,
          // TODO: Make a theme entry for this?
          opacity: 0.5,
          // TODO: we are only showing now when... highlander?
          fill: rule.highlander ? currentPuzzleStyle.theme.faceValueColorProperty : currentPuzzleStyle.theme.faceValueCompletedColorProperty,
          center: face.viewCoordinates
        } );
      } )
    } ) : new Node();

    const dilation = 0.5;
    const dilatedPatternBounds = displayEmbedding.tightBounds.dilated( dilation );

    const cornerRadius = 0.5;

    const patternOutlineShape = Shape.roundRectangle( dilatedPatternBounds.x, dilatedPatternBounds.y, dilatedPatternBounds.width, dilatedPatternBounds.height, cornerRadius, cornerRadius );

    const inputContainerNode = new Node( {
      children: [ inputNode, questionFacesNode ],
      clipArea: patternOutlineShape,
    } );
    const outputContainerNode = new Node( {
      children: [ outputNode, questionFacesNode ],
      clipArea: patternOutlineShape,
    } );

    const patternDescriptionNode = new Panel( new HBox( {
      spacing: 0.2,
      children: [
        inputContainerNode,
        new ArrowNode( 0, 0, 20, 0, {
          // TODO: theme
          fill: currentTheme.uiForegroundColorProperty,
          stroke: currentTheme.uiForegroundColorProperty,
          headHeight: 7,
          headWidth: 7,
          tailWidth: 1,
          layoutOptions: {
            align: 'center'
          },
          opacity: 0.6,
          scale: 1 / 30,
        } ),
        outputContainerNode,
      ]
    } ), {
      cornerRadius: cornerRadius * ( 1.2 ),
      xMargin: 0.1,
      yMargin: 0.1,
      lineWidth: 0.05,
      stroke: null,
      fill: currentPuzzleStyle.theme.patternAnnotationBackgroundColorProperty,
    } );

    options.children = [ patternDescriptionNode ];

    super( options );

    this.disposeEmitter.addListener( () => {
      inputNode.dispose();
      outputNode.dispose();
    } );
  }
}