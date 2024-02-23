import { TBoard } from '../board/core/TBoard.ts';
import { TStructure } from '../board/core/TStructure.ts';

export type TFaceFiller<Structure extends TStructure> = ( board: TBoard<Structure> ) => Set<Structure[ 'Face' ]>;
