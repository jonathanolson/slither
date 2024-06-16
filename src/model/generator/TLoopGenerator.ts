import { TBoard } from '../board/core/TBoard.ts';
import { TEdge } from '../board/core/TEdge.ts';
import { TStructure } from '../board/core/TStructure.ts';

export type TLoopGenerator<Structure extends TStructure = TStructure> = (board: TBoard<Structure>) => TEdge[];
