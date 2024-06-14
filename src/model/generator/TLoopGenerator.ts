import { TBoard } from '../board/core/TBoard.ts';
import { TStructure } from '../board/core/TStructure.ts';
import { TEdge } from '../board/core/TEdge.ts';

export type TLoopGenerator<Structure extends TStructure = TStructure> = (board: TBoard<Structure>) => TEdge[];
