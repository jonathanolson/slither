import { compressString } from '../../util/compression.ts';
import { TPropertyPuzzle } from './TPuzzle.ts';
import { serializePuzzle } from './serializePuzzle.ts';

export const puzzleToCompressedString = ( puzzle: TPropertyPuzzle ): string => {
  const serializedPuzzle = serializePuzzle( puzzle );

  return compressString( JSON.stringify( serializedPuzzle ) );
};