import { DisplayTiling } from './DisplayTiling.ts';

import { DisplayEmbedding, DisplayEmbeddingCreationOptions } from '../../model/pattern/embedding/DisplayEmbedding.ts';
import { Embedding } from '../../model/pattern/embedding/Embedding.ts';
import { TPatternBoard } from '../../model/pattern/pattern-board/TPatternBoard.ts';


// TODO: globals bad here!

// TODO: precompute these, fix up Embedding, and serialize/deserialize them (so it loads immediately)
// TODO: DO NOT PRECOMPUTE THESE?!?
const embeddingMap = new Map<TPatternBoard, Map<DisplayTiling, Embedding | null>>();
export const getBestDisplayEmbedding = (
  patternBoard: TPatternBoard,
  displayTiling: DisplayTiling,
  options?: DisplayEmbeddingCreationOptions,
): DisplayEmbedding | null => {
  let patternMap = embeddingMap.get(patternBoard);

  if (!patternMap) {
    patternMap = new Map();
    embeddingMap.set(patternBoard, patternMap);
  }

  let embedding = patternMap.get(displayTiling);

  if (embedding === undefined) {
    embedding = DisplayEmbedding.findBestEmbedding(patternBoard, displayTiling.boardPatternBoard, displayTiling.board);
    patternMap.set(displayTiling, embedding);
  }

  if (embedding) {
    return DisplayEmbedding.getDisplayEmbedding(
      patternBoard,
      displayTiling.boardPatternBoard,
      displayTiling.board,
      embedding,
      options,
    );
  } else {
    return null;
  }
};
