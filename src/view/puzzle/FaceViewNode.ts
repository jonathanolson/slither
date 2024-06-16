import { TPuzzleStyle } from './TPuzzleStyle.ts';

import { Multilink, TReadOnlyProperty } from 'phet-lib/axon';
import { combineOptions } from 'phet-lib/phet-core';
import { Node, RichText, RichTextOptions, TColor } from 'phet-lib/scenery';

import { TBoard } from '../../model/board/core/TBoard.ts';
import { TState } from '../../model/data/core/TState.ts';
import EdgeState from '../../model/data/edge-state/EdgeState.ts';
import { TEdgeStateData } from '../../model/data/edge-state/TEdgeStateData.ts';
import FaceValue from '../../model/data/face-value/FaceValue.ts';
import { TFaceValueData } from '../../model/data/face-value/TFaceValueData.ts';
import { dimCompletedNumbersProperty, highlightIncorrectNumbersProperty } from '../../model/puzzle/PuzzleModel.ts';

export type FaceViewNodeOptions = {
  textOptions?: RichTextOptions;
};

export class FaceViewNode extends Node {
  public constructor(
    public readonly board: TBoard,
    stateProperty: TReadOnlyProperty<TState<TFaceValueData & TEdgeStateData>>,
    style: TPuzzleStyle,
    options?: FaceViewNodeOptions,
  ) {
    super({
      pickable: false,
    });

    const faceValues: FaceValue[] = board.faces.map((face) => null); // won't display anyway, good starting configuration

    // TODO: can we actually re-use FaceNode?

    const updateFaces = () => {
      const children: Node[] = [];

      const faceValueStyle = style.faceValueStyleProperty.value;
      const color = style.theme.faceValueColorProperty.value;
      const completedColor = style.theme.faceValueCompletedColorProperty.value;
      const errorColor = style.theme.faceValueErrorColorProperty.value;
      const ratioColor = style.theme.faceValueRatioColorProperty.value;
      const faceStateVisible = style.faceStateVisibleProperty.value;
      const dimCompletedNumbers = dimCompletedNumbersProperty.value;
      const highlightIncorrectNumbers = highlightIncorrectNumbersProperty.value;

      this.visible = !faceStateVisible;

      for (let i = 0; i < board.faces.length; i++) {
        const faceValue = faceValues[i];

        if (faceValue !== null) {
          const face = board.faces[i];

          const text = new RichText(
            '',
            combineOptions<RichTextOptions>(
              {
                subScale: 0.7,
              },
              options?.textOptions,
            ),
          );

          // NOTE: We are going to set up a link so we can CHECK our coloring state (so we don't toss text instances)
          const multilink = Multilink.multilink([stateProperty], (state) => {
            let string: string;
            let fill: TColor;

            let usingRemaining = false;
            let usingRatio = false;

            if (faceValue === null) {
              string = '';
              fill = null;
            } else {
              let blackCount = 0;
              let whiteCount = 0;
              for (const edge of face.edges) {
                const edgeState = state.getEdgeState(edge);
                if (edgeState === EdgeState.BLACK) {
                  blackCount++;
                } else if (edgeState === EdgeState.WHITE) {
                  whiteCount++;
                }
              }

              if (faceValueStyle === 'static' || faceValue === 0) {
                string = `${faceValue}`;
              } else if (faceValueStyle === 'remaining') {
                string = `${faceValue - blackCount}`;
                usingRemaining = blackCount > 0;
              } else if (faceValueStyle === 'ratio') {
                // TODO: optimize?
                const numerator = faceValue - blackCount;
                if (numerator === 0) {
                  string = '0';
                } else {
                  // TODO: rich text broken, testing this instead
                  string = `${faceValue - blackCount}<sub style="color: ${ratioColor.toCSS()};">/<sub>${whiteCount}</sub></sub>`;
                  usingRatio = true;
                }
                usingRemaining = blackCount > 0;
              } else {
                throw new Error(`unhandled faceValueStyle: ${faceValueStyle}`);
              }

              if (blackCount > faceValue && highlightIncorrectNumbers) {
                fill = errorColor;
              } else if (blackCount === faceValue && dimCompletedNumbers) {
                fill = completedColor;
              } else {
                fill = usingRemaining ? color : color; // TODO figure out a better color... for this? Try a color difference?
              }
            }

            text.string = string;

            text.fill = fill;

            text.maxWidth = usingRatio ? 0.8 : 0.9;
            text.maxHeight = usingRatio ? 0.8 : 0.9;
            text.center = face.viewCoordinates;
          });
          text.disposeEmitter.addListener(() => multilink.dispose());

          children.push(text);
        }
      }

      this.children.forEach((child) => child.dispose());

      this.children = children;
    };

    const multilink = Multilink.multilink([stateProperty], (state) => {
      let changed = false;

      for (let i = 0; i < board.faces.length; i++) {
        const faceValue = state.getFaceValue(board.faces[i]);

        if (faceValue !== faceValues[i]) {
          changed = true;
          faceValues[i] = faceValue;
        }
      }

      if (changed) {
        updateFaces();
      }
    });

    const multilink2 = Multilink.multilinkAny(
      [
        style.faceValueStyleProperty,
        style.theme.faceValueColorProperty,
        style.theme.faceValueCompletedColorProperty,
        style.theme.faceValueErrorColorProperty,
        style.theme.faceValueRatioColorProperty,
        style.faceStateVisibleProperty,
        dimCompletedNumbersProperty,
        highlightIncorrectNumbersProperty,
      ],
      updateFaces,
    );

    this.disposeEmitter.addListener(() => {
      multilink.dispose();
      multilink2.dispose();
      this.children.forEach((child) => child.dispose());
    });
  }
}
