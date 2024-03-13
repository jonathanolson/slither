import assert, { assertEnabled } from '../workarounds/assert.ts';

export const packBooleanArray = ( matrix: boolean[] ): string => {
  const bytes = new Uint8Array( Math.ceil( matrix.length / 8 ) );
  for ( let i = 0; i < matrix.length; i++ ) {
    if ( matrix[ i ] ) {
      bytes[ Math.floor( i / 8 ) ] |= 1 << ( 7 - ( i % 8 ) );
    }
  }
  const result = btoa( String.fromCharCode( ...bytes ) );
  if ( assertEnabled() ) {
    const unpacked = unpackBooleanArray( result, matrix.length );
    assert( matrix.length === unpacked.length && matrix.every( ( x, i ) => x === unpacked[ i ] ) );
  }
  return result;
};

export const unpackBooleanArray = ( str: string, length: number ): boolean[] => {
  const bytes = Uint8Array.from( atob( str ), c => c.charCodeAt( 0 ) );
  const booleans = [];
  for ( let i = 0; i < bytes.length * 8; i++ ) {
    booleans.push( ( bytes[ Math.floor( i / 8 ) ] & ( 1 << ( 7 - ( i % 8 ) ) ) ) !== 0 );
  }
  return booleans.slice( 0, length );
};
