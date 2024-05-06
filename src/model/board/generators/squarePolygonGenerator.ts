import { PolygonGenerator } from '../PolygonGenerator.ts';
import { Range, Vector2 } from 'phet-lib/dot';
import _ from '../../../workarounds/_.ts';

export const squarePolygonGenerator: PolygonGenerator = {
  name: 'Square',
  parameters: {
    width: {
      label: 'Width',
      type: 'integer',
      range: new Range( 2, 50 )
    },
    height: {
      label: 'Height',
      type: 'integer',
      range: new Range( 2, 50 )
    }
  },
  defaultParameterValues: {
    width: 6,
    height: 10
  },
  generate: ( parameters ) => {
    const width = parameters.width as number;
    const height = parameters.height as number;

    return _.range( 0, height ).flatMap( y => _.range( 0, width ).map( x => {
      return [
        new Vector2( x, y ),
        new Vector2( x + 1, y ),
        new Vector2( x + 1, y + 1 ),
        new Vector2( x, y + 1 )
      ];
    } ) );
  }
};