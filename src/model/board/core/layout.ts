import { Circle, Line, Node, TColor, Text } from 'phet-lib/scenery';
// @ts-expect-error
import cytoscape from '../../../lib/cytoscape/cytoscape.js';
// @ts-expect-error
import fcose from '../../../lib/cytoscape/cytoscape-fcose/src/index.js';
// @ts-expect-error
import coseBilkent from '../../../lib/cytoscape/cytoscape-cose-bilkent/index.js';
import { scene } from '../../../view/scene.ts';
import { Vector2 } from 'phet-lib/dot';
import { merge } from 'phet-lib/phet-core';
import { TState } from '../../data/core/TState.ts';
import { TFaceData } from '../../data/face/TFaceData.ts';
import { TEdgeData } from '../../data/edge/TEdgeData.ts';
import { TVertex } from './TVertex.ts';
import { TEdge } from './TEdge.ts';
import EdgeState from '../../data/edge/EdgeState.ts';
import { TSimpleRegionData } from '../../data/simple-region/TSimpleRegionData.ts';
import { LocalStorageBooleanProperty } from '../../../util/localStorage.ts';
import { TReadOnlyProperty } from 'phet-lib/axon';
import PuzzleModel from '../../puzzle/PuzzleModel.ts';
import { TBoard } from './TBoard.ts';
import { BaseHalfEdge } from './BaseHalfEdge.ts';
import { BaseEdge } from './BaseEdge.ts';
import { BaseFace } from './BaseFace.ts';
import { BaseVertex } from './BaseVertex.ts';
import { THalfEdge } from './THalfEdge.ts';
import { TFace } from './TFace.ts';
import { BaseBoard } from './BaseBoard.ts';
import assert, { assertEnabled } from '../../../workarounds/assert.ts';
import FaceState from '../../data/face/FaceState.ts';
import { validateBoard } from './validateBoard.ts';
import { getCentroid } from './createBoardDescriptor.ts';

cytoscape.use( fcose );
cytoscape.use( coseBilkent );

export const showLayoutTestProperty = new LocalStorageBooleanProperty( 'showLayoutTestProperty', false );

export type LayoutStructure = {
  HalfEdge: LayoutHalfEdge;
  Edge: LayoutEdge;
  Face: LayoutFace;
  Vertex: LayoutVertex;
};

export class LayoutHalfEdge extends BaseHalfEdge<LayoutStructure> {
  public constructor(
    layoutStart: LayoutVertex,
    layoutEnd: LayoutVertex,
    isReversed: boolean
  ) {
    super( layoutStart, layoutEnd, isReversed );
  }
}

export class LayoutEdge extends BaseEdge<LayoutStructure> {

  public originalEdges: Set<TEdge> = new Set();

  public constructor(
    layoutStart: LayoutVertex,
    layoutEnd: LayoutVertex
  ) {
    super( layoutStart, layoutEnd );
  }
}

export class LayoutFace extends BaseFace<LayoutStructure> {

  public originalFace: TFace | null = null;

  public constructor(
    logicalCoordinates: Vector2,
    viewCoordinates: Vector2
  ) {
    super( logicalCoordinates.copy(), viewCoordinates.copy() );
  }
}

export class LayoutVertex extends BaseVertex<LayoutStructure> {
  public constructor(
    logicalCoordinates: Vector2,
    viewCoordinates: Vector2
  ) {
    super( logicalCoordinates.copy(), viewCoordinates.copy() );
  }
}

export class LayoutPuzzle extends BaseBoard<LayoutStructure> {

  public edgeStateMap: Map<LayoutEdge, EdgeState> = new Map();
  public faceValueMap: Map<LayoutFace, FaceState> = new Map();

  public constructor(
    public readonly originalBoard: TBoard,
    public readonly originalState: TState<TFaceData & TEdgeData>
  ) {
    const vertexMap = new Map<TVertex, LayoutVertex>();
    const faceMap = new Map<TFace, LayoutFace>();
    const edgeMap = new Map<TEdge, LayoutEdge>();
    const halfEdgeMap = new Map<THalfEdge, LayoutHalfEdge>();

    const vertexReverseMap = new Map<LayoutVertex, TVertex>();
    const faceReverseMap = new Map<LayoutFace, TFace>();
    const edgeReverseMap = new Map<LayoutEdge, TEdge>();
    const halfEdgeReverseMap = new Map<LayoutHalfEdge, THalfEdge>();

    const getLayoutVertex = ( vertex: TVertex ) => {
      const layoutVertex = vertexMap.get( vertex );
      assertEnabled() && assert( layoutVertex );
      return layoutVertex!;
    };
    const getLayoutFace = ( face: TFace ) => {
      const layoutFace = faceMap.get( face );
      assertEnabled() && assert( layoutFace );
      return layoutFace!;
    };
    const getLayoutEdge = ( edge: TEdge ) => {
      const layoutEdge = edgeMap.get( edge );
      assertEnabled() && assert( layoutEdge );
      return layoutEdge!;
    };
    const getLayoutHalfEdge = ( halfEdge: THalfEdge ) => {
      const layoutHalfEdge = halfEdgeMap.get( halfEdge );
      assertEnabled() && assert( layoutHalfEdge );
      return layoutHalfEdge!;
    };

    const getOriginalVertex = ( layoutVertex: LayoutVertex ) => {
      const vertex = vertexReverseMap.get( layoutVertex );
      assertEnabled() && assert( vertex );
      return vertex!;
    };
    const getOriginalFace = ( layoutFace: LayoutFace ) => {
      const face = faceReverseMap.get( layoutFace );
      assertEnabled() && assert( face );
      return face!;
    };
    const getOriginalEdge = ( layoutEdge: LayoutEdge ) => {
      const edge = edgeReverseMap.get( layoutEdge );
      assertEnabled() && assert( edge );
      return edge!;
    };
    const getOriginalHalfEdge = ( layoutHalfEdge: LayoutHalfEdge ) => {
      const halfEdge = halfEdgeReverseMap.get( layoutHalfEdge );
      assertEnabled() && assert( halfEdge );
      return halfEdge!;
    };

    const vertices = originalBoard.vertices.map( vertex => {
      const layoutVertex = new LayoutVertex( vertex.logicalCoordinates, vertex.viewCoordinates );
      vertexMap.set( vertex, layoutVertex );
      vertexReverseMap.set( layoutVertex, vertex );
      return layoutVertex;
    } );
    const faces = originalBoard.faces.map( face => {
      const layoutFace = new LayoutFace( face.logicalCoordinates, face.viewCoordinates );
      faceMap.set( face, layoutFace );
      faceReverseMap.set( layoutFace, face );
      layoutFace.originalFace = face;
      return layoutFace;
    } );
    const halfEdges: LayoutHalfEdge[] = [];
    const edges = originalBoard.edges.map( edge => {
      const start = vertexMap.get( edge.start )!;
      const end = vertexMap.get( edge.end )!;
      assertEnabled() && assert( start );
      assertEnabled() && assert( end );

      const layoutEdge = new LayoutEdge( start, end );
      layoutEdge.originalEdges.add( edge );
      edgeMap.set( edge, layoutEdge );
      edgeReverseMap.set( layoutEdge, edge );

      const forwardHalf = new LayoutHalfEdge( start, end, false );
      halfEdgeMap.set( edge.forwardHalf, forwardHalf );
      halfEdgeReverseMap.set( forwardHalf, edge.forwardHalf );
      halfEdges.push( forwardHalf );

      const reversedHalf = new LayoutHalfEdge( end, start, true );
      halfEdgeMap.set( edge.reversedHalf, reversedHalf );
      halfEdgeReverseMap.set( reversedHalf, edge.reversedHalf );
      halfEdges.push( reversedHalf );

      return layoutEdge;
    } );

    vertices.forEach( layoutVertex => {
      const vertex = getOriginalVertex( layoutVertex );
      layoutVertex.incomingHalfEdges = vertex.incomingHalfEdges.map( getLayoutHalfEdge );
      layoutVertex.outgoingHalfEdges = vertex.outgoingHalfEdges.map( getLayoutHalfEdge );
      layoutVertex.edges = vertex.edges.map( getLayoutEdge );
      layoutVertex.faces = vertex.faces.map( getLayoutFace );
    } );

    faces.forEach( layoutFace => {
      const face = getOriginalFace( layoutFace );
      layoutFace.halfEdges = face.halfEdges.map( getLayoutHalfEdge );
      layoutFace.edges = face.edges.map( getLayoutEdge );
      layoutFace.vertices = face.vertices.map( getLayoutVertex );
    } );

    edges.forEach( layoutEdge => {
      const edge = getOriginalEdge( layoutEdge );
      layoutEdge.forwardHalf = getLayoutHalfEdge( edge.forwardHalf );
      layoutEdge.reversedHalf = getLayoutHalfEdge( edge.reversedHalf );
      layoutEdge.forwardFace = edge.forwardFace ? getLayoutFace( edge.forwardFace ) : null;
      layoutEdge.reversedFace = edge.reversedFace ? getLayoutFace( edge.reversedFace ) : null;
      layoutEdge.vertices = edge.vertices.map( getLayoutVertex );
      layoutEdge.faces = edge.faces.map( getLayoutFace );
    } );

    halfEdges.forEach( layoutHalfEdge => {
      const halfEdge = getOriginalHalfEdge( layoutHalfEdge );
      layoutHalfEdge.edge = getLayoutEdge( halfEdge.edge );
      layoutHalfEdge.reversed = getLayoutHalfEdge( halfEdge.reversed );
      layoutHalfEdge.next = getLayoutHalfEdge( halfEdge.next );
      layoutHalfEdge.previous = getLayoutHalfEdge( halfEdge.previous );
      layoutHalfEdge.face = halfEdge.face ? getLayoutFace( halfEdge.face ) : null;
    } );

    super( {
      edges: edges,
      vertices: vertices,
      faces: faces,
      halfEdges: halfEdges,

      // TODO: how to handle? We can just recompute after everything?
      outerBoundary: originalBoard.outerBoundary.map( getLayoutHalfEdge ),
      innerBoundaries: originalBoard.innerBoundaries.map( innerBoundary => innerBoundary.map( getLayoutHalfEdge ) )
    } );

    edges.forEach( layoutEdge => {
      this.edgeStateMap.set( layoutEdge, originalState.getEdgeState( getOriginalEdge( layoutEdge ) ) );
    } );

    faces.forEach( layoutFace => {
      this.faceValueMap.set( layoutFace, originalState.getFaceState( getOriginalFace( layoutFace ) ) );
    } );

    validateBoard( this );
  }

  private clearSatisfiedFaces(): void {
    this.faces.forEach( face => {

      const faceValue = this.faceValueMap.get( face );
      if ( faceValue === null ) {
        return;
      }

      let whiteCount = 0;
      let blackCount = 0;

      face.edges.forEach( edge => {
        const edgeState = this.edgeStateMap.get( edge );
        if ( edgeState === EdgeState.WHITE ) {
          whiteCount++;
        }
        else if ( edgeState === EdgeState.BLACK ) {
          blackCount++;
        }
      } );

      if ( whiteCount === 0 && blackCount === faceValue ) {
        this.faceValueMap.set( face, null );
      }
    } );
  }

  public simplify(): void {
    this.clearSatisfiedFaces();
  }

  // TODO: getCompleteState / getPuzzle / etc.

  public layout(): void {
    const vertexTagMap: Map<LayoutVertex, string> = new Map();

    this.vertices.forEach( ( vertex, index ) => {
      vertexTagMap.set( vertex, `v${index}` );
    } );

    // NOTE: could use cy.add, e.g.
    // cy.add( { data: { id: 'edgeid', source: 'node1', target: 'node2' } }
    const elements = [
      ...this.vertices.map( vertex => ( { data: { id: vertexTagMap.get( vertex ) } } ) ),
      ...this.edges.map( edge => ( {
        data: {
          id: `${vertexTagMap.get( edge.start )}-${vertexTagMap.get( edge.end )}`,
          source: vertexTagMap.get( edge.vertices[ 0 ] ),
          target: vertexTagMap.get( edge.vertices[ 1 ] )
        }
      } ) ),
      ...this.faces.flatMap( face => {
        const subElements: any[] = [];
        // For all non-adjacent vertices
        for ( let i = 0; i < face.edges.length; i++ ) {
          for ( let j = i + 2; j < face.edges.length; j++ ) {
            if ( i === 0 && j === face.edges.length - 1 ) {
              continue;
            }

            const start = face.edges[ i ].end;
            const end = face.edges[ j ].end;
            subElements.push( {
              data: {
                id: `${vertexTagMap.get( start )}-${vertexTagMap.get( end )}`,
                source: vertexTagMap.get( start ),
                target: vertexTagMap.get( end )
              }
            } );
          }
        }
        return subElements;
      } )
    ];

    const cy = cytoscape( {
      headless: true,
      elements: elements
    } );

    // cy.add( element );
    // cy.destroy() <--- to clean up memory!

    const vertexScale = 50;
    this.vertices.forEach( vertex => {
      cy.getElementById( vertexTagMap.get( vertex ) ).position( { x: vertexScale * vertex.viewCoordinates.x, y: vertexScale * vertex.viewCoordinates.y } );
    } );

    // coseCytoLayout( cy, { randomize: false } );
    // coseBilkentCytoLayout( cy, { randomize: true } );
    fcoseCytoLayout( cy, {
      randomize: false,
      nestingFactor: 5.5,
      tile: false
    } );

    this.vertices.forEach( vertex => {
      const position = cy.getElementById( vertexTagMap.get( vertex ) ).position();

      vertex.viewCoordinates.setXY( position.x / vertexScale, position.y / vertexScale );
    } );

    this.faces.forEach( face => {
      face.viewCoordinates.set( getCentroid( face.halfEdges.map( halfEdge => halfEdge.start.viewCoordinates ) ) );
    } );
  }

  public getDebugNode(): Node {
    // TODO: if we are still a planar-embedding, use a PuzzleNode?
    const debugNode = new Node();

    this.edges.forEach( edge => {
      const start = edge.start.viewCoordinates;
      const end = edge.end.viewCoordinates;

      let stroke: TColor;
      let lineWidth: number;
      const edgeState = this.edgeStateMap.get( edge );
      if ( edgeState === EdgeState.WHITE ) {
        stroke = 'black';
        lineWidth = 0.02;
      }
      else if ( edgeState === EdgeState.BLACK ) {
        stroke = 'black';
        lineWidth = 0.1;
      }
      else {
        stroke = 'red';
        lineWidth = 0.02;
      }

      debugNode.addChild( new Line( start, end, {
        stroke: stroke,
        lineWidth: lineWidth
      } ) );
    } );

    this.vertices.forEach( vertex => {
      debugNode.addChild( new Circle( 0.1, {
        x: vertex.viewCoordinates.x,
        y: vertex.viewCoordinates.y,
        fill: 'black'
      } ) );
    } );

    this.faces.forEach( face => {
      const faceValue = this.faceValueMap.get( face ) ?? null;
      if ( faceValue !== null ) {
        debugNode.addChild( new Text( faceValue, {
          maxWidth: 0.9,
          maxHeight: 0.9,
          center: face.viewCoordinates,
        } ) );
      }
    } );

    return debugNode;
  };
}

export const layoutTest = ( puzzleModelProperty: TReadOnlyProperty<PuzzleModel | null> ) => {

  const layoutTestNode = new Node( {
    scale: 0.4
  } );
  scene.addChild( layoutTestNode );

  const showPuzzleLayout = ( board: TBoard, state: TState<TFaceData & TEdgeData & TSimpleRegionData> ) => {

    const layoutPuzzle = new LayoutPuzzle( board, state );

    layoutPuzzle.simplify();
    layoutPuzzle.layout();

    const debugNode = layoutPuzzle.getDebugNode();

    const size = 600;

    debugNode.scale( Math.min( size / debugNode.width, size / debugNode.height ) );

    debugNode.left = 20;
    debugNode.top = 130;

    layoutTestNode.children = [ debugNode ];
    return;






    //
    // // const state = puzzle.stateProperty.value;
    //
    // // TODO: is cytoscape trying to keep the same edge distances?
    //
    // // simplified (somewhat?)
    // const whiteEdges = board.edges.filter( edge => state.getEdgeState( edge ) === EdgeState.WHITE );
    // const simpleRegions = state.getSimpleRegions();
    // const simplifiedVertices = board.vertices.filter( vertex => {
    //   return whiteEdges.some( edge => edge.vertices.includes( vertex ) ) ||
    //          simpleRegions.some( simpleRegion => simpleRegion.a === vertex || simpleRegion.b === vertex );
    // } );
    //
    // const vertexTagMap: Map<TVertex, string> = new Map();
    // const edgeTagMap: Map<TEdge, string> = new Map();
    // const regionTagMap: Map<TSimpleRegion, string> = new Map();
    //
    // simplifiedVertices.forEach( ( vertex, index ) => {
    //   vertexTagMap.set( vertex, `v${index}` );
    // } );
    // whiteEdges.forEach( ( edge, index ) => {
    //   edgeTagMap.set( edge, `e${index}` );
    // } );
    // simpleRegions.forEach( ( simpleRegion, index ) => {
    //   regionTagMap.set( simpleRegion, `r${index}` );
    // } );
    //
    // // NOTE: could use cy.add, e.g.
    // // cy.add( { data: { id: 'edgeid', source: 'node1', target: 'node2' } }
    // const elements = [
    //   ...simplifiedVertices.map( vertex => ( { data: { id: vertexTagMap.get( vertex ) } } ) ),
    //   ...whiteEdges.map( edge => ( {
    //     data: {
    //       id: edgeTagMap.get( edge ),
    //       source: vertexTagMap.get( edge.vertices[ 0 ] ),
    //       target: vertexTagMap.get( edge.vertices[ 1 ] )
    //     }
    //   } ) ),
    //   ...simpleRegions.map( simpleRegion => ( {
    //     data: {
    //       id: regionTagMap.get( simpleRegion ),
    //       source: vertexTagMap.get( simpleRegion.a ),
    //       target: vertexTagMap.get( simpleRegion.b )
    //     }
    //   } ) )
    // ];
    //
    // const cy = cytoscape( {
    //   headless: true,
    //   elements: elements
    // } );
    //
    // // cy.add( element );
    // // cy.destroy() <--- to clean up memory!
    //
    // const vertexScale = 20;
    // simplifiedVertices.forEach( vertex => {
    //   cy.getElementById( vertexTagMap.get( vertex ) ).position( { x: vertexScale * vertex.viewCoordinates.x, y: vertexScale * vertex.viewCoordinates.y } );
    // } );
    //
    // // coseCytoLayout( cy, { randomize: false } );
    // // coseBilkentCytoLayout( cy, { randomize: true } );
    // fcoseCytoLayout( cy, {
    //   randomize: false,
    //   nestingFactor: 5.5,
    //   tile: false
    // } );
    // /*
    //   nodeRepulsion: node => 4500,
    //   // Ideal edge (non nested) length
    //   idealEdgeLength: edge => 50,
    //   // Divisor to compute edge forces
    //   edgeElasticity: edge => 0.45,
    //   // Nesting factor (multiplier) to compute ideal edge length for nested edges
    //   nestingFactor: 0.1,
    //   // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
    //   numIter: 2500,
    //   // For enabling tiling
    //   tile: true,
    //  */
    //
    // whiteEdges.forEach( edge => {
    //   const source = cy.getElementById( vertexTagMap.get( edge.start ) ).position();
    //   const target = cy.getElementById( vertexTagMap.get( edge.end ) ).position();
    //
    //   const start = new Vector2( source.x, source.y );
    //   const end = new Vector2( target.x, target.y );
    //
    //   layoutTestNode.addChild( new Line( start, end, {
    //     stroke: 'black'
    //   } ) );
    // } );
    //
    // simpleRegions.forEach( simpleRegion => {
    //   const source = cy.getElementById( vertexTagMap.get( simpleRegion.a ) ).position();
    //   const target = cy.getElementById( vertexTagMap.get( simpleRegion.b ) ).position();
    //
    //   const start = new Vector2( source.x, source.y );
    //   const end = new Vector2( target.x, target.y );
    //
    //   layoutTestNode.addChild( new Line( start, end, {
    //     lineWidth: 5,
    //     stroke: 'black'
    //   } ) );
    // } );
    //
    // simplifiedVertices.forEach( vertex => {
    //   const position = cy.getElementById( vertexTagMap.get( vertex ) ).position();
    //
    //   layoutTestNode.addChild( new Circle( 4, {
    //     x: position.x,
    //     y: position.y,
    //     fill: 'black'
    //   } ) );
    // } );
    //
    // layoutTestNode.left = 10;
    // layoutTestNode.top = 100;
  };

  const puzzleStateListener = () => {
    layoutTestNode.children = [];

    if ( showLayoutTestProperty.value && puzzleModelProperty.value ) {
      showPuzzleLayout( puzzleModelProperty.value.puzzle.board, puzzleModelProperty.value.puzzle.stateProperty.value );
    }
  };
  puzzleModelProperty.lazyLink( puzzleStateListener );
  showLayoutTestProperty.lazyLink( puzzleStateListener );
  puzzleStateListener();

  puzzleModelProperty.link( ( newPuzzleModel, oldPuzzleModel ) => {
    if ( oldPuzzleModel ) {
      oldPuzzleModel.puzzle.stateProperty.unlink( puzzleStateListener );
    }
    if ( newPuzzleModel ) {
      newPuzzleModel.puzzle.stateProperty.link( puzzleStateListener );
    }
  } );
};

/*
  name: 'cose',

  // Called on `layoutready`
  ready: function(){},

  // Called on `layoutstop`
  stop: function(){},

  // Whether to animate while running the layout
  // true : Animate continuously as the layout is running
  // false : Just show the end result
  // 'end' : Animate with the end result, from the initial positions to the end positions
  animate: true,

  // Easing of the animation for animate:'end'
  animationEasing: undefined,

  // The duration of the animation for animate:'end'
  animationDuration: undefined,

  // A function that determines whether the node should be animated
  // All nodes animated by default on animate enabled
  // Non-animated nodes are positioned immediately when the layout starts
  animateFilter: function ( node, i ){ return true; },


  // The layout animates only after this many milliseconds for animate:true
  // (prevents flashing on fast runs)
  animationThreshold: 250,

  // Number of iterations between consecutive screen positions update
  refresh: 20,

  // Whether to fit the network view after when done
  fit: true,

  // Padding on fit
  padding: 30,

  // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  boundingBox: undefined,

  // Excludes the label when calculating node bounding boxes for the layout algorithm
  nodeDimensionsIncludeLabels: false,

  // Randomize the initial positions of the nodes (true) or use existing positions (false)
  randomize: false,

  // Extra spacing between components in non-compound graphs
  componentSpacing: 40,

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: function( node ){ return 2048; },

  // Node repulsion (overlapping) multiplier
  nodeOverlap: 4,

  // Ideal edge (non nested) length
  idealEdgeLength: function( edge ){ return 32; },

  // Divisor to compute edge forces
  edgeElasticity: function( edge ){ return 32; },

  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 1.2,

  // Gravity force (constant)
  gravity: 1,

  // Maximum number of iterations to perform
  numIter: 1000,

  // Initial temperature (maximum node displacement)
  initialTemp: 1000,

  // Cooling factor (how the temperature is reduced between consecutive iterations
  coolingFactor: 0.99,

  // Lower temperature threshold (below this point the layout will end)
  minTemp: 1.0
 */
export const coseCytoLayout = ( cy: any, options?: any ) => {
  const layout = cy.layout( merge( {
    name: 'cose',
    animate: false,
    quality: 'proof', // highest, of 'draft', 'default' or 'proof'
  }, options ) );
  layout.run();
};

/*
  // Called on `layoutready`
  ready: function () {
  },
  // Called on `layoutstop`
  stop: function () {
  },
  // 'draft', 'default' or 'proof"
  // - 'draft' fast cooling rate
  // - 'default' moderate cooling rate
  // - "proof" slow cooling rate
  quality: 'default',
  // Whether to include labels in node dimensions. Useful for avoiding label overlap
  nodeDimensionsIncludeLabels: false,
  // number of ticks per frame; higher is faster but more jerky
  refresh: 30,
  // Whether to fit the network view after when done
  fit: true,
  // Padding on fit
  padding: 10,
  // Whether to enable incremental mode
  randomize: true,
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal (intra-graph) edge length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for inter-graph edges
  nestingFactor: 0.1,
  // Gravity force (constant)
  gravity: 0.25,
  // Maximum number of iterations to perform
  numIter: 2500,
  // Whether to tile disconnected nodes
  tile: true,
  // Type of layout animation. The option set is {'during', 'end', false}
  animate: 'end',
  // Duration for animate:end
  animationDuration: 500,
  // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingVertical: 10,
  // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.5
 */
export const coseBilkentCytoLayout = ( cy: any, options?: any ) => {
  const layout = cy.layout( merge( {
    name: 'cose-bilkent',
    quality: 'proof',
    animate: false
  }, options ) );
  layout.run();
};

/*
  // 'draft', 'default' or 'proof'
  // - "draft" only applies spectral layout
  // - "default" improves the quality with incremental layout (fast cooling rate)
  // - "proof" improves the quality with incremental layout (slow cooling rate)
  quality: "default",
  // Use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  randomize: true,
  // Whether or not to animate the layout
  animate: true,
  // Duration of animation in ms, if enabled
  animationDuration: 1000,
  // Easing of animation, if enabled
  animationEasing: undefined,
  // Fit the viewport to the repositioned nodes
  fit: true,
  // Padding around layout
  padding: 30,
  // Whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: false,
  // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
  uniformNodeDimensions: false,
  // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
  packComponents: true,
  // Layout step - all, transformed, enforced, cose - for debug purpose only
  step: "all",

  /* spectral layout options

  // False for random, true for greedy sampling
  samplingType: true,
  // Sample size to construct distance matrix
  sampleSize: 25,
  // Separation amount between nodes
  nodeSeparation: 75,
  // Power iteration tolerance
  piTol: 0.0000001,

  /* incremental layout options

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: node => 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: edge => 50,
  // Divisor to compute edge forces
  edgeElasticity: edge => 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
  numIter: 2500,
  // For enabling tiling
  tile: true,
  // The comparison function to be used while sorting nodes during tiling operation.
  // Takes the ids of 2 nodes that will be compared as a parameter and the default tiling operation is performed when this option is not set.
  // It works similar to ``compareFunction`` parameter of ``Array.prototype.sort()``
  // If node1 is less then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a negative value
  // If node1 is greater then node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return a positive value
  // If node1 is equal to node2 by some ordering criterion ``tilingCompareBy(nodeId1, nodeId2)`` must return 0
  tilingCompareBy: undefined,
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity force (constant)
  gravity: 0.25,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.3,

  /* constraint options

  // Fix desired nodes to predefined positions
  // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
  fixedNodeConstraint: undefined,
  // Align desired nodes in vertical/horizontal direction
  // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
  alignmentConstraint: undefined,
  // Place two nodes relatively in vertical/horizontal direction
  // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
  relativePlacementConstraint: undefined,

  /* layout event callbacks
  ready: () => {}, // on layoutready
  stop: () => {} // on layoutstop
 */
export const fcoseCytoLayout = ( cy: any, options?: any ) => {
  const layout = cy.layout( merge( {
    name: 'fcose',
    quality: 'proof', // highest, of 'draft', 'default' or 'proof'
    animate: false
  }, options ) );
  layout.run();
};
