import { PeriodicBoardTiling } from './core/TiledBoard.ts';
import { PolygonGenerator } from './PolygonGenerator.ts';
import { Bounds2, Range, Vector2 } from 'phet-lib/dot';
import _ from '../../workarounds/_.ts';
import { getCentroid } from './core/createBoardDescriptor.ts';

export type PeriodicTilingParameterOverrides = {
  width?: number;
  height?: number;
  squareRegion?: boolean;
};
export const getPeriodicTilingGenerator = (
  periodicTiling: PeriodicBoardTiling,
  overrides?: PeriodicTilingParameterOverrides
): PolygonGenerator => {
  return {
    name: periodicTiling.name,
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
      },
      squareRegion: {
        label: 'Square',
        type: 'boolean'
      }
    },
    defaultParameterValues: {
      width: overrides?.width ?? 10,
      height: overrides?.height ?? 10,
      squareRegion: overrides?.squareRegion ?? false
    },
    scale: periodicTiling.scale,
    generate: ( ( parameters: { width: number; height: number; squareRegion: boolean } ) => {

      const unitPolygons = periodicTiling.polygons;
      const basisA = periodicTiling.basisA;
      const basisB = periodicTiling.basisB;

      const polygons: Vector2[][] = [];

      const bounds = new Bounds2( -parameters.width / 2, -parameters.height / 2, parameters.width / 2, parameters.height / 2 );

      const unitPolygonsBounds = Bounds2.NOTHING.copy();
      unitPolygons.forEach( polygon => {
        polygon.forEach( vertex => {
          unitPolygonsBounds.addPoint( vertex );
        } );
      } );

      const size = Math.max(
        Math.abs( bounds.minX ),
        Math.abs( bounds.maxX ),
        Math.abs( bounds.minY ),
        Math.abs( bounds.maxY )
      ) * 20; // TODO ... overkill?

      // Using mutable forms for performance
      const polygonBounds = Bounds2.NOTHING.copy();
      const aDelta = new Vector2( 0, 0 );
      const bDelta = new Vector2( 0, 0 );
      const delta = new Vector2( 0, 0 );

      _.range( -size, size ).forEach( a => {
        aDelta.set( basisA ).multiplyScalar( a );

        _.range( -size, size ).forEach( b => {
          bDelta.set( basisB ).multiplyScalar( b );

          delta.set( aDelta ).add( bDelta );

          polygonBounds.set( unitPolygonsBounds ).shift( delta );

          if ( !bounds.intersectsBounds( polygonBounds ) ) {
            return;
          }

          // TODO: we COULD do the centroid for each one?
          unitPolygons.forEach( unitPolygon => {
            const tilePolygon = unitPolygon.map( v => v.plus( delta ) );

            // TODO: do determination based on vertices instead of centroid!!!
            const centroid = getCentroid( tilePolygon );
            const scaledX = centroid.x * 2 / parameters.width;
            const scaledY = centroid.y * 2 / parameters.height;

            if ( parameters.squareRegion ) {
              if ( Math.abs( scaledX ) >= 1 || Math.abs( scaledY ) >= 1 - 1e-6 ) {
                return;
              }
            }
            else {
              if ( Math.sqrt( scaledX * scaledX + scaledY * scaledY ) >= 1 - 1e-6 ) {
                return;
              }
            }

            polygons.push( tilePolygon );
          } );
        } );
      } );

      return polygons;
    } ) as ( parameters: Record<string, any> ) => Vector2[][]
  };
};