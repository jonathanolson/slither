import { Circle, Line, Node, Path, Text } from 'phet-lib/scenery';
import { Shape } from 'phet-lib/kite';
import { optionize } from 'phet-lib/phet-core';
import { getCentroid } from '../../model/board/core/createBoardDescriptor.ts';
import { darkTheme, puzzleFont } from '../Theme.ts';
import { TPattern } from '../../model/pattern/TPattern.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { FaceFeature } from '../../model/pattern/feature/FaceFeature.ts';
import { BlackEdgeFeature } from '../../model/pattern/feature/BlackEdgeFeature.ts';
import { RedEdgeFeature } from '../../model/pattern/feature/RedEdgeFeature.ts';
import { FaceColorDualFeature } from '../../model/pattern/feature/FaceColorDualFeature.ts';
import { SectorNotOneFeature } from '../../model/pattern/feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from '../../model/pattern/feature/SectorNotTwoFeature.ts';
import { SectorNotZeroFeature } from '../../model/pattern/feature/SectorNotZeroFeature.ts';
import { SectorOnlyOneFeature } from '../../model/pattern/feature/SectorOnlyOneFeature.ts';

export type PatternNodeOptions = {
  // TODO: face color matching for a previous patternnode
  placeholder?: boolean;
};

export class PatternNode extends Node {
  public constructor(
    public readonly pattern: TPattern,
    providedOptions?: PatternNodeOptions
  ) {

    const options = optionize<PatternNodeOptions>()( {
      // TODO
      placeholder: true
    }, providedOptions );

    if ( !options.placeholder ) {
      console.log( 'hah' );
    }

    const patternBoard = pattern.patternBoard;
    const features = pattern.features;
    const planarPatternMap = pattern.planarPatternMap!;
    assertEnabled() && assert( planarPatternMap, 'planarPatternMap should be defined' );

    // TODO: move scale elsewhere?
    const container = new Node( {
      scale: 30
    } );

    // Face backgrounds
    patternBoard.faces.forEach( face => {

      if ( face.isExit ) {
        return;
      }

      const points = planarPatternMap.faceMap.get( face )!;
      const shape = Shape.polygon( points );

      container.addChild( new Path( shape, {
        fill: '#000'
      } ) );
    } );

    // Face Color Features
    ( features.filter( f => f instanceof FaceColorDualFeature ) as FaceColorDualFeature[] ).forEach( ( feature, i ) => {
      const hueLUT = [ 255, 160, 20, 230, 96, 70, 0 ];
      const hue = hueLUT[ i % hueLUT.length ];
      const primaryColor = darkTheme.faceColorLightHueLUTProperty.value[ hue ];
      const secondaryColor = darkTheme.faceColorDarkHueLUTProperty.value[ hue ];

      feature.primaryFaces.forEach( face => {
        const points = planarPatternMap.faceMap.get( face )!;
        const shape = Shape.polygon( points );

        container.addChild( new Path( shape, {
          fill: primaryColor
        } ) );
      } );

      feature.secondaryFaces.forEach( face => {
        const points = planarPatternMap.faceMap.get( face )!;
        const shape = Shape.polygon( points );

        container.addChild( new Path( shape, {
          fill: secondaryColor
        } ) );
      } );
    } );

    // Sector features
    patternBoard.sectors.forEach( sector => {
      const sectorFeatures = features.filter( feature => {
        return ( feature instanceof SectorNotOneFeature || feature instanceof SectorNotTwoFeature || feature instanceof SectorNotZeroFeature || feature instanceof SectorOnlyOneFeature ) && feature.sector === sector;
      } ) as ( SectorNotOneFeature | SectorNotTwoFeature | SectorNotZeroFeature | SectorOnlyOneFeature )[];

      if ( sectorFeatures.length ) {

        const hasOnlyOne = sectorFeatures.some( feature => feature instanceof SectorOnlyOneFeature );
        const hasNotOne = sectorFeatures.some( feature => feature instanceof SectorNotOneFeature );
        const hasNotTwo = sectorFeatures.some( feature => feature instanceof SectorNotTwoFeature );

        const isOnlyOne = hasOnlyOne;
        const isNotOne = hasNotOne;
        const isNotTwo = !isOnlyOne && hasNotTwo;

        const hasDash = !isOnlyOne && !isNotOne;
        const isDouble = !isOnlyOne && !isNotTwo;

        const stroke = isOnlyOne ? darkTheme.sectorOnlyOneColorProperty : isNotOne ? darkTheme.sectorNotOneColorProperty : isNotTwo ? darkTheme.sectorNotTwoColorProperty : darkTheme.sectorNotZeroColorProperty;

        const points = planarPatternMap.sectorMap.get( sector )!;

        // TODO: consider deduplicating this with SectorNode
        const startPoint = points[ 0 ];
        const vertexPoint = points[ 1 ];
        const endPoint = points[ 2 ];

        const startDelta = startPoint.minus( vertexPoint );
        const endDelta = endPoint.minus( vertexPoint );

        const startUnit = startDelta.normalized();

        const startAngle = startDelta.angle;
        let endAngle = endDelta.angle;
        if ( endAngle < startAngle ) {
          endAngle += 2 * Math.PI;
        }

        let shape: Shape;
        const radius = 0.25;
        if ( isDouble ) {
          shape = new Shape()
            .moveToPoint( startUnit.timesScalar( radius - 0.03 ).plus( vertexPoint ) )
            .arcPoint( vertexPoint, radius - 0.03, startAngle, endAngle, true )
            .moveToPoint( startUnit.timesScalar( radius + 0.03 ).plus( vertexPoint ) )
            .arcPoint( vertexPoint, radius + 0.03, startAngle, endAngle, true )
            .makeImmutable();
        }
        else {
          shape = new Shape()
            .moveToPoint( startUnit.timesScalar( radius ).plus( vertexPoint ) )
            .arcPoint( vertexPoint, radius, startAngle, endAngle, true )
            .makeImmutable();
        }

        container.addChild( new Path( shape, {
          stroke: stroke,
          lineWidth: 0.02,
          lineDash: hasDash ? [ 0.03, 0.03 ] : []
        } ) );
      }
    } );

    patternBoard.edges.forEach( edge => {
      if ( edge.isExit ) {
        return;
      }

      const points = planarPatternMap.edgeMap.get( edge )!;

      container.addChild( new Line( points[ 0 ], points[ 1 ], {
        stroke: 'rgba(255,255,255,0.2)',
        lineWidth: 0.01
      } ) );
    } );

    patternBoard.vertices.forEach( vertex => {
      const isExit = vertex.isExit;

      container.addChild( new Circle( isExit ? 0.06 : 0.04, {
        center: planarPatternMap.vertexMap.get( vertex )!,
        lineWidth: 0.02,
        stroke: 'rgba(255,255,255,0.2)',
        fill: isExit ? '#222' : 'rgba(255,255,255,0.2)'
      } ) );
    } );

    // Face features
    patternBoard.faces.forEach( face => {
      if ( !face.isExit ) {
        const faceFeature = ( features.find( feature => feature instanceof FaceFeature && feature.face === face ) ?? null ) as FaceFeature | null;

        if ( !faceFeature || faceFeature.value !== null ) {
          const string = faceFeature ? faceFeature.value!.toString() : '?';
          const points = planarPatternMap.faceMap.get( face )!;
          const centroid = getCentroid( points );
          const text = new Text( string, {
            font: puzzleFont,
            centerX: centroid.x,
            centerY: centroid.y,
            fill: faceFeature ? '#ccc' : '#555',
            maxWidth: 0.9,
            maxHeight: 0.9
          } );
          container.addChild( text );
        }
      }
    } );

    // Exit Edge features
    patternBoard.edges.forEach( edge => {
      if ( edge.isExit ) {
        const edgeFeatures = features.filter( feature => ( feature instanceof BlackEdgeFeature || feature instanceof RedEdgeFeature ) && feature.edge === edge ) as ( BlackEdgeFeature | RedEdgeFeature )[];

        const exitVertex = edge.exitVertex!;

        edgeFeatures.forEach( feature => {
          const isBlack = feature instanceof BlackEdgeFeature;

          container.addChild( new Circle( 0.1, {
            center: planarPatternMap.vertexMap.get( exitVertex )!,
            lineWidth: 0.03,
            stroke: isBlack ? '#000' : '#f00' // TODO: factor out color?
          } ) );
        } );
      }
    } );

    // Non-exit Edge features
    patternBoard.edges.forEach( edge => {
      if ( !edge.isExit ) {
        const edgeFeatures = features.filter( feature => ( feature instanceof BlackEdgeFeature || feature instanceof RedEdgeFeature ) && feature.edge === edge ) as ( BlackEdgeFeature | RedEdgeFeature )[];

        edgeFeatures.forEach( feature => {
          const points = planarPatternMap.edgeMap.get( edge )!;
          const isBlack = feature instanceof BlackEdgeFeature;

          container.addChild( new Line( points[ 0 ], points[ 1 ], {
            stroke: isBlack ? '#fff' : '#f00',
            lineWidth: 0.05
          } ) );
        } );
      }
    } );

    super( {
      children: [ container ]
    } );
  }
}