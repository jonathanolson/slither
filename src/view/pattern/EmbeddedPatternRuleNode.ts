import { HBox, Node, NodeOptions, Text } from 'phet-lib/scenery';
import { PatternRule } from '../../model/pattern/PatternRule.ts';
import { DisplayEmbedding } from '../../model/pattern/DisplayEmbedding.ts';
import { BasicPuzzle } from '../../model/puzzle/BasicPuzzle.ts';
import PuzzleNode from '../puzzle/PuzzleNode.ts';
import { puzzleFont } from '../Theme.ts';
import { currentPuzzleStyle } from '../puzzle/puzzleStyles.ts';
import { Shape } from 'phet-lib/kite';
import { Panel } from 'phet-lib/sun';
import { EmptySelfOptions, optionize } from 'phet-lib/phet-core';

export type EmbeddedPatternRuleNodeOptions = NodeOptions;

export class EmbeddedPatternRuleNode extends Node {
  public constructor(
    public readonly rule: PatternRule,
    public readonly displayEmbedding: DisplayEmbedding,
    providedOptions: EmbeddedPatternRuleNodeOptions
  ) {

    const inputState = displayEmbedding.getEmbeddedCompleteData( rule.inputFeatureSet );
    const outputState = displayEmbedding.getEmbeddedCompleteData( rule.outputFeatureSet );

    const inputNode = new PuzzleNode( new BasicPuzzle( displayEmbedding.smallBoard, inputState ), {} );
    const outputNode = new PuzzleNode( new BasicPuzzle( displayEmbedding.smallBoard, outputState ), {} );

    const questionFacesNode = new Node( {
      children: displayEmbedding.getEmbeddedQuestionFaces( rule.inputFeatureSet ).map( face => {
        return new Text( '?', {
          font: puzzleFont,
          maxWidth: 0.9,
          maxHeight: 0.9,
          fill: currentPuzzleStyle.theme.faceValueCompletedColorProperty,
          center: face.viewCoordinates
        } );
      } )
    } );

    const dilation = 0.2;
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

    const options = optionize<EmbeddedPatternRuleNodeOptions, EmptySelfOptions, NodeOptions>()( {
      children: [ patternDescriptionNode ],
    }, providedOptions );

    super( options );

    this.disposeEmitter.addListener( () => {
      inputNode.dispose();
      outputNode.dispose();
    } );
  }
}