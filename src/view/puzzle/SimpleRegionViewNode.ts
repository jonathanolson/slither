import { Color, Line, Node, Path, TPaint } from 'phet-lib/scenery';
import { TSimpleRegion, TSimpleRegionData } from '../../model/data/simple-region/TSimpleRegionData.ts';
import { Shape } from 'phet-lib/kite';
import { TEdge } from '../../model/board/core/TEdge.ts';
import { DerivedProperty, TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { arrayDifference } from 'phet-lib/phet-core';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { TLineCap, TLineJoin } from '../Theme.ts';
import { dotRandom, Vector2 } from 'phet-lib/dot';
import { TFace } from '../../model/board/core/TFace.ts';
import { TBoard } from '../../model/board/core/TBoard.ts';
import { TPuzzleStyle } from './TPuzzleStyle.ts';
import { highlightIntersectionsProperty } from '../../model/puzzle/PuzzleModel.ts';

export class SimpleRegionViewNode extends Node {

  private readonly simpleRegionNodeMap: Map<TSimpleRegion, SimpleRegionNode> = new Map();
  private readonly regionIdMap: Map<number, TSimpleRegion> = new Map();
  private readonly weirdEdgeNodeMap: Map<TEdge, Node> = new Map();

  private readonly regionContainer = new Node();
  private readonly weirdEdgeContainer = new Node();

  private readonly adjacentFacesMap = new Map<TFace, TFace[]>;

  private readonly weirdEdgeColorProperty: TReadOnlyProperty<Color>;

  public constructor(
    public readonly board: TBoard,
    stateProperty: TReadOnlyProperty<TState<TSimpleRegionData>>,
    private readonly style: TPuzzleStyle
  ) {
    super( {
      pickable: false,

      // TODO: also kill computation if we are not visible?
      visibleProperty: style.edgesVisibleProperty
    } );

    this.weirdEdgeColorProperty = new DerivedProperty( [
      this.style.theme.edgeWeirdColorProperty,
      this.style.theme.blackLineColorProperty,
      highlightIntersectionsProperty,
    ], (
      edgeWeirdColor: Color,
      blackLineColor: Color,
      highlightIntersections: boolean
    ) => highlightIntersections ? edgeWeirdColor : blackLineColor );
    this.disposeEmitter.addListener( () => this.weirdEdgeColorProperty.dispose() );

    board.faces.forEach( face => {
      this.adjacentFacesMap.set( face, face.edges.map( edge => edge.getOtherFace( face ) ).filter( face => face !== null ) as TFace[] );
    } );

    this.children = [ this.weirdEdgeContainer, this.regionContainer ];

    stateProperty.value.getSimpleRegions().forEach( simpleRegion => this.addRegion( simpleRegion ) );
    stateProperty.value.getWeirdEdges().forEach( edge => this.addWeirdEdge( edge ) );
    this.updateHues();

    const stateListener = ( state: TState<TSimpleRegionData>, oldState: TState<TSimpleRegionData> ) => {

      const oldSimpleRegions = oldState.getSimpleRegions();
      const newSimpleRegions = state.getSimpleRegions();

      const oldWeirdEdges = oldState.getWeirdEdges();
      const newWeirdEdges = state.getWeirdEdges();

      const onlyOldRegions: TSimpleRegion[] = [];
      const onlyNewRegions: TSimpleRegion[] = [];
      const inBothRegions: TSimpleRegion[] = [];

      arrayDifference( oldSimpleRegions, newSimpleRegions, onlyOldRegions, onlyNewRegions, inBothRegions );

      const removals = new Set( onlyOldRegions );

      // Handle additions first, so we can abuse our regionIdMap to handle replacements
      for ( const region of onlyNewRegions ) {
        if ( this.regionIdMap.has( region.id ) ) {
          const oldRegion = this.regionIdMap.get( region.id )!;
          this.replaceRegion( oldRegion, region );
          removals.delete( oldRegion ); // don't remove it!
        }
        else {
          this.addRegion( region );
        }
      }

      for ( const region of removals ) {
        this.removeRegion( region );
      }

      for ( const edge of oldWeirdEdges ) {
        if ( !newWeirdEdges.includes( edge ) ) {
          this.removeWeirdEdge( edge );
        }
      }

      for ( const edge of newWeirdEdges ) {
        if ( !oldWeirdEdges.includes( edge ) ) {
          this.addWeirdEdge( edge );
        }
      }

      if ( onlyNewRegions.length || onlyOldRegions.length ) {
        this.updateHues();
      }
    };
    stateProperty.lazyLink( stateListener );
    this.disposeEmitter.addListener( () => stateProperty.unlink( stateListener ) );

    this.disposeEmitter.addListener( () => {
      while ( this.simpleRegionNodeMap.size ) {
        this.removeRegion( this.simpleRegionNodeMap.keys().next().value );
      }
    } );

    const updateHueListener = () => this.updateHues();
    style.theme.simpleRegionHueLUTProperty.link( updateHueListener );
    style.edgesHaveColorsProperty.lazyLink( updateHueListener );
    this.disposeEmitter.addListener( () => {
      style.theme.simpleRegionHueLUTProperty.unlink( updateHueListener );
      style.edgesHaveColorsProperty.unlink( updateHueListener );
    } );
  }

  private addRegion( simpleRegion: TSimpleRegion ): void {
    const simpleRegionNode = new SimpleRegionNode( simpleRegion, this.style );
    this.simpleRegionNodeMap.set( simpleRegion, simpleRegionNode );
    this.regionIdMap.set( simpleRegion.id, simpleRegion );
    this.regionContainer.addChild( simpleRegionNode );
  }

  private replaceRegion( oldSimpleRegion: TSimpleRegion, newSimpleRegion: TSimpleRegion ): void {
    assertEnabled() && assert( oldSimpleRegion.id === newSimpleRegion.id );

    const simpleRegionNode = this.simpleRegionNodeMap.get( oldSimpleRegion );
    simpleRegionNode!.updateRegion( newSimpleRegion );
    this.simpleRegionNodeMap.delete( oldSimpleRegion );
    this.simpleRegionNodeMap.set( newSimpleRegion, simpleRegionNode! );
    this.regionIdMap.delete( oldSimpleRegion.id ); // OR we could just immediately replace it. This seems safer
    this.regionIdMap.set( newSimpleRegion.id, newSimpleRegion );
  }

  private removeRegion( simpleRegion: TSimpleRegion ): void {
    const simpleRegionNode = this.simpleRegionNodeMap.get( simpleRegion )!;
    this.regionContainer.removeChild( simpleRegionNode );
    this.simpleRegionNodeMap.delete( simpleRegion );
    this.regionIdMap.delete( simpleRegion.id );
    simpleRegionNode.dispose();
  }

  private addWeirdEdge( edge: TEdge ): void {
    const startPoint = edge.start.viewCoordinates;
    const endPoint = edge.end.viewCoordinates;
    const line = new Line( startPoint.x, startPoint.y, endPoint.x, endPoint.y, {
      lineWidth: 0.1,
      stroke: this.weirdEdgeColorProperty,
    } );

    // line cap
    {
      const capListener = ( cap: TLineCap ) => {
        line.lineCap = cap;
      };
      this.style.joinedLinesCapProperty.link( capListener );
      line.disposeEmitter.addListener( () => this.style.joinedLinesCapProperty.unlink( capListener ) );
    }

    this.weirdEdgeNodeMap.set( edge, line );
    this.weirdEdgeContainer.addChild( line );
  }

  private removeWeirdEdge( edge: TEdge ): void {
    const node = this.weirdEdgeNodeMap.get( edge )!;
    node.dispose();
    this.weirdEdgeNodeMap.delete( edge );
  }

  // Force-directed balancing of hues.
  private updateHues(): void {

    // TODO: improve perf?
    const simpleRegionNodes = [ ...this.simpleRegionNodeMap.values() ];

    if ( simpleRegionNodes.length < 2 ) {
      return;
    }

    const scratchHue = new Vector2( 0, 0 );

    const renormalizeHues = () => {
      // Weighted hue normalize (in prep for other actions?)
      for ( const simpleRegionNode of simpleRegionNodes ) {
        if ( simpleRegionNode.hueVector.getMagnitude() > 1e-6 ) {
          simpleRegionNode.hueVector.normalize();
        }
        else {
          simpleRegionNode.hueVector.setXY( 1, 0 );
        }
      }
    };

    // TODO: cache this data? (hah, does it really not matter for performance?)
    const faceToSimpleRegionMap = new Map<TFace, SimpleRegionNode[]>();
    const pairWeights: { a: SimpleRegionNode; b: SimpleRegionNode; weight: number }[] = [];
    this.board.faces.forEach( face => {
      faceToSimpleRegionMap.set( face, [] );
    } );
    for ( const simpleRegionNode of simpleRegionNodes ) {
      const primaryFaceSet = new Set<TFace>();
      for ( const edge of simpleRegionNode.simpleRegion.edges ) {
        for ( const face of edge.faces ) {
          primaryFaceSet.add( face );
        }
      }
      const finalSet = new Set<TFace>();
      for ( const face of primaryFaceSet ) {
        finalSet.add( face );
        for ( const adjacentFace of this.adjacentFacesMap.get( face )! ) {
          finalSet.add( adjacentFace );
        }
      }
      for ( const face of finalSet ) {
        const simpleRegionNodes = faceToSimpleRegionMap.get( face )!;

        if ( simpleRegionNodes.length ) {
          for ( const otherSimpleRegionNode of simpleRegionNodes ) {
            let found = false;
            for ( const pairWeight of pairWeights ) {
              if ( pairWeight.a === otherSimpleRegionNode && pairWeight.b === simpleRegionNode ) {
                pairWeight.weight++;
                found = true;
                break;
              }
            }
            if ( !found ) {
              pairWeights.push( {
                a: otherSimpleRegionNode,
                b: simpleRegionNode,
                weight: 1
              } );
            }
          }
        }

        simpleRegionNodes.push( simpleRegionNode );
      }
    }

    // Initialize forces
    const forces = new Map<SimpleRegionNode, Vector2>();
    for ( const simpleRegionNode of simpleRegionNodes ) {
      forces.set( simpleRegionNode, Vector2.ZERO.copy() );
    }

    const repulse = ( a: SimpleRegionNode, b: SimpleRegionNode, multiplier: number ) => {
      const forceA = forces.get( a )!;
      const forceB = forces.get( b )!;

      const dot = a.hueVector.dot( b.hueVector );
      const diff = scratchHue.set( b.hueVector ).subtract( a.hueVector );
      if ( diff.magnitude > 1e-9 ) {
        diff.normalize();

        const zero = 0.3;
        const power = multiplier * ( ( ( Math.max( zero, dot ) - zero ) / ( 1 - zero ) ) ** 3 );
        diff.multiplyScalar( power );

        forceA.subtract( diff );
        forceB.add( diff );
      }
    };

    let amount = 1;
    for ( let i = 0; i < 100; i++ ) {
      amount *= 0.99;

      // Clear forces
      for ( const simpleRegionNode of simpleRegionNodes ) {
        forces.get( simpleRegionNode )!.setXY( 0, 0 );
      }

      // Location-based forces
      for ( const pairWeight of pairWeights ) {
        const a = pairWeight.a;
        const b = pairWeight.b;
        const weight = pairWeight.weight;
        repulse( a, b, weight );
      }

      // All-region repulsion (if we don't have that many)
      if ( simpleRegionNodes.length < 8 ) {
        for ( let i = 0; i < simpleRegionNodes.length; i++ ) {
          const a = simpleRegionNodes[ i ];
          for ( let j = i + 1; j < simpleRegionNodes.length; j++ ) {
            repulse( a, simpleRegionNodes[ j ], 0.2 );
          }
        }
      }

      // Apply forces
      for ( const simpleRegionNode of simpleRegionNodes ) {
        const force = forces.get( simpleRegionNode )!;

        // TODO: maybe avoid this?
        force.multiplyScalar( amount / simpleRegionNode.edgeCount );

        simpleRegionNode.hueVector.add( force );
        forces.get( simpleRegionNode )!.setXY( 0, 0 );
      }

      renormalizeHues();
    }

    for ( const simpleRegionNode of simpleRegionNodes ) {
      simpleRegionNode.updateHue();
    }
  }
}

// TODO: animation
class SimpleRegionNode extends Path {

  public readonly hueVector: Vector2;
  public edgeCount: number;

  public constructor(
    public simpleRegion: TSimpleRegion,
    public readonly style: TPuzzleStyle
  ) {
    const hueVector = Vector2.createPolar( 1, dotRandom.nextDoubleBetween( 0, 2 * Math.PI ) );

    super( SimpleRegionNode.toShape( simpleRegion ), {
      stroke: SimpleRegionNode.hueVectorToPaint( hueVector, style ),
      lineWidth: 0.1,
      lineCap: 'square',
      lineJoin: 'round'
    } );

    this.hueVector = hueVector;
    this.edgeCount = simpleRegion.edges.length;

    const joinListener = ( join: TLineJoin ) => {
      this.lineJoin = join;
    };
    style.joinedLinesJoinProperty.link( joinListener );
    this.disposeEmitter.addListener( () => style.joinedLinesJoinProperty.unlink( joinListener ) );

    const capListener = ( cap: TLineCap ) => {
      // TODO: more cap styles
      this.lineCap = cap;
    };
    style.joinedLinesCapProperty.link( capListener );
    this.disposeEmitter.addListener( () => style.joinedLinesCapProperty.unlink( capListener ) );
  }

  public updateHue(): void {
    // if we have effectively zero magnitude, just use the x-axis
    this.stroke = SimpleRegionNode.hueVectorToPaint( this.hueVector.getMagnitude() > 1e-6 ? this.hueVector : Vector2.X_UNIT, this.style );
  }

  public updateRegion( simpleRegion: TSimpleRegion ): void {
    this.simpleRegion = simpleRegion;
    this.shape = SimpleRegionNode.toShape( simpleRegion );
    this.edgeCount = simpleRegion.edges.length;
  }

  public static hueVectorToPaint( hueVector: Vector2, style: TPuzzleStyle ): TPaint {
    const hueLUT = style.theme.simpleRegionHueLUTProperty.value;

    const index = ( Math.round( hueVector.getAngle() * 180 / Math.PI ) + 360 ) % 360;
    assertEnabled() && assert( index >= 0 && index < hueLUT.length );

    const showHues = style.edgesHaveColorsProperty.value;

    return showHues ? hueLUT[ index ] : style.theme.blackLineColorProperty;
  }

  public static toShape( simpleRegion: TSimpleRegion ): Shape {
    const shape = new Shape();

    let first = true;
    for ( const halfEdge of simpleRegion.halfEdges ) {
      if ( first ) {
        first = false;
        shape.moveToPoint( halfEdge.start.viewCoordinates );
      }
      shape.lineToPoint( halfEdge.end.viewCoordinates );
    }

    if ( simpleRegion.isSolved ) {
      shape.close();
    }

    return shape.makeImmutable();
  }
}