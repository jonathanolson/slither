import { TEdge } from '../../board/core/TEdge.ts';
import { TFace } from '../../board/core/TFace.ts';
import { AnnotatedAction } from '../../data/core/AnnotatedAction.ts';
import { CompositeAction } from '../../data/core/CompositeAction.ts';
import { TAction } from '../../data/core/TAction.ts';
import { TAnnotatedAction } from '../../data/core/TAnnotatedAction.ts';
import { AnnotatedFaceColorDual, AnnotatedFaceValue } from '../../data/core/TAnnotation.ts';
import { TState } from '../../data/core/TState.ts';
import EdgeState from '../../data/edge-state/EdgeState.ts';
import { EdgeStateSetAction } from '../../data/edge-state/EdgeStateSetAction.ts';
import { TEdgeStateData } from '../../data/edge-state/TEdgeStateData.ts';
import { FaceColorMakeOppositeAction } from '../../data/face-color/FaceColorMakeOppositeAction.ts';
import { FaceColorMakeSameAction } from '../../data/face-color/FaceColorMakeSameAction.ts';
import { TFaceColor, TFaceColorData } from '../../data/face-color/TFaceColorData.ts';
import { getFaceColorPointer } from '../../data/face-color/getFaceColorPointer.ts';
import { TFaceValueData } from '../../data/face-value/TFaceValueData.ts';
import { SectorStateSetAction } from '../../data/sector-state/SectorStateSetAction.ts';
import { TSector } from '../../data/sector-state/TSector.ts';
import { TSectorStateData } from '../../data/sector-state/TSectorStateData.ts';
import { InvalidStateError } from '../../solver/errors/InvalidStateError.ts';
import { Embedding } from '../embedding/Embedding.ts';
import { BlackEdgeFeature } from '../feature/BlackEdgeFeature.ts';
import { FaceColorDualFeature } from '../feature/FaceColorDualFeature.ts';
import { FaceFeature } from '../feature/FaceFeature.ts';
import { RedEdgeFeature } from '../feature/RedEdgeFeature.ts';
import { SectorNotOneFeature } from '../feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from '../feature/SectorNotTwoFeature.ts';
import { SectorNotZeroFeature } from '../feature/SectorNotZeroFeature.ts';
import { SectorOnlyOneFeature } from '../feature/SectorOnlyOneFeature.ts';
import { BoardPatternBoard } from '../pattern-board/BoardPatternBoard.ts';
import { TPatternFace } from '../pattern-board/TPatternFace.ts';
import { PatternRule } from '../pattern-rule/PatternRule.ts';

import _ from '../../../workarounds/_.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';

type Data = TFaceValueData & TEdgeStateData & TSectorStateData & TFaceColorData;

export const getPatternRuleAction = (
  boardPatternBoard: BoardPatternBoard,
  state: TState<Data>,
  embeddedRule: PatternRule, // should already be embedded

  // TODO: can we omit these sometime in the future? Needed for the annotation?
  rule: PatternRule,
  embedding: Embedding,
): TAnnotatedAction<Data> => {
  const inputFeatures = embeddedRule.inputFeatureSet.getFeaturesArray();
  const outputFeatures = embeddedRule.outputFeatureSet.getFeaturesArray();

  const actions: TAction<Data>[] = [];

  const affectedEdges = new Set<TEdge>();
  const affectedSectors = new Set<TSector>();
  const affectedFaces = new Set<TFace>();

  // Prep the actions
  for (const feature of outputFeatures) {
    if (feature instanceof BlackEdgeFeature || feature instanceof RedEdgeFeature) {
      const isBlack = feature instanceof BlackEdgeFeature;
      const edge = boardPatternBoard.getEdge(feature.edge);

      const currentEdgeState = state.getEdgeState(edge);

      if (currentEdgeState === EdgeState.WHITE) {
        actions.push(new EdgeStateSetAction(edge, isBlack ? EdgeState.BLACK : EdgeState.RED));
        affectedEdges.add(edge);
      } else if ((currentEdgeState === EdgeState.BLACK) !== isBlack) {
        throw new InvalidStateError('Edge is not in the correct state');
      }
    } else if (
      feature instanceof SectorNotZeroFeature ||
      feature instanceof SectorNotOneFeature ||
      feature instanceof SectorNotTwoFeature ||
      feature instanceof SectorOnlyOneFeature
    ) {
      const sector = boardPatternBoard.getSector(feature.sector);
      const currentSectorState = state.getSectorState(sector);

      if (feature instanceof SectorNotZeroFeature) {
        if (currentSectorState.zero) {
          if (!currentSectorState.one && !currentSectorState.two) {
            throw new InvalidStateError('Sector cannot be made impossible');
          }

          actions.push(new SectorStateSetAction(sector, currentSectorState.withDisallowZero()));
          affectedSectors.add(sector);
        }
      } else if (feature instanceof SectorNotOneFeature) {
        if (currentSectorState.one) {
          if (!currentSectorState.zero && !currentSectorState.two) {
            throw new InvalidStateError('Sector cannot be made impossible');
          }

          actions.push(new SectorStateSetAction(sector, currentSectorState.withDisallowOne()));
          affectedSectors.add(sector);
        }
      } else if (feature instanceof SectorNotTwoFeature) {
        if (currentSectorState.two) {
          if (!currentSectorState.zero && !currentSectorState.one) {
            throw new InvalidStateError('Sector cannot be made impossible');
          }

          actions.push(new SectorStateSetAction(sector, currentSectorState.withDisallowTwo()));
          affectedSectors.add(sector);
        }
      } else if (feature instanceof SectorOnlyOneFeature) {
        if (currentSectorState.zero || currentSectorState.two) {
          if (!currentSectorState.one) {
            throw new InvalidStateError('Sector cannot be made impossible');
          }

          actions.push(new SectorStateSetAction(sector, currentSectorState.withDisallowZero().withDisallowTwo()));
          affectedSectors.add(sector);
        }
      }
    } else if (feature instanceof FaceColorDualFeature) {
      const getUniqueColors = (patternFaces: TPatternFace[]): TFaceColor[] =>
        _.uniq(
          patternFaces.map((patternFace) => {
            const face = boardPatternBoard.getFace(patternFace);
            return face ? state.getFaceColor(face) : state.getOutsideColor();
          }),
        );

      const primaryFaceColors = getUniqueColors(feature.primaryFaces);
      const secondaryFaceColors = getUniqueColors(feature.secondaryFaces);

      const primaryOppositeFaceColors = primaryFaceColors.map((color) => state.getOppositeFaceColor(color));
      const secondaryOppositeFaceColors = secondaryFaceColors.map((color) => state.getOppositeFaceColor(color));

      // General invalidity checks
      for (const color of primaryFaceColors) {
        if (secondaryFaceColors.includes(color)) {
          throw new InvalidStateError('Cannot make primary and secondary colors the same');
        }
        if (primaryOppositeFaceColors.includes(color)) {
          throw new InvalidStateError('Cannot make primary and opposite colors the same');
        }
      }
      for (const color of secondaryFaceColors) {
        if (secondaryOppositeFaceColors.includes(color)) {
          throw new InvalidStateError('Cannot make secondary and opposite colors the same');
        }
      }

      const addAffectedFaces = (colorA: TFaceColor, colorB: TFaceColor): void => {
        [...feature.allFaces].forEach((patternFace) => {
          const face = boardPatternBoard.getFace(patternFace);
          const color = face ? state.getFaceColor(face) : state.getOutsideColor();
          if (face && (color === colorA || color === colorB)) {
            affectedFaces.add(face);
          }
        });
      };

      // Set up colors to be the same
      for (const sameColors of [primaryFaceColors, secondaryFaceColors]) {
        if (sameColors.length > 1) {
          for (let i = 1; i < sameColors.length; i++) {
            const colorA = sameColors[0];
            const colorB = sameColors[i];

            actions.push(
              new FaceColorMakeSameAction(getFaceColorPointer(state, colorA), getFaceColorPointer(state, colorB)),
            );
            addAffectedFaces(colorA, colorB);
          }
        }
      }

      // Set up one to be the opposite
      if (secondaryFaceColors.length && primaryFaceColors[0] !== secondaryOppositeFaceColors[0]) {
        actions.push(
          new FaceColorMakeOppositeAction(
            getFaceColorPointer(state, primaryFaceColors[0]),
            getFaceColorPointer(state, secondaryFaceColors[0]),
          ),
        );
        addAffectedFaces(primaryFaceColors[0], secondaryFaceColors[0]);
      }
    } else {
      assertEnabled() && assert(feature instanceof FaceFeature);
    }
  }

  const inputFaceValues: AnnotatedFaceValue[] = (
    inputFeatures.filter((feature) => feature instanceof FaceFeature) as FaceFeature[]
  ).map((feature) => {
    return {
      face: boardPatternBoard.getFace(feature.face),
      value: feature.value,
    };
  });
  const outputFaceValues: AnnotatedFaceValue[] = (
    outputFeatures.filter((feature) => feature instanceof FaceFeature) as FaceFeature[]
  ).map((feature) => {
    return {
      face: boardPatternBoard.getFace(feature.face),
      value: feature.value,
    };
  });

  // TODO: could improve performance, this is lazy
  const inputBlackEdges = (
    inputFeatures.filter((feature) => feature instanceof BlackEdgeFeature) as BlackEdgeFeature[]
  ).map((feature) => boardPatternBoard.getEdge(feature.edge));
  const outputBlackEdges = (
    outputFeatures.filter((feature) => feature instanceof BlackEdgeFeature) as BlackEdgeFeature[]
  ).map((feature) => boardPatternBoard.getEdge(feature.edge));

  const inputRedEdges = (inputFeatures.filter((feature) => feature instanceof RedEdgeFeature) as RedEdgeFeature[]).map(
    (feature) => boardPatternBoard.getEdge(feature.edge),
  );
  const outputRedEdges = (
    outputFeatures.filter((feature) => feature instanceof RedEdgeFeature) as RedEdgeFeature[]
  ).map((feature) => boardPatternBoard.getEdge(feature.edge));

  const inputSectorsNotZero = (
    inputFeatures.filter((feature) => feature instanceof SectorNotZeroFeature) as SectorNotZeroFeature[]
  ).map((feature) => boardPatternBoard.getSector(feature.sector));
  const outputSectorsNotZero = (
    outputFeatures.filter((feature) => feature instanceof SectorNotZeroFeature) as SectorNotZeroFeature[]
  ).map((feature) => boardPatternBoard.getSector(feature.sector));

  const inputSectorsNotOne = (
    inputFeatures.filter((feature) => feature instanceof SectorNotOneFeature) as SectorNotOneFeature[]
  ).map((feature) => boardPatternBoard.getSector(feature.sector));
  const outputSectorsNotOne = (
    outputFeatures.filter((feature) => feature instanceof SectorNotOneFeature) as SectorNotOneFeature[]
  ).map((feature) => boardPatternBoard.getSector(feature.sector));

  const inputSectorsNotTwo = (
    inputFeatures.filter((feature) => feature instanceof SectorNotTwoFeature) as SectorNotTwoFeature[]
  ).map((feature) => boardPatternBoard.getSector(feature.sector));
  const outputSectorsNotTwo = (
    outputFeatures.filter((feature) => feature instanceof SectorNotTwoFeature) as SectorNotTwoFeature[]
  ).map((feature) => boardPatternBoard.getSector(feature.sector));

  const inputSectorsOnlyOne = (
    inputFeatures.filter((feature) => feature instanceof SectorOnlyOneFeature) as SectorOnlyOneFeature[]
  ).map((feature) => boardPatternBoard.getSector(feature.sector));
  const outputSectorsOnlyOne = (
    outputFeatures.filter((feature) => feature instanceof SectorOnlyOneFeature) as SectorOnlyOneFeature[]
  ).map((feature) => boardPatternBoard.getSector(feature.sector));

  const inputFaceColorDualFeatures = inputFeatures.filter(
    (feature) => feature instanceof FaceColorDualFeature,
  ) as FaceColorDualFeature[];
  const outputFaceColorDualFeatures = outputFeatures.filter(
    (feature) => feature instanceof FaceColorDualFeature,
  ) as FaceColorDualFeature[];

  const toDual = (feature: FaceColorDualFeature): AnnotatedFaceColorDual => {
    return {
      primaryFaces: feature.primaryFaces.map((patternFace) => boardPatternBoard.getFace(patternFace)),
      secondaryFaces: feature.secondaryFaces.map((patternFace) => boardPatternBoard.getFace(patternFace)),
    };
  };

  const inputFaceColorDuals = inputFaceColorDualFeatures.map(toDual);
  const outputFaceColorDuals = outputFaceColorDualFeatures.map(toDual);

  // TODO: we'll want to create a new annotation for this (add to the output display)
  return new AnnotatedAction(
    new CompositeAction(actions),
    {
      type: 'Pattern',
      rule: rule,
      embedding: embedding,
      boardPatternBoard: boardPatternBoard,
      input: {
        faceValues: inputFaceValues,
        blackEdges: inputBlackEdges,
        redEdges: inputRedEdges,
        sectorsNotZero: inputSectorsNotZero,
        sectorsNotOne: inputSectorsNotOne,
        sectorsNotTwo: inputSectorsNotTwo,
        sectorsOnlyOne: inputSectorsOnlyOne,
        faceColorDuals: inputFaceColorDuals,
      },
      output: {
        faceValues: outputFaceValues,
        blackEdges: outputBlackEdges,
        redEdges: outputRedEdges,
        sectorsNotZero: outputSectorsNotZero,
        sectorsNotOne: outputSectorsNotOne,
        sectorsNotTwo: outputSectorsNotTwo,
        sectorsOnlyOne: outputSectorsOnlyOne,
        faceColorDuals: outputFaceColorDuals,
      },
      affectedEdges: affectedEdges,
      affectedSectors: affectedSectors,
      affectedFaces: affectedFaces,
    },
    boardPatternBoard.board,
  );
};
