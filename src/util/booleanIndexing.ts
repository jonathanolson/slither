import _ from '../workarounds/_.ts';

const lazyFactorials: number[] = [];

export const getLazyFactorials = ( n: number ): number[] => {
  while ( lazyFactorials.length <= n ) {
    lazyFactorials.push( lazyFactorials.length === 0 ? 1 : lazyFactorials[ lazyFactorials.length - 1 ] * lazyFactorials.length );
  }

  return lazyFactorials;
};

export const getBinomialCoefficient = ( n: number, k: number, factorials: number[] ): number => {
  return factorials[ n ] / ( factorials[ k ] * factorials[ n - k ] );
};

export const getCombinationIndex = ( combination: number[], collectionSize: number ): number => {

  // be paranoid about sorted inputs
  combination = _.sortBy( combination );

  const factorials = getLazyFactorials( collectionSize );

  let index = 0;
  const M = combination.length;

  for ( let i = 0; i < M; i++ ) {
    const a = combination[ i - 1 ] + 1;
    const b = combination[ i ];

    for ( let j = ( i == 0 ? 0 : a ); j < b; j++ ) {
      index += getBinomialCoefficient( collectionSize - j - 1, M - i - 1, factorials );
    }
  }

  return index;
};

export const getPairIndex = ( minIndex: number, maxIndex: number, collectionSize: number ): number => {

  // Number of combinations of two items possible with the first `minIndex` items
  let combinationsUntilMin = ( minIndex * ( minIndex - 1 ) ) / 2;

  let offset = maxIndex - minIndex - 1;

  return combinationsUntilMin + offset;
};

export const getCombinationQuantity = ( collectionSize: number, combinationSize: number ): number => {
  return getBinomialCoefficient( collectionSize, combinationSize, getLazyFactorials( collectionSize ) );
};

export const getBinaryIndex = ( combination: number[], collectionSize: number ): number => {
  let index = 0;

  for ( let i = 0; i < combination.length; i++ ) {
    index += 1 << ( collectionSize - combination[ i ] - 1 );
  }

  return index;
};

export const getBinaryQuantity = ( collectionSize: number ): number => {
  return 1 << collectionSize;
};
