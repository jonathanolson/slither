import { TSerializedEmbeddableFeature } from './TSerializedEmbeddableFeature.ts';
import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { TEmbeddableFeature } from './TEmbeddableFeature.ts';
import { FaceFeature } from './FaceFeature.ts';
import { BlackEdgeFeature } from './BlackEdgeFeature.ts';
import { RedEdgeFeature } from './RedEdgeFeature.ts';
import { FaceColorDualFeature } from './FaceColorDualFeature.ts';
import { SectorOnlyOneFeature } from './SectorOnlyOneFeature.ts';
import { SectorNotOneFeature } from './SectorNotOneFeature.ts';
import { SectorNotZeroFeature } from './SectorNotZeroFeature.ts';
import { SectorNotTwoFeature } from './SectorNotTwoFeature.ts';
import { VertexNotEmptyFeature } from './VertexNotEmptyFeature.ts';
import { VertexNotPairFeature } from './VertexNotPairFeature.ts';
import { FaceNotStateFeature } from './FaceNotStateFeature.ts';

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
