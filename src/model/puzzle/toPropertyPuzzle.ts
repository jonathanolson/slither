// TODO: deprecate and remove this once we don't need TPropertyPuzzle?
import { TStructure } from '../board/core/TStructure.ts';
import { TFaceValueData } from '../data/face-value/TFaceValueData.ts';
import { Property } from 'phet-lib/axon';
import { TPropertyPuzzle, TPuzzle } from './TPuzzle.ts';

export const toPropertyPuzzle = <Structure extends TStructure = TStructure, Data extends TFaceValueData = TFaceValueData>( puzzle: TPuzzle<Structure, Data> ): TPropertyPuzzle<Structure, Data> => {
  return {
    board: puzzle.board,
    stateProperty: new Property( puzzle.state )
  };
};