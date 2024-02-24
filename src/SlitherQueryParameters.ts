import 'phet-lib';

// @ts-expect-error
export default QueryStringMachine.getAll( {

  p: {
    type: 'string',
    defaultValue: ''
  },

  debugScan: { type: 'flag' },

  // like PhET sims
  showPointerAreas: { type: 'flag' }
} );
