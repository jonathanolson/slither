import { puzzleFont } from '../Theme.ts';
import { DualColorView } from '../puzzle/FaceColorViewNode.ts';
import PuzzleNode from '../puzzle/PuzzleNode.ts';
import { TPuzzleStyle } from '../puzzle/TPuzzleStyle.ts';
import { currentPuzzleStyle } from '../puzzle/puzzleStyles.ts';

import { Vector2 } from 'phet-lib/dot';
import { Shape } from 'phet-lib/kite';
import { optionize } from 'phet-lib/phet-core';
import { HBox, Node, NodeOptions, Text } from 'phet-lib/scenery';
import { ArrowNode } from 'phet-lib/scenery-phet';
import { Panel } from 'phet-lib/sun';

import { TFace } from '../../model/board/core/TFace.ts';
import { DisplayEmbedding } from '../../model/pattern/embedding/DisplayEmbedding.ts';
import { PatternRule } from '../../model/pattern/pattern-rule/PatternRule.ts';
import { BasicPuzzle } from '../../model/puzzle/BasicPuzzle.ts';

import _ from '../../workarounds/_.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';

type SelfOptions = {
  style?: TPuzzleStyle;
};

export type EmbeddedPatternRuleNodeOptions = NodeOptions & SelfOptions;

export class EmbeddedPatternRuleNode extends Node {
  public constructor(
    public readonly rule: PatternRule,
    public readonly displayEmbedding: DisplayEmbedding,
    providedOptions?: EmbeddedPatternRuleNodeOptions,
  ) {
    const options = optionize<EmbeddedPatternRuleNodeOptions, SelfOptions, NodeOptions>()(
      {
        style: currentPuzzleStyle,
      },
      providedOptions,
    );

    const inputState = displayEmbedding.getEmbeddedCompleteData(rule.inputFeatureSet);
    const outputState = displayEmbedding.getEmbeddedCompleteData(rule.outputFeatureSet);

    const inputNode = new PuzzleNode(new BasicPuzzle(displayEmbedding.smallBoard, inputState), {
      noninteractive: true,
      style: options.style,
    });
    const outputNode = new PuzzleNode(new BasicPuzzle(displayEmbedding.smallBoard, outputState), {
      noninteractive: true,
      style: options.style,
    });

    const inputDualColorViews = inputNode.getDualColorViews();
    const outputDualColorViews = outputNode.getDualColorViews();

    if (inputDualColorViews && outputDualColorViews) {
      const isViewIncluded = (view: DualColorView) => {
        return view.faceCount >= options.style.faceColorThresholdProperty.value && view.isUndecided();
      };

      const getMinimalFaceIndex = (view: DualColorView) =>
        Math.min(...view.faces.map((face) => displayEmbedding.smallBoard.faces.indexOf(face)));

      const displayedInputViews = _.sortBy([...inputDualColorViews].filter(isViewIncluded), getMinimalFaceIndex);
      const displayedOutputViews = _.sortBy([...outputDualColorViews].filter(isViewIncluded), getMinimalFaceIndex);

      // Only done right now for "displayed" ones
      const faceToInputViewMap = new Map<TFace, DualColorView>();
      for (const inputView of displayedInputViews) {
        if (isViewIncluded(inputView)) {
          inputView.faces.forEach((face) => faceToInputViewMap.set(face, inputView));
        }
      }

      const unsortedFreshOutputViews: DualColorView[] = [];

      const outputToInputViewMap = new Map<DualColorView, DualColorView | null>();
      for (const outputView of displayedOutputViews) {
        const connectedInputViews = outputView.faces
          .map((face) => faceToInputViewMap.get(face))
          .filter(_.identity) as DualColorView[];

        // Sort by face count first, THEN by index for ties (approximately)
        const bestInputView = _.minBy(
          connectedInputViews,
          (inputView) => inputView.faces.length * 20 + displayedInputViews.indexOf(inputView),
        );

        if (bestInputView) {
          outputToInputViewMap.set(outputView, bestInputView);
        } else {
          outputToInputViewMap.set(outputView, null);
          unsortedFreshOutputViews.push(outputView);
        }
      }

      const uniquelyColoredViews = [...displayedInputViews, ..._.sortBy(unsortedFreshOutputViews, getMinimalFaceIndex)];

      const getHue = (view: DualColorView): Vector2 => {
        const index = uniquelyColoredViews.indexOf(view);
        assertEnabled() && assert(index >= 0, 'view must be in the list');
        console.log(index);

        // TODO: better mapping? FIND BETTER HUES and displays
        return Vector2.createPolar(1, 5.5 + (2 * Math.PI * index) / uniquelyColoredViews.length);
      };

      for (const view of displayedInputViews) {
        view.overrideHueVector(getHue(view));
      }
      for (const view of displayedOutputViews) {
        const inputView = outputToInputViewMap.get(view);
        if (inputView) {
          view.overrideHueVector(getHue(inputView));
        } else {
          view.overrideHueVector(getHue(view));
        }
      }
    }

    const questionFacesNode =
      rule.highlander ?
        new Node({
          children: displayEmbedding.getEmbeddedQuestionFaces(rule.inputFeatureSet).map((face) => {
            return new Text('?', {
              font: puzzleFont,
              maxWidth: 0.9,
              maxHeight: 0.9,
              // TODO: Make a theme entry for this?
              opacity: 0.5,
              // TODO: we are only showing now when... highlander?
              fill:
                rule.highlander ?
                  options.style.theme.faceValueColorProperty
                : options.style.theme.faceValueCompletedColorProperty,
              center: face.viewCoordinates,
            });
          }),
        })
      : new Node();

    const dilation = 0.5;
    const dilatedPatternBounds = displayEmbedding.tightBounds.dilated(dilation);

    const cornerRadius = 0.5;

    const patternOutlineShape = Shape.roundRectangle(
      dilatedPatternBounds.x,
      dilatedPatternBounds.y,
      dilatedPatternBounds.width,
      dilatedPatternBounds.height,
      cornerRadius,
      cornerRadius,
    );

    const inputContainerNode = new Node({
      children: [inputNode, questionFacesNode],
      clipArea: patternOutlineShape,
      localBounds: dilatedPatternBounds,
    });
    const outputContainerNode = new Node({
      children: [outputNode, questionFacesNode],
      clipArea: patternOutlineShape,
      localBounds: dilatedPatternBounds,
    });

    const patternDescriptionNode = new Panel(
      new HBox({
        spacing: 0.2,
        children: [
          inputContainerNode,
          new ArrowNode(0, 0, 20, 0, {
            // TODO: theme
            fill: options.style.theme.uiForegroundColorProperty,
            stroke: options.style.theme.uiForegroundColorProperty,
            headHeight: 7,
            headWidth: 7,
            tailWidth: 1,
            layoutOptions: {
              align: 'center',
            },
            opacity: 0.6,
            scale: 1 / 30,
          }),
          outputContainerNode,
        ],
      }),
      {
        cornerRadius: cornerRadius * 1.4,
        xMargin: 0.3,
        yMargin: 0.3,
        lineWidth: 0.05,
        stroke: null,
        fill: options.style.theme.patternAnnotationBackgroundColorProperty,
      },
    );

    options.children = [patternDescriptionNode];

    super(options);

    this.disposeEmitter.addListener(() => {
      inputNode.dispose();
      outputNode.dispose();
    });
  }
}
