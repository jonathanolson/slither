import { TStructure } from '../board/core/TStructure.ts';
import { TState } from '../data/core/TState.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { TBoard } from '../board/core/TBoard.ts';
import { Property, TProperty } from 'phet-lib/axon';
import { BasicPuzzle } from './BasicPuzzle.ts';
import { TCompleteData } from '../data/combined/TCompleteData.ts';
import { compressString, decompressString } from '../../util/compression.ts';
import { TSolvedPuzzle } from '../generator/TSolvedPuzzle.ts';
import { serializeBoard } from '../board/core/serializeBoard.ts';
import { deserializeBoard } from '../board/core/deserializeBoard.ts';
import { TSerializedBoard } from '../board/core/TSerializedBoard.ts';
import { TSerializedState } from '../data/core/TSerializedState.ts';
import { deserializeState } from '../data/core/deserializeState.ts';

export type TPuzzle<Structure extends TStructure = TStructure, Data extends TFaceValueData = TFaceValueData> = {
  board: TBoard<Structure>;
  state: TState<Data>;
};

export type TPropertyPuzzle<Structure extends TStructure = TStructure, Data extends TFaceValueData = TFaceValueData> = {
  board: TBoard<Structure>;
  stateProperty: TProperty<TState<Data>>;
};

export type TSolvablePropertyPuzzle<Structure extends TStructure = TStructure, Data extends TFaceValueData = TFaceValueData> = {
  solution: TSolvedPuzzle<Structure, Data>;
} & TPropertyPuzzle<Structure, Data>;

export interface TSerializedPuzzle {
  version: number;
  board: TSerializedBoard;
  state: TSerializedState;
}

// TODO: deprecate and remove this once we don't need TPropertyPuzzle?
export const toPropertyPuzzle = <Structure extends TStructure = TStructure, Data extends TFaceValueData = TFaceValueData>( puzzle: TPuzzle<Structure, Data> ): TPropertyPuzzle<Structure, Data> => {
  return {
    board: puzzle.board,
    stateProperty: new Property( puzzle.state )
  };
};

export const serializePuzzle = ( puzzle: TPropertyPuzzle ): TSerializedPuzzle => ( {
  version: 1,
  board: serializeBoard( puzzle.board ),
  state: puzzle.stateProperty.value.serializeState( puzzle.board )
} );

export const deserializePuzzle = ( serializedPuzzle: TSerializedPuzzle ): TPropertyPuzzle<TStructure, TCompleteData> => {
  if ( serializedPuzzle.version !== 1 ) {
    throw new Error( `Unsupported puzzle version: ${serializedPuzzle.version}` );
  }

  const deserializedBoard = deserializeBoard( serializedPuzzle.board );
  const deserializedState = deserializeState( deserializedBoard, serializedPuzzle.state );

  return new BasicPuzzle( deserializedBoard, deserializedState );
};

export const puzzleToCompressedString = ( puzzle: TPropertyPuzzle ): string => {
  const serializedPuzzle = serializePuzzle( puzzle );

  return compressString( JSON.stringify( serializedPuzzle ) );
};

export const puzzleFromCompressedString = ( compressedString: string ): TPropertyPuzzle<TStructure, TCompleteData> | null => {
  try {
    // TODO: can we wipe out some of the state here?
    const serializedPuzzle = JSON.parse( decompressString( compressedString )! );

    return deserializePuzzle( serializedPuzzle );
  }
  catch ( e ) {
    console.error( e );

    return null;
  }
};
