import { TStructure } from '../board/core/TStructure.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { TPropertyPuzzle } from './TPuzzle.ts';
import { deserializePuzzle } from './deserializePuzzle.ts';

import { decompressString } from '../../util/compression.ts';

export const puzzleFromCompressedString = (
  compressedString: string,
): TPropertyPuzzle<TStructure, TCompleteData> | null => {
  try {
    // TODO: can we wipe out some of the state here?
    const serializedPuzzle = JSON.parse(decompressString(compressedString)!);

    return deserializePuzzle(serializedPuzzle);
  } catch (e) {
    console.error(e);

    return null;
  }
};
