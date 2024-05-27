import { Circle, Node, NodeOptions, Path, Text } from 'phet-lib/scenery';
import { Shape } from 'phet-lib/kite';
import { optionize } from 'phet-lib/phet-core';
import { getCentroid } from '../../model/board/core/createBoardDescriptor.ts';
import { darkTheme, puzzleFont } from '../Theme.ts';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { FaceFeature } from '../../model/pattern/feature/FaceFeature.ts';
import { BlackEdgeFeature } from '../../model/pattern/feature/BlackEdgeFeature.ts';
import { RedEdgeFeature } from '../../model/pattern/feature/RedEdgeFeature.ts';
import { FaceColorDualFeature } from '../../model/pattern/feature/FaceColorDualFeature.ts';
import { SectorNotOneFeature } from '../../model/pattern/feature/SectorNotOneFeature.ts';
import { SectorNotTwoFeature } from '../../model/pattern/feature/SectorNotTwoFeature.ts';
import { SectorNotZeroFeature } from '../../model/pattern/feature/SectorNotZeroFeature.ts';
import { SectorOnlyOneFeature } from '../../model/pattern/feature/SectorOnlyOneFeature.ts';
import { FeatureSet } from '../../model/pattern/feature/FeatureSet.ts';
import { TPlanarPatternMap } from '../../model/pattern/pattern-board/planar-map/TPlanarPatternMap.ts';
import { TPatternBoard } from '../../model/pattern/pattern-board/TPatternBoard.ts';

type SelfOptions = {
  showQuestionMarks?: boolean;
  labels?: boolean;
  // TODO: face color matching for a previous pattern node
};

export type PatternNodeOptions = NodeOptions & SelfOptions;

export class PatternNode extends Node {
  public constructor(
    public readonly patternBoard: TPatternBoard,
    public readonly featureSet: FeatureSet,
    public readonly planarPatternMap: TPlanarPatternMap,
    providedOptions?: PatternNodeOptions
  ) {

    const options = optionize<PatternNodeOptions, SelfOptions, NodeOptions>()( {
      showQuestionMarks: true,
      labels: false
    }, providedOptions );

    const features = featureSet.getFeaturesArray();
    assertEnabled() && assert( planarPatternMap, 'planarPatternMap should be defined' );

    // TODO: move scale elsewhere?
    const container = new Node( {
      scale: 30
    } );

    // Face backgrounds
    const backgroundShape = new Shape();
    patternBoard.faces.forEach( face => {

      if ( face.isExit && face.edges.length < 2 ) {
        return;
      }

      const points = planarPatternMap.faceMap.get( face )!;
      backgroundShape.polygon( points );
    } );
    container.addChild( new Path( backgroundShape, {
      fill: '#000'
    } ) );

    // Face Color Features
    const hueLUT = [ 255, 160, 20, 96, 70, 230, 0 ];
    const primaryFaceColorShapes: Shape[] = hueLUT.map( () => new Shape() );
    const secondaryFaceColorShapes: Shape[] = hueLUT.map( () => new Shape() );
    ( features.filter( f => f instanceof FaceColorDualFeature ) as FaceColorDualFeature[] ).forEach( ( feature, i ) => {
      feature.primaryFaces.forEach( face => {
        const points = planarPatternMap.faceMap.get( face )!;
        primaryFaceColorShapes[ i % hueLUT.length ].polygon( points );
      } );

      feature.secondaryFaces.forEach( face => {
        const points = planarPatternMap.faceMap.get( face )!;
        secondaryFaceColorShapes[ i % hueLUT.length ].polygon( points );
      } );
    } );
    primaryFaceColorShapes.forEach( ( shape, i ) => {
      if ( shape.bounds.isFinite() ) {
        container.addChild( new Path( shape, {
          fill: darkTheme.faceColorLightHueLUTProperty.value[ hueLUT[ i ] ]
        } ) );
      }
    } );
    secondaryFaceColorShapes.forEach( ( shape, i ) => {
      if ( shape.bounds.isFinite() ) {
        container.addChild( new Path( shape, {
          fill: darkTheme.faceColorDarkHueLUTProperty.value[ hueLUT[ i ] ]
        } ) );
      }
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

    const allEdgesShape = new Shape();
    patternBoard.edges.forEach( edge => {
      if ( edge.isExit ) {
        return;
      }

      const points = planarPatternMap.edgeMap.get( edge )!;
      allEdgesShape.moveToPoint( points[ 0 ] );
      allEdgesShape.lineToPoint( points[ 1 ] );
    } );
    container.addChild( new Path( allEdgesShape, {
      stroke: 'rgba(255,255,255,0.2)',
      lineWidth: 0.01
    } ) );

    // TODO: collapse this a bit
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
          const string = faceFeature ? faceFeature.value!.toString() : ( options.showQuestionMarks ? '?' : '' );
          if ( string.length ) {
            const points = planarPatternMap.faceMap.get( face )!;
            const centroid = getCentroid( points );
            const text = new Text( string, {
              font: puzzleFont,
              centerX: centroid.x,
              centerY: centroid.y,
              fill: faceFeature ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
              maxWidth: 0.9,
              maxHeight: 0.9
            } );
            container.addChild( text );
          }
        }
      }
      else {
        // exit face
        const faceFeature = ( features.find( feature => feature instanceof FaceFeature && feature.face === face ) ?? null ) as FaceFeature | null;

        if ( faceFeature && faceFeature.value === null ) {
          const points = planarPatternMap.faceMap.get( face )!;
          const shape = Shape.polygon( points );

          container.addChild( new Path( shape, {
            stroke: '#666',
            lineWidth: 0.05,
            lineDash: [ 0.05, 0.05 ],
          } ) );
        }
      }
    } );

    // Exit Edge features
    // TODO: collapse these!
    patternBoard.edges.forEach( edge => {
      if ( edge.isExit ) {
        const edgeFeatures = features.filter( feature => ( feature instanceof BlackEdgeFeature || feature instanceof RedEdgeFeature ) && feature.edge === edge ) as ( BlackEdgeFeature | RedEdgeFeature )[];

        const exitVertex = edge.exitVertex!;

        edgeFeatures.forEach( feature => {
          const isBlack = feature instanceof BlackEdgeFeature;

          container.addChild( new Circle( 0.12, {
            center: planarPatternMap.vertexMap.get( exitVertex )!,
            lineWidth: 0.03,
            stroke: isBlack ? '#000' : '#f00' // TODO: factor out color?
          } ) );
        } );
      }
    } );

    // Non-exit Red Edge features
    const nonExitRedShape = new Shape();
    patternBoard.edges.forEach( edge => {
      if ( !edge.isExit ) {
        const edgeFeatures = features.filter( feature => feature instanceof RedEdgeFeature  && feature.edge === edge ) as RedEdgeFeature[];

        if ( edgeFeatures.length ) {
          const points = planarPatternMap.edgeMap.get( edge )!;
          nonExitRedShape.moveToPoint( points[ 0 ] );
          nonExitRedShape.lineToPoint( points[ 1 ] );
        }
      }
    } );
    container.addChild( new Path( nonExitRedShape, {
      stroke: '#f00',
      lineWidth: 0.05,
      lineCap: 'round'
    } ) );

    // Non-exit Black Edge features
    const nonExitBlackShape = new Shape();
    patternBoard.edges.forEach( edge => {
      if ( !edge.isExit ) {
        const edgeFeatures = features.filter( feature => feature instanceof BlackEdgeFeature && feature.edge === edge ) as BlackEdgeFeature[];

        if ( edgeFeatures.length ) {
          const points = planarPatternMap.edgeMap.get( edge )!;
          nonExitBlackShape.moveToPoint( points[ 0 ] );
          nonExitBlackShape.lineToPoint( points[ 1 ] );
        }
      }
    } );
    container.addChild( new Path( nonExitBlackShape, {
      stroke: '#fff',
      lineWidth: 0.1,
      lineCap: 'round'
    } ) );

    if ( options.labels ) {
      patternBoard.edges.forEach( edge => {
        if ( !edge.isExit ) {
          const points = planarPatternMap.edgeMap.get( edge )!;
          const centroid = points[ 0 ].average( points[ 1 ] );

          container.addChild( new Text( edge.index, {
            font: puzzleFont,
            center: centroid,
            fill: '#fa0',
            maxWidth: 0.4,
            maxHeight: 0.4
          } ) );
        }
      } );

      patternBoard.faces.forEach( face => {
        const isExit = face.isExit;

        const points = planarPatternMap.faceMap.get( face )!;
        let centroid = getCentroid( points );

        if ( isExit ) {
          const delta = centroid.minus( face.edges[ 0 ].vertices.map( vertex => planarPatternMap.vertexMap.get( vertex )! ).reduce( ( a, b ) => a.plus( b ) ).timesScalar( 1 / 2 ) );
          centroid = centroid.plus( delta.timesScalar( 1.5 ) );
        }

        container.addChild( new Text( face.index, {
          font: puzzleFont,
          center: centroid,
          fill: isExit ? '#0ff' : '#0f0',
          maxWidth: 0.4,
          maxHeight: 0.4
        } ) );
      } );

      patternBoard.vertices.forEach( vertex => {
        const point = planarPatternMap.vertexMap.get( vertex )!;

        container.addChild( new Text( vertex.index, {
          font: puzzleFont,
          center: point,
          fill: '#fff',
          maxWidth: 0.4,
          maxHeight: 0.4
        } ) );
      } );
    }

    options.children = [ container ];

    super( options );
  }
}