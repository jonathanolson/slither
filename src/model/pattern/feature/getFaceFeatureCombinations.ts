import { TPatternBoard } from '../pattern-board/TPatternBoard.ts';
import { FaceColorDualFeature } from './FaceColorDualFeature.ts';
import { TPatternFace } from '../pattern-board/TPatternFace.ts';
import _ from '../../../workarounds/_.ts';
import { FaceConnectivity } from '../pattern-board/FaceConnectivity.ts';

export const getFaceFeatureCombinations = ( patternBoard: TPatternBoard ): FaceColorDualFeature[][] => {
  const featureMap = new Map<string, FaceColorDualFeature>();

  const edgeConnectedComponentFaces = FaceConnectivity.get( patternBoard ).connectedComponents;
  const getComponentIndex = ( face: TPatternFace ) => edgeConnectedComponentFaces.findIndex( component => component.includes( face ) );

  // Memoize features, since (a) we want to share them, and (b) sometimes they are slightly expensive to create.
  const getFeature = ( primaryIndices: number[], secondaryIndices: number[] ): FaceColorDualFeature => {
    // Canonical key, similar to the dual feature
    const isPrimaryFirst = primaryIndices.length > secondaryIndices.length || ( primaryIndices.length === secondaryIndices.length && primaryIndices[ 0 ] < secondaryIndices[ 0 ] );
    const firstIndices = isPrimaryFirst ? primaryIndices : secondaryIndices;
    const secondIndices = isPrimaryFirst ? secondaryIndices : primaryIndices;
    const key = `${firstIndices.join( ',' )}-${secondIndices.join( ',' )}`;

    if ( featureMap.has( key ) ) {
      return featureMap.get( key )!;
    }
    else {
      const feature = FaceColorDualFeature.fromPrimarySecondaryFaces(
        primaryIndices.map( index => patternBoard.faces[ index ] ),
        secondaryIndices.map( index => patternBoard.faces[ index ] )
      );
      featureMap.set( key, feature );
      return feature;
    }
  };

  const numFaces = patternBoard.faces.length;

  const faceFeatureCombinations = generateAllDisjointNonSingleSubsets( numFaces ).flatMap( disjointIndexSets => {
    const result: FaceColorDualFeature[][] = [];

    // See if the disjoint index sets are each individually part of the same edge-connected component
    if ( disjointIndexSets.some( indexSet => {
      const componentIndices = indexSet.map( index => getComponentIndex( patternBoard.faces[ index ] ) );
      return componentIndices.some( index => index !== componentIndices[ 0 ] );
    } ) ) {
      return result;
    }

    // Turns each index set into a set of features (we'll pick one of them each)
    const setToDualPermutationFeatures = disjointIndexSets.map( indexSet => {
      return generateBinaryPartitions( indexSet.length ).map( partition => {
        const primaryIndices = partition[ 0 ].map( i => indexSet[ i ] );
        const secondaryIndices = partition[ 1 ].map( i => indexSet[ i ] );
        return getFeature( primaryIndices, secondaryIndices );
      } );
    } );

    // Combine features
    const features: FaceColorDualFeature[] = []; // stack of features
    const recur = ( index: number ) => {
      if ( index === setToDualPermutationFeatures.length ) {
        result.push( features.slice() );
        return;
      }
      else {
        for ( let i = 0; i < setToDualPermutationFeatures[ index ].length; i++ ) {
          features.push( setToDualPermutationFeatures[ index ][ i ] );
          recur( index + 1 );
          features.pop();
        }
      }
    };
    recur( 0 );
    return result;
  } );

  return _.sortBy( faceFeatureCombinations, combination => {
    return combination.length * 10000 + combination.reduce( ( sum, feature ) => sum + feature.allFaces.size, 0 );
  } );
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

export const generateBinaryPartitions = ( n: number ): number[][][] => {
  const partitions: number[][][] = [];

  const recur = ( element: number, setA: number[], setB: number[] ) => {
    if ( element === n ) {
      // Only add the partition if it is in canonical form
      if (
        setA.length === 0 ||
        setB.length === 0 ||
        Math.min( ...setA ) < Math.min( ...setB )
      ) {
        // Filter out empty initial set, so we don't get that duplicate
        if ( setA.length ) {
          partitions.push( [ setA.slice(), setB.slice() ] );
        }
      }
      return;
    }

    // First set
    setA.push( element );
    recur( element + 1, setA, setB );
    setA.pop();

    // Second set
    setB.push( element );
    recur( element + 1, setA, setB );
    setB.pop();
  };

  recur( 0, [], [] );

  return partitions;
};
