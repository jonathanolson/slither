import pako from 'pako';

export type CompressedString = string;

export const compressString = ( str: string ): CompressedString => {
  // TODO: can probably improve this for performance if we need
  const input = new Uint8Array( str.split( '' ).map( c => c.charCodeAt( 0 ) ) );
  const output = pako.deflate( input );
  return btoa( String.fromCharCode.apply( null, [ ...output ] ) );
};

export const decompressString = ( compressed: CompressedString ): string => {
  const input = new Uint8Array( atob( compressed ).split( '' ).map( c => c.charCodeAt( 0 ) ) );
  const output = pako.inflate( input );
  return String.fromCharCode.apply( null, [ ...output ] );
}
