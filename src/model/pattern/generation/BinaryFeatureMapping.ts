import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { TEmbeddableFeature } from '../feature/TEmbeddableFeature.ts';
import { TBoardFeatureData } from '../feature/TBoardFeatureData.ts';
import { Embedding } from '../embedding/Embedding.ts';
import FeatureSetMatchState from '../feature/FeatureSetMatchState.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import _ from '../../../workarounds/_.ts';
import { FaceFeature } from '../feature/FaceFeature.ts';
import { RedEdgeFeature } from '../feature/RedEdgeFeature.ts';
import { BlackEdgeFeature } from '../feature/BlackEdgeFeature.ts';
import { SectorNotZeroFeature } from '../feature/SectorNotZeroFeature.ts';
import { SectorNotOneFeature } from '../feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from '../feature/SectorNotTwoFeature.ts';
import { SectorOnlyOneFeature } from '../feature/SectorOnlyOneFeature.ts';
import { FeatureSet } from '../feature/FeatureSet.ts';

export class BinaryFeatureMapping {
  public readonly featureArray: TEmbeddableFeature[] = [];

  // For matching with data from ScanPatternSolver
  public readonly featureMatchers: ((data: TBoardFeatureData, embedding: Embedding) => FeatureSetMatchState)[] = [];

  // For matching with FeatureSet data (e.g. redundancy)
  public readonly featureSetMatchers: ((featureSet: FeatureSet, embedding: Embedding) => FeatureSetMatchState)[] = [];

  public constructor(public readonly patternBoard: TPatternBoard) {
    for (const face of patternBoard.faces) {
      const potentialValues = face.isExit ? [null] : [..._.range(0, face.edges.length), null];

      for (const value of potentialValues) {
        this.featureArray.push(new FaceFeature(face, value));
        this.featureMatchers.push((data, embedding) => {
          const targetValue = data.faceValues[embedding.mapFace(face).index];

          return targetValue === value ? FeatureSetMatchState.MATCH : FeatureSetMatchState.INCOMPATIBLE;
        });
        this.featureSetMatchers.push((featureSet, embedding) => {
          return featureSet.impliesFaceValue(embedding.mapFace(face), value) ?
              FeatureSetMatchState.MATCH
            : FeatureSetMatchState.INCOMPATIBLE;
        });
      }
    }

    for (const edge of patternBoard.edges) {
      // red
      this.featureArray.push(new RedEdgeFeature(edge));
      this.featureMatchers.push((data, embedding) => {
        if (edge.isExit) {
          // TODO: index mappings
          const edges = embedding.mapExitEdges(edge);

          let allMatched = true;
          for (const edge of edges) {
            const index = edge.index;

            const isRed = data.redEdgeValues[index];

            if (isRed) {
              continue;
            } else {
              allMatched = false;
            }

            const isBlack = data.blackEdgeValues[index];

            if (isBlack) {
              return FeatureSetMatchState.INCOMPATIBLE;
            }
          }

          return allMatched ? FeatureSetMatchState.MATCH : FeatureSetMatchState.DORMANT;
        } else {
          const index = embedding.mapNonExitEdge(edge).index;

          const isRed = data.redEdgeValues[index];

          if (isRed) {
            return FeatureSetMatchState.MATCH;
          }

          const isBlack = data.blackEdgeValues[index];

          if (isBlack) {
            return FeatureSetMatchState.INCOMPATIBLE;
          } else {
            return FeatureSetMatchState.DORMANT;
          }
        }
      });
      this.featureSetMatchers.push((featureSet, embedding) => {
        if (edge.isExit) {
          const targetEdges = embedding.mapExitEdges(edge);

          let allMatched = true;
          for (const targetEdge of targetEdges) {
            const isRed = featureSet.impliesRedEdge(targetEdge);

            if (isRed) {
              continue;
            } else {
              allMatched = false;
            }

            const isBlack = featureSet.impliesBlackEdge(targetEdge);

            if (isBlack) {
              return FeatureSetMatchState.INCOMPATIBLE;
            }
          }

          return allMatched ? FeatureSetMatchState.MATCH : FeatureSetMatchState.DORMANT;
        } else {
          const targetEdge = embedding.mapNonExitEdge(edge);

          const isRed = featureSet.impliesRedEdge(targetEdge);

          if (isRed) {
            return FeatureSetMatchState.MATCH;
          }

          const isBlack = featureSet.impliesBlackEdge(targetEdge);

          if (isBlack) {
            return FeatureSetMatchState.INCOMPATIBLE;
          } else {
            return FeatureSetMatchState.DORMANT;
          }
        }
      });

      // black
      if (!edge.isExit) {
        this.featureArray.push(new BlackEdgeFeature(edge));
        this.featureMatchers.push((data, embedding) => {
          const index = embedding.mapNonExitEdge(edge).index;

          const isBlack = data.blackEdgeValues[index];

          if (isBlack) {
            return FeatureSetMatchState.MATCH;
          }

          const isRed = data.redEdgeValues[index];

          if (isRed) {
            return FeatureSetMatchState.INCOMPATIBLE;
          } else {
            return FeatureSetMatchState.DORMANT;
          }
        });
        this.featureSetMatchers.push((featureSet, embedding) => {
          const targetEdge = embedding.mapNonExitEdge(edge);

          const isBlack = featureSet.impliesBlackEdge(targetEdge);

          if (isBlack) {
            return FeatureSetMatchState.MATCH;
          }

          const isRed = featureSet.impliesRedEdge(targetEdge);

          if (isRed) {
            return FeatureSetMatchState.INCOMPATIBLE;
          } else {
            return FeatureSetMatchState.DORMANT;
          }
        });
      }
    }

    for (const sector of patternBoard.sectors) {
      this.featureArray.push(new SectorNotZeroFeature(sector));
      this.featureMatchers.push((data, embedding) => {
        // TODO: potentially improve compatibility check
        return data.sectorNotZeroValues[embedding.mapSector(sector).index] ?
            FeatureSetMatchState.MATCH
          : FeatureSetMatchState.DORMANT;
      });
      this.featureSetMatchers.push((featureSet, embedding) => {
        return featureSet.impliesSectorNotZero(embedding.mapSector(sector)) ?
            FeatureSetMatchState.MATCH
          : FeatureSetMatchState.DORMANT;
      });

      this.featureArray.push(new SectorNotOneFeature(sector));
      this.featureMatchers.push((data, embedding) => {
        // TODO: potentially improve compatibility check
        return data.sectorNotOneValues[embedding.mapSector(sector).index] ?
            FeatureSetMatchState.MATCH
          : FeatureSetMatchState.DORMANT;
      });
      this.featureSetMatchers.push((featureSet, embedding) => {
        return featureSet.impliesSectorNotOne(embedding.mapSector(sector)) ?
            FeatureSetMatchState.MATCH
          : FeatureSetMatchState.DORMANT;
      });

      this.featureArray.push(new SectorNotTwoFeature(sector));
      this.featureMatchers.push((data, embedding) => {
        // TODO: potentially improve compatibility check
        return data.sectorNotTwoValues[embedding.mapSector(sector).index] ?
            FeatureSetMatchState.MATCH
          : FeatureSetMatchState.DORMANT;
      });
      this.featureSetMatchers.push((featureSet, embedding) => {
        return featureSet.impliesSectorNotTwo(embedding.mapSector(sector)) ?
            FeatureSetMatchState.MATCH
          : FeatureSetMatchState.DORMANT;
      });

      // TODO: eventually improve by ditching this, since it is redundant (but we wouldn't have features to filter for)
      this.featureArray.push(new SectorOnlyOneFeature(sector));
      this.featureMatchers.push((data, embedding) => {
        // TODO: potentially improve compatibility check
        return data.sectorOnlyOneValues[embedding.mapSector(sector).index] ?
            FeatureSetMatchState.MATCH
          : FeatureSetMatchState.DORMANT;
      });
      this.featureSetMatchers.push((featureSet, embedding) => {
        return featureSet.impliesSectorOnlyOne(embedding.mapSector(sector)) ?
            FeatureSetMatchState.MATCH
          : FeatureSetMatchState.DORMANT;
      });
    }

    assertEnabled() && assert(this.featureArray.length === this.featureMatchers.length);
    assertEnabled() && assert(this.featureArray.length === this.featureSetMatchers.length);

    assertEnabled() && assert(this.featureArray.length <= 254, 'Our limit for encoding in a byte');
  }
}

export const binaryFeatureMappings = new WeakMap<TPatternBoard, BinaryFeatureMapping>();

export const getBinaryFeatureMapping = (patternBoard: TPatternBoard): BinaryFeatureMapping => {
  let result = binaryFeatureMappings.get(patternBoard);

  if (!result) {
    result = new BinaryFeatureMapping(patternBoard);
    binaryFeatureMappings.set(patternBoard, result);
  }

  return result;
};
