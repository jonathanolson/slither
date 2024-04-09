import { TPatternBoard } from '../TPatternBoard.ts';
import { FaceColorDualFeature } from './FaceColorDualFeature.ts';

export const getFaceFeatureCombinations = ( patternBoard: TPatternBoard ): FaceColorDualFeature[][] => {
  throw new Error( 'unimplemented' );
};

export const generateAllDisjointSubsets = ( n: number ): number[][][] => {
  let allDisjointSubsets: number[][][] = [];

  const recur = ( currentSet: number[], index: number, currentPartition: number[][] ) => {
    if ( index === currentSet.length ) {
      // If all elements have been considered, add the current partition to the list
      allDisjointSubsets.push( currentPartition.map( subset => subset.slice() ) );
      return;
    }

    // Exclude the current element from all subsets
    recur( currentSet, index + 1, currentPartition );

    // Start a new subset with the current element
    recur( currentSet, index + 1, [ ...currentPartition, [ currentSet[ index ] ] ] );

    // Add the current element to any of the existing subsets
    for ( let i = 0; i < currentPartition.length; i++ ) {
      currentPartition[ i ].push( currentSet[ index ] );
      recur( currentSet, index + 1, currentPartition );
      currentPartition[ i ].pop(); // Backtrack
    }
  };

  recur( Array.from( { length: n }, ( _, i ) => i ), 0, [] );

  return allDisjointSubsets;
};

export const generateAllDisjointNonSingleSubsets = ( n: number ): number[][][] => {
  return generateAllDisjointSubsets( n ).filter( sets => sets.every( set => set.length > 1 ) );
};
