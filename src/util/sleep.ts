
export const sleep = async function( milliseconds: number ) {
  return new Promise( ( resolve, reject ) => {
    console.log( 'sleep start' );
    setTimeout( () => {
      console.log( 'sleep end' );
      resolve( null );
      console.log( 'resolved' );
    }, milliseconds );
  } );
};
