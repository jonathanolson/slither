
// Work around iOS Safari... just not really calling setTimeout. Fun times. Hook into the animation frame if it hasn't yet.
let workaroundResolve: ( ( value: unknown ) => void ) | null = null;
let workaroundResolveCount = 0;
export const workaroundResolveStep = () => {
  if ( workaroundResolve ) {
    workaroundResolveCount++;

    if ( workaroundResolveCount > 5 ) {
      const resolve = workaroundResolve;
      workaroundResolve = null;
      resolve( null );
    }
  }
};

export const sleep = async function( milliseconds: number ) {
  return new Promise( ( resolve, reject ) => {
    workaroundResolve = resolve;
    workaroundResolveCount = 0;

    console.log( 'sleep start' );
    setTimeout( () => {
      console.log( 'sleep end' );
      if ( workaroundResolve === resolve ) {
        workaroundResolve = null;
        resolve( null );
      }
      console.log( 'resolved' );
    }, milliseconds );
  } );
};
