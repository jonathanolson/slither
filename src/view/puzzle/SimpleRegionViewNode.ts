import { Line, Node, Path, TPaint } from 'phet-lib/scenery';
import { TSimpleRegion } from '../../model/data/simple-region/TSimpleRegionData.ts';
import { Shape } from 'phet-lib/kite';
import { TEdge } from '../../model/board/core/TEdge.ts';
import { TReadOnlyProperty } from 'phet-lib/axon';
import { TState } from '../../model/data/core/TState.ts';
import { arrayDifference } from 'phet-lib/phet-core';
// @ts-expect-error
import { formatHex, toGamut } from 'culori';
import assert, { assertEnabled } from '../../workarounds/assert.ts';
import { edgeWeirdColorProperty } from '../Theme.ts';
import { BasicPuzzleNodeData } from './PuzzleNode.ts';

const toRGB = toGamut( 'rgb' );

export class SimpleRegionViewNode extends Node {

  private readonly simpleRegionNodeMap: Map<TSimpleRegion, SimpleRegionNode> = new Map();
  private readonly regionIdMap: Map<number, TSimpleRegion> = new Map();
  private readonly weirdEdgeNodeMap: Map<TEdge, Node> = new Map();

  private readonly regionContainer = new Node();
  private readonly weirdEdgeContainer = new Node();

  public constructor(
    stateProperty: TReadOnlyProperty<TState<BasicPuzzleNodeData>>
  ) {
    super( {
      pickable: false
    } );

    // TODO: disposal

    this.children = [ this.weirdEdgeContainer, this.regionContainer ];

    stateProperty.value.getSimpleRegions().forEach( simpleRegion => this.addRegion( simpleRegion ) );
    stateProperty.value.getWeirdEdges().forEach( edge => this.addWeirdEdge( edge ) );

    stateProperty.lazyLink( ( state, oldState ) => {

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
    } );
  }

  private addRegion( simpleRegion: TSimpleRegion ): void {
    // TODO: improved paints
    const paint = formatHex( toRGB( {
      mode: 'okhsl',
      h: Math.random() * 360,
      s: 0.7,
      l: 0.5
    } ) ) as unknown as string;
    const simpleRegionNode = new SimpleRegionNode( simpleRegion, paint );
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
    const simpleRegionNode = this.simpleRegionNodeMap.get( simpleRegion );
    this.regionContainer.removeChild( simpleRegionNode! );
    this.simpleRegionNodeMap.delete( simpleRegion );
    this.regionIdMap.delete( simpleRegion.id );
  }

  private addWeirdEdge( edge: TEdge ): void {
    const startPoint = edge.start.viewCoordinates;
    const endPoint = edge.end.viewCoordinates;
    const line = new Line( startPoint.x, startPoint.y, endPoint.x, endPoint.y, {
      lineWidth: 0.1,
      stroke: edgeWeirdColorProperty,
      lineCap: 'square'
    } );
    this.weirdEdgeNodeMap.set( edge, line );
    this.weirdEdgeContainer.addChild( line );
  }

  private removeWeirdEdge( edge: TEdge ): void {
    const node = this.weirdEdgeNodeMap.get( edge );
    this.weirdEdgeContainer.removeChild( node! );
    this.weirdEdgeNodeMap.delete( edge );
  }
}

// TODO: animation
class SimpleRegionNode extends Path {
  public constructor(
    public simpleRegion: TSimpleRegion,
    public readonly paint: TPaint
  ) {
    super( SimpleRegionNode.toShape( simpleRegion ), {
      stroke: paint,
      lineWidth: 0.1,
      lineCap: 'square',
      lineJoin: 'round'
    } );
  }

  public updateRegion( simpleRegion: TSimpleRegion ): void {
    this.shape = SimpleRegionNode.toShape( simpleRegion );
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