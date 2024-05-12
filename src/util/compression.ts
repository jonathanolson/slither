import pako from 'pako';

export type CompressedString = string;

export const uint8ToString = ( buf: Uint8Array ): string => {
  return new TextDecoder().decode( buf.subarray( 0, buf.length ) );
};

export const compressString = ( str: string ): CompressedString => {
  // TODO: can probably improve this for performance if we need
  const input = new Uint8Array( str.split( '' ).map( c => c.charCodeAt( 0 ) ) );
  const output = pako.deflate( input );
  return btoa( String.fromCharCode.apply( null, [ ...output ] ) );
};

export const decompressString = ( compressed: CompressedString ): string | null => {
  try {
    const input = new Uint8Array( atob( compressed ).split( '' ).map( c => c.charCodeAt( 0 ) ) );
    const output = pako.inflate( input );
    return uint8ToString( output );
  }
  catch ( e ) {
    console.log( `${e}` );
    return null;
  }
};

// TODO: note renaming for backwards compatibility?!?

export const compressString2 = ( str: string ): CompressedString => {
  // TODO: can probably improve this for performance if we need
  const input = new Uint8Array( str.split( '' ).map( c => c.charCodeAt( 0 ) ) );
  const output = pako.deflate( input );

  let outputStr = '';
  for ( let i = 0; i < output.length; i++ ) {
    outputStr += String.fromCharCode( output[ i ] );
  }
  return btoa( outputStr );
};

export const decompressString2 = ( compressed: CompressedString ): string | null => {
  try {
    const input = new Uint8Array( atob( compressed ).split( '' ).map( c => c.charCodeAt( 0 ) ) );
    const output = pako.inflate( input );

    let outputStr = '';
    for ( let i = 0; i < output.length; i++ ) {
      outputStr += String.fromCharCode( output[ i ] );
    }
    return outputStr;
  }
  catch ( e ) {
    console.log( `${e}` );
    return null;
  }
};

export const compressByteArray = ( input: Uint8Array ): CompressedString => {
  const output = pako.deflate( input );

  let outputStr = '';
  for ( let i = 0; i < output.length; i++ ) {
    outputStr += String.fromCharCode( output[ i ] );
  }
  return btoa( outputStr );
};

export const decompressByteArray = ( compressed: CompressedString ): Uint8Array | null => {
  try {
    const input = new Uint8Array( atob( compressed ).split( '' ).map( c => c.charCodeAt( 0 ) ) );
    return pako.inflate( input );
  }
  catch ( e ) {
    console.log( `${e}` );
    return null;
  }
};