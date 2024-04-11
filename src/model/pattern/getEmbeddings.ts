import { Embedding } from './Embedding.ts';
import { TPatternBoard } from './TPatternBoard.ts';
import { computeEmbeddings } from './computeEmbeddings.ts';

const globalEmbeddingMap = new WeakMap<TPatternBoard, WeakMap<TPatternBoard, Embedding[]>>();

// memoized/cached (but with weak maps)
export const getEmbeddings = ( a: TPatternBoard, b: TPatternBoard ): Embedding[] => {
  let mainMap = globalEmbeddingMap.get( a ) ?? null;

  if ( !mainMap ) {
    mainMap = new WeakMap<TPatternBoard, Embedding[]>();
    globalEmbeddingMap.set( a, mainMap );
  }

  let embeddings = mainMap.get( b ) ?? null;

  if ( !embeddings ) {
    embeddings = computeEmbeddings( a, b );
    mainMap.set( b, embeddings );
  }

  return embeddings;
};