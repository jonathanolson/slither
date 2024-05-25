import { Node, Text } from 'phet-lib/scenery';
import { PatternRule } from '../../model/pattern/PatternRule.ts';
import { DisplayEmbedding } from '../../model/pattern/DisplayEmbedding.ts';
import { BasicPuzzle } from '../../model/puzzle/BasicPuzzle.ts';
import PuzzleNode from '../puzzle/PuzzleNode.ts';
import { puzzleFont } from '../Theme.ts';
import { currentPuzzleStyle } from '../puzzle/puzzleStyles.ts';

export class EmbeddedPatternRuleNode extends Node {
  public constructor(
    public readonly rule: PatternRule,
    public readonly displayEmbedding: DisplayEmbedding,
  ) {

    const inputState = displayEmbedding.getEmbeddedCompleteData( rule.inputFeatureSet );
    const outputState = displayEmbedding.getEmbeddedCompleteData( rule.outputFeatureSet );

    const inputNode = new PuzzleNode( new BasicPuzzle( displayEmbedding.smallBoard, inputState ), {} );
    const outputNode = new PuzzleNode( new BasicPuzzle( displayEmbedding.smallBoard, outputState ), {} );

    const questionFacesNode = new Node( {
      children: [ ...displayEmbedding.getEmbeddedQuestionFaces( rule.inputFeatureSet ) ].map( face => {
        return new Text( '?', {
          font: puzzleFont,
          maxWidth: 0.9,
          maxHeight: 0.9,
          fill: currentPuzzleStyle.theme.faceValueCompletedColorProperty,
          center: face.viewCoordinates
        } );
      } )
    } );

    super();

    this.disposeEmitter.addListener( () => {
      inputNode.dispose();
      outputNode.dispose();
    } );
  }
}