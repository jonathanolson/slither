import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { FaceColorDualFeature } from './FaceColorDualFeature.ts';
import { FaceFeature } from './FaceFeature.ts';
import { FaceNotStateFeature } from './FaceNotStateFeature.ts';
import { RedEdgeFeature } from './RedEdgeFeature.ts';
import { SectorNotOneFeature } from './SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from './SectorNotTwoFeature.ts';
import { SectorNotZeroFeature } from './SectorNotZeroFeature.ts';
import { SectorOnlyOneFeature } from './SectorOnlyOneFeature.ts';
import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { VertexNotEmptyFeature } from './VertexNotEmptyFeature.ts';
import { VertexNotPairFeature } from './VertexNotPairFeature.ts';

export const deserializeEmbeddableFeature = (
  serialized: TSerializedEmbeddableFeature,
  patternBoard: TPatternBoard,
): TEmbeddableFeature => {
  switch (serialized.type) {
    case 'face':
      return FaceFeature.deserialize(serialized, patternBoard);
    case 'black-edge':
      return BlackEdgeFeature.deserialize(serialized, patternBoard);
    case 'red-edge':
      return RedEdgeFeature.deserialize(serialized, patternBoard);
    case 'face-color-dual':
      return FaceColorDualFeature.deserialize(serialized, patternBoard);
    case 'sector-only-one':
      return SectorOnlyOneFeature.deserialize(serialized, patternBoard);
    case 'sector-not-one':
      return SectorNotOneFeature.deserialize(serialized, patternBoard);
    case 'sector-not-zero':
      return SectorNotZeroFeature.deserialize(serialized, patternBoard);
    case 'sector-not-two':
      return SectorNotTwoFeature.deserialize(serialized, patternBoard);
    case 'vertex-not-empty':
      return VertexNotEmptyFeature.deserialize(serialized, patternBoard);
    case 'vertex-not-pair':
      return VertexNotPairFeature.deserialize(serialized, patternBoard);
    case 'face-not-state':
      return FaceNotStateFeature.deserialize(serialized, patternBoard);
    default:
      throw new Error(`Unknown serialized feature: ${serialized}`);
  }
};
