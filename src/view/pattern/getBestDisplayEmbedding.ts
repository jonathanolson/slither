import { TPatternBoard } from '../../model/pattern/pattern-board/TPatternBoard.ts';
import { DisplayTiling } from './DisplayTiling.ts';
import { DisplayEmbedding } from '../../model/pattern/embedding/DisplayEmbedding.ts';

// TODO: globals bad here!

// TODO: precompute these, fix up Embedding, and serialize/deserialize them (so it loads immediately)
const embeddingMap = new Map<TPatternBoard, Map<DisplayTiling, DisplayEmbedding | null>>();
export const getBestDisplayEmbedding = ( patternBoard: TPatternBoard, displayTiling: DisplayTiling ): DisplayEmbedding | null => {
  let patternMap = embeddingMap.get( patternBoard );

  if ( !patternMap ) {
    patternMap = new Map();
    embeddingMap.set( patternBoard, patternMap );
  }

  let embedding = patternMap.get( displayTiling );

  if ( embedding === undefined ) {

    const actualEmbedding = DisplayEmbedding.findBestEmbedding( patternBoard, displayTiling.boardPatternBoard, displayTiling.board );

    if ( actualEmbedding ) {
      embedding = DisplayEmbedding.getDisplayEmbedding( patternBoard, displayTiling.boardPatternBoard, displayTiling.board, actualEmbedding );
    }
    else {
      embedding = null;
    }

    patternMap.set( displayTiling, embedding );
  }

  return embedding;
};