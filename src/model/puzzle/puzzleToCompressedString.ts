import { TPropertyPuzzle } from './TPuzzle.ts';
import { serializePuzzle } from './serializePuzzle.ts';

import { compressString } from '../../util/compression.ts';

export const puzzleToCompressedString = (puzzle: TPropertyPuzzle): string => {
  const serializedPuzzle = serializePuzzle(puzzle);

  return compressString(JSON.stringify(serializedPuzzle));
};
