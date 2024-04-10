import { TPatternBoard } from './TPatternBoard.ts';
import { TPatternEdge } from './TPatternEdge.ts';
import { SectorNotOneFeature } from './feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from './feature/SectorNotTwoFeature.ts';
import { SectorNotZeroFeature } from './feature/SectorNotZeroFeature.ts';
import { SectorOnlyOneFeature } from './feature/SectorOnlyOneFeature.ts';

export const coalesceSectorFeatures = ( patternBoard: TPatternBoard, solutions: TPatternEdge[][] ): ( SectorNotOneFeature | SectorNotTwoFeature | SectorNotZeroFeature | SectorOnlyOneFeature )[] => {
  const hasZero = new Array( patternBoard.sectors.length ).fill( false );
  const hasOne = new Array( patternBoard.sectors.length ).fill( false );
  const hasTwo = new Array( patternBoard.sectors.length ).fill( false );

  for ( const solution of solutions ) {
    // TODO: performance here omg
    for ( const sector of patternBoard.sectors ) {
      const count = ( solution.includes( sector.edges[ 0 ] ) ? 1 : 0 ) + ( solution.includes( sector.edges[ 1 ] ) ? 1 : 0 );

      if ( count === 0 ) {
        hasZero[ sector.index ] = true;
      }
      else if ( count === 1 ) {
        hasOne[ sector.index ] = true;
      }
      else if ( count === 2 ) {
        hasTwo[ sector.index ] = true;
      }
    }
  }

  const features: ( SectorNotOneFeature | SectorNotTwoFeature | SectorNotZeroFeature | SectorOnlyOneFeature )[] = [];

  for ( const sector of patternBoard.sectors ) {
    const isZero = hasZero[ sector.index ];
    const isOne = hasOne[ sector.index ];
    const isTwo = hasTwo[ sector.index ];

    if ( isOne && !isZero && !isTwo ) {
      features.push( new SectorOnlyOneFeature( sector ) );
    }
    else if ( isZero && isOne && !isTwo ) {
      features.push( new SectorNotTwoFeature( sector ) );
    }
    else if ( isZero && isTwo && !isOne ) {
      features.push( new SectorNotOneFeature( sector ) );
    }
    else if ( !isZero && isOne && isTwo ) {
      features.push( new SectorNotZeroFeature( sector ) );
    }
  }

  return features;
};