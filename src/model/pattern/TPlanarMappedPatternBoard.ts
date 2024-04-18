import { deserializePlanarPatternMap, serializePlanarPatternMap, TPlanarPatternMap } from './TPlanarPatternMap.ts';
import { deserializePatternBoardDescriptor, serializePatternBoardDescriptor } from './TPatternBoardDescriptor.ts';
import { BasePatternBoard } from './BasePatternBoard.ts';
import { TPatternBoard } from './TPatternBoard.ts';

export interface TPlanarMappedPatternBoard {
  patternBoard: TPatternBoard;
  planarPatternMap: TPlanarPatternMap;
}

export const serializePlanarMappedPatternBoard = ( planarMappedPatternBoard: TPlanarMappedPatternBoard ): string => {
  return JSON.stringify( {
    patternBoard: serializePatternBoardDescriptor( planarMappedPatternBoard.patternBoard.descriptor ),
    planarPatternMap: serializePlanarPatternMap( planarMappedPatternBoard.planarPatternMap )
  } );
};

export const deserializePlanarMappedPatternBoard = ( string: string ): TPlanarMappedPatternBoard => {
  const data = JSON.parse( string );

  const patternBoard = new BasePatternBoard( deserializePatternBoardDescriptor( data.patternBoard ) );

  return {
    patternBoard: patternBoard,
    planarPatternMap: deserializePlanarPatternMap( data.planarPatternMap, patternBoard )
  };
};