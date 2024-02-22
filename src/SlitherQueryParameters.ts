import 'phet-lib';

// @ts-expect-error
export default QueryStringMachine.getAll( {
  debugScan: { type: 'flag' },

  // like PhET sims
  showPointerAreas: { type: 'flag' }
} );
