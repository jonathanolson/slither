import { TPatternBoard } from './TPatternBoard.ts';
import { serializePatternBoard } from './serializePatternBoard.ts';
import { compressByteArray, decompressByteArray } from '../../util/compression.ts';
import { deserializePatternBoard } from './deserializePatternBoard.ts';

export class BinaryRuleCollection {
  public constructor(
    public readonly patternBoards: TPatternBoard[],
    public readonly data: Uint8Array,
    public readonly highlander: boolean,
  ) {}

  public serialize(): SerializedBinaryRuleCollection {
    return {
      patternBoards: this.patternBoards.map( serializePatternBoard ),
      rules: compressByteArray( this.data ),
      highlander: this.highlander,
    };
  }

  public static deserialize( serialized: SerializedBinaryRuleCollection ): BinaryRuleCollection {
    const decompressed = decompressByteArray( serialized.rules );
    if ( !decompressed ) {
      throw new Error( 'Failed to decompress rules!' );
    }

    return new BinaryRuleCollection(
      serialized.patternBoards.map( deserializePatternBoard ),
      decompressed,
      serialized.highlander,
    );
  }
}

export type SerializedBinaryRuleCollection = {
  patternBoards: string[]; // serializePatternBoard / deserializePatternBoard, hopefully the board name often
  rules: string; // base64? compressed?
  highlander: boolean;
};
