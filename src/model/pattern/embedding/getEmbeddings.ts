import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { Embedding } from './Embedding.ts';
import { computeEmbeddings } from './computeEmbeddings.ts';

import assert, { assertEnabled } from '../../../workarounds/assert.ts';

const globalEmbeddingMap = new WeakMap<TPatternBoard, WeakMap<TPatternBoard, Embedding[]>>();

// memoized/cached (but with weak maps)
export const getEmbeddings = (a: TPatternBoard, b: TPatternBoard): Embedding[] => {
  assertEnabled() && assert(a);
  assertEnabled() && assert(b);

  let mainMap = globalEmbeddingMap.get(a) ?? null;

  if (!mainMap) {
    mainMap = new WeakMap<TPatternBoard, Embedding[]>();
    globalEmbeddingMap.set(a, mainMap);
  }

  let embeddings = mainMap.get(b) ?? null;

  if (!embeddings) {
    embeddings = computeEmbeddings(a, b);
    mainMap.set(b, embeddings);
  }

  return embeddings;
};
